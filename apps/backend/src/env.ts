import { type } from 'arktype';

import { config } from 'dotenv';

config({ path: '.env' });

const Environment = type([
    {
        'STAGE?': "'dev' | 'prod' | 'staging' | 'local'",
        USERDATA_TABLE_NAME: 'string',
        AUTH_USERDATA_TABLE_NAME: 'string',
        AA_MONGODB_URI: 'string',
        GOOGLE_CLIENT_ID: 'string',
        GOOGLE_CLIENT_SECRET: 'string',
        AWS_REGION: 'string',
        'PR_NUM?': 'number',
    },
    '|>',
    (s) => ({ STAGE: 'local', ...s }),
]);

const env = Environment.assert(process.env);

export default env;
