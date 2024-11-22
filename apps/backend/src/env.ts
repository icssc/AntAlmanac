import { type } from 'arktype';
import * as dotenv from 'dotenv';

dotenv.config();

const Environment = type({
    'NODE_ENV?': "'development' | 'production' | 'staging'",
    USERDATA_TABLE_NAME: 'string',
    AWS_REGION: 'string',
    MAPBOX_ACCESS_TOKEN: 'string',
    'PR_NUM?': 'number',
    DB_URL: 'string',
    STAGE: "string",
});

const env = Environment.assert({ ...process.env });

export default env;
