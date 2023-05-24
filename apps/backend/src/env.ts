import { type } from 'arktype';

import { config } from 'dotenv';

config({ path: '../../.env' })

const Environment = type([
    {
        'STAGE?': "'dev' | 'prod' | 'staging'",
        USERDATA_TABLE_NAME: 'string',
        AA_MONGODB_URI: 'string',
        'GOOGLE_CLIENT_ID': 'string',
        'GOOGLE_CLIENT_SECRET': 'string',
        'PR_NUM?': 'number',
    },
    '|>',
    (s) => ({ STAGE: 'dev', ...s }),
]);

const env = Environment.assert(process.env);

export default env;
