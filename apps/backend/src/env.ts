import { type } from 'arktype';
import 'dotenv/config';

const Environment = type({
    'NODE_ENV?': "'development' | 'production' | 'staging'",
    USERDATA_TABLE_NAME: 'string',
    AUTH_USERDATA_TABLE_NAME: 'string',
    AA_MONGODB_URI: 'string',
    AWS_REGION: 'string',
    MAPBOX_ACCESS_TOKEN: 'string',
    'PR_NUM?': 'number',
});

const env = Environment.assert({ ...process.env });

export default env;
