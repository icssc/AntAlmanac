// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

function isStaging(stage: string) {
  return stage.match(/^staging-(\d+)$/);
}

function isPeterPortalLegacy(stage: string) {
  return stage === 'peterportal-legacy';
}

/**
 * Obtains the correct router based on the stage.
 * Staging instances use new routers, while dev and prod use their respective shared routers.
 */
function createOrGetRouter() {
  if ($app.stage === 'prod') {
    const sharedRouter = sst.aws.Router.get('AntAlmanacRouter', 'E3RQWX02OHXETG');
    return sharedRouter;
  } else if ($app.stage === 'staging-shared') {
    const sharedRouter = sst.aws.Router.get('AntAlmanacRouter', 'E22N9YXZNTVOMR');
    return sharedRouter;
  } else if (isStaging($app.stage)) {
    const stagingRouter = new sst.aws.Router('AntAlmanacRouter', {
      domain: getDomainConfig(),
      transform: {
        cachePolicy(_, opts) {
          opts.id = '92d18877-845e-47e7-97e6-895382b1bf7c';
        },
      },
    });
    return stagingRouter;
  } else if (isPeterPortalLegacy($app.stage)) {
    // For peterportal-legacy, we don't need to return a router since we handle it differently
    throw new Error('peterportal-legacy stage should not call createOrGetRouter');
  } else {
    throw new Error('Invalid stage');
  }
}

function getDomainConfig() {
  let domainName: string;
  let domainRedirects: string[] | undefined;
  if ($app.stage === 'prod') {
    domainName = 'antalmanac.com';
    domainRedirects = ['www.antalmanac.com'];
  } else if ($app.stage === 'staging-shared') {
    domainName = 'staging-shared.antalmanac.com';
  } else if (isStaging($app.stage)) {
    // if stage is like staging-###, use planner-###
    const subdomainPrefix = $app.stage.replace('staging-', 'planner-');
    domainName = `${subdomainPrefix}.antalmanac.com`;
  } else if (isPeterPortalLegacy($app.stage)) {
    domainName = 'peterportal.org';
    domainRedirects = ['www.peterportal.org'];
  } else {
    throw new Error('Invalid stage');
  }
  return { name: domainName, redirects: domainRedirects };
}

function createTrpcLambdaFunction() {
  const domainName = getDomainConfig().name;
  const productionDomain = `https://${domainName}`;

  const environment = {
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    PUBLIC_API_URL: process.env.PUBLIC_API_URL!,
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID!,
    OIDC_ISSUER_URL: process.env.OIDC_ISSUER_URL!,
    PRODUCTION_DOMAIN: productionDomain, // Dynamically set based on stage
    ADMIN_EMAILS: process.env.ADMIN_EMAILS!,
    NODE_ENV: process.env.NODE_ENV ?? 'staging',
    ANTEATER_API_KEY: process.env.ANTEATER_API_KEY!,
    EXTERNAL_USER_READ_SECRET: process.env.EXTERNAL_USER_READ_SECRET!,
    OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS!,
    // hardcoded OTEL options
    ...($app.stage === 'prod' && {
      AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
      NODE_OPTIONS: '--require @opentelemetry/auto-instrumentations-node/register',
      OTEL_SERVICE_NAME: 'peterportal-backend',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'https://ingress.us-west-2.aws.dash0.com',
    }),
  };

  return new sst.aws.Function('PeterPortal-Backend', {
    handler: 'api/src/app.handler',
    memory: '256 MB',
    runtime: 'nodejs22.x',
    logging: {
      retention: $app.stage === 'prod' ? '2 years' : '1 week',
    },
    environment,
    url: true,
    layers: ['arn:aws:lambda:us-west-1:184161586896:layer:opentelemetry-nodejs-0_13_0:1'],
    nodejs: {
      install: ['@opentelemetry/auto-instrumentations-node'],
    },
  });
}

enum AWSPolicyId {
  // See https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html
  CachingDisabled = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
  // See https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html
  AllViewerExceptHostHeader = 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
  // The existing cache policy for PeterPortal's Next.js builds
  OrgNextjsCachePolicy = '0fddd706-8cdb-4835-bf8c-3202baed7dac',
}

function createNextJsApplication(router: sst.aws.Router) {
  // The Nextjs Site Name must not have spaces; unlike static sites, this name
  // gets prepended in CreatePolicy, so it must meet these requirements:
  // https://docs.aws.amazon.com/IAM/latest/APIReference/API_CreatePolicy.html
  return new sst.aws.Nextjs('PeterPortal-Site', {
    router: {
      instance: router,
      path: '/planner',
    },
    environment: {
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      BACKEND_ROOT_URL: `https://${getDomainConfig().name}/planner/api`,
    },
    cachePolicy: AWSPolicyId.OrgNextjsCachePolicy,
    path: './site',
  });
}

export default $config({
  app(input) {
    return {
      name: 'peterportal-client',
      removal: input?.stage === 'prod' ? 'retain' : 'remove',
      home: 'aws',
      providers: { aws: { region: 'us-west-1' } },
    };
  },

  async run() {
    // Handle peterportal-legacy stage: redirect all traffic from peterportal.org/* to antalmanac.com/planner/*
    if (isPeterPortalLegacy($app.stage)) {
      // Lambda function to dynamically redirect requests to antalmanac.com/planner/*
      const redirectFunction = new sst.aws.Function('PPRedirect', {
        runtime: 'nodejs22.x',
        memory: '128 MB',
        handler: 'infra/redirect-handler.handler',
        url: true,
      });

      new sst.aws.Router('PPLegacyRouter', {
        domain: getDomainConfig(),
        routes: {
          '/*': redirectFunction.url,
        },
        transform: {
          cachePolicy(_, opts) {
            opts.id = '92d18877-845e-47e7-97e6-895382b1bf7c';
          },
        },
      });

      return;
    }

    const lambdaFunction = createTrpcLambdaFunction();

    const router = createOrGetRouter();

    router.route('/planner/api', lambdaFunction.url);

    createNextJsApplication(router);

    // Add root redirect for staging environments after Next.js app is attached
    if (isStaging($app.stage)) {
      router.route('/', `https://${getDomainConfig().name}/planner`);
    }
  },
});
