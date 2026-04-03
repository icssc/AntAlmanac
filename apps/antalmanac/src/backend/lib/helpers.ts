import { TRPCError } from '@trpc/server';

interface FetchAAPIOptions {
    isApiKeyRequired?: boolean;
    invalidResponseCallback?: null | ((response: Response) => void);
    headers?: NonNullable<Parameters<typeof fetch>[1]>['headers'] | null;
}

/**
 * Fetches AAPI data and throws errors with descriptive messages.
 *
 * @param url AAPI url to fetch from.
 * @param options.isApiKeyRequired Throw an error if AAPI API key is invalid?
 * @param options.invalidResponseCallback Function that is called when a response is invalid.
 *        If this callback does not throw an error, one with a generic message will be thrown automatically.
 * @param options.headers Headers to pass in addition or to replace default headers.
 * @returns The response's data.
 */
export async function fetchAnteaterAPI<DataType>(
    url: string,
    { isApiKeyRequired = false, invalidResponseCallback = null, headers = null }: FetchAAPIOptions = {}
) {
    if (isApiKeyRequired && !process.env.ANTEATER_API_KEY) {
        throw new Error('ANTEATER_API_KEY is required');
    }

    let response: Response;
    try {
        response = await fetch(url, {
            headers: {
                ...(process.env.ANTEATER_API_KEY && {
                    Authorization: `Bearer ${process.env.ANTEATER_API_KEY}`,
                }),
                ...headers,
            },
        });
    } catch (err) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to reach the Anteater API: ${err}`,
        });
    }

    if (!response.ok) {
        if (invalidResponseCallback !== null) {
            invalidResponseCallback(response);
        }
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Anteater API returned an error: ${response.status} ${response.statusText}`,
        });
    }

    try {
        return (await response.json()) as DataType;
    } catch (err) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to parse Anteater API response: ${err}`,
        });
    }
}

export async function queryGraphQL<PromiseReturnType>(queryString: string): Promise<PromiseReturnType | null> {
    const query = JSON.stringify({
        query: queryString,
    });

    const res = await fetch('https://anteaterapi.com/v2/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: query,
    });

    const json = await res.json();

    if (!res.ok || json.data === null) {
        return null;
    }

    return json as Promise<PromiseReturnType>;
}

export async function queryHTTPS<PromiseReturnType>(
    params: URLSearchParams,
    headers?: Record<string, string>
): Promise<PromiseReturnType | null> {
    const res = await fetch(`https://anteaterapi.com/v2/rest/websoc?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...headers,
        },
    });

    const json = await res.json();

    if (!res.ok || json.data === null) {
        return null;
    }

    return json as PromiseReturnType;
}
