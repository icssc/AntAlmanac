import { scanAndNotify } from '.';

export async function handler() {
    await scanAndNotify();

    return {
        statusCode: 200,
        body: JSON.stringify('Success'),
    };
}
