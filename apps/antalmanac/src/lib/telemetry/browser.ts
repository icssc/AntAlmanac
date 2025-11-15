import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { ZoneContextManager } from '@opentelemetry/context-zone';

const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

const provider = new WebTracerProvider({
  spanProcessors: [new BatchSpanProcessor(exporter)],
});

provider.register({
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  contextManager: new ZoneContextManager(),
});

// Registering instrumentations
registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations({
    '@opentelemetry/instrumentation-fetch': {
        propagateTraceHeaderCorsUrls: /.*/, // add AAPI
      },
      '@opentelemetry/instrumentation-xml-http-request': { enabled: true },
      '@opentelemetry/instrumentation-user-interaction': { enabled: true },
      '@opentelemetry/instrumentation-document-load': { enabled: true },
  })],
});