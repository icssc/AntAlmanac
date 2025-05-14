import { scanAndNotify } from '.';

export async function handler() {
    // run the script
    await scanAndNotify();

    // return response
    return {
        statusCode: 200,
        body: JSON.stringify('Success'),
    };
}
