import { type } from 'arktype';
import 'dotenv/config';

const Environment = type([
    {
        'STAGE?': "'dev' | 'prod' | 'staging'",
        USERDATA_TABLE_NAME: 'string',
        AA_MONGODB_URI: 'string',
        'PR_NUM?': 'number',
    },
    '|>',
    (s) => ({ STAGE: 'dev', ...s }),
]);
const env = Environment.assert(process.env);

export default env;
