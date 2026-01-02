import { scanAndNotify } from '.';

export async function handler() {
    // No-op function
    const noop = () => {};
    await scanAndNotify();

    return {
        statusCode: 200,
        body: JSON.stringify('Success'),
    };
}
