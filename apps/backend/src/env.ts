import { type } from 'arktype';
import 'dotenv/config';

const Environment = type([
    {
        'STAGE?': "'dev' | 'prod' | 'staging' | 'local'",
        AUTH_USERDATA_TABLE_NAME: 'string',
        USERDATA_TABLE_NAME: 'string',
        AA_MONGODB_URI: 'string',
        AWS_REGION: 'string',
        MAPBOX_ACCESS_TOKEN: 'string',
        'PR_NUM?': 'number',
    },
    '|>',
    (s) => ({ STAGE: 'local', ...s }),
]);
const env = Environment.assert({ ...process.env });

export default env;
