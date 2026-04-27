import { TRPCError } from '@trpc/server';

interface FetchAAPIOptions {
    isApiKeyRequired?: boolean;
    invalidResponseCallback?: null | ((response: Response) => void);
    headers?: NonNullable<Parameters<typeof fetch>[1]>['headers'] | null;
    errorType?: 'base' | 'trpc';
}

/**
 * Fetches AAPI data and throws errors with descriptive messages.
 *
 * @param url AAPI url to fetch from.
 * @param options.isApiKeyRequired Throw an error if AAPI API key is invalid?
 * @param options.invalidResponseCallback Function that is called when a response is invalid.
 *        If this callback does not throw an error, one with a generic message will be thrown automatically.
 * @param options.headers Headers to pass in addition or to replace default headers.
 * @param options.errorType The type of error to throw. Defaults to `base`.
 * @returns The response's data.
 */
export async function fetchAnteaterAPI<DataType>(
    url: string,
    {
        isApiKeyRequired = false,
        invalidResponseCallback = null,
        headers = null,
        errorType = 'base',
    }: FetchAAPIOptions = {}
) {
    if (isApiKeyRequired && !process.env.ANTEATER_API_KEY) {
        throw getErrorByType(errorType, 'ANTEATER_API_KEY is required');
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
        throw getErrorByType(errorType, `Failed to reach the Anteater API: ${err}`);
    }

    if (!response.ok) {
        if (invalidResponseCallback !== null) {
            invalidResponseCallback(response);
        }
        throw getErrorByType(errorType, `Anteater API returned an error: ${response.status} ${response.statusText}`);
    }

    try {
        return (await response.json()) as DataType;
    } catch (err) {
        throw getErrorByType(errorType, `Failed to parse Anteater API response: ${err}`);
    }
}

export function getErrorByType(errorType: FetchAAPIOptions['errorType'], message: string) {
    switch (errorType) {
        case 'trpc':
            return new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: message,
            });
        case 'base':
        default:
            return new Error(message);
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

export const getCookiesFromHeader = (headers: Headers) => {
    const cookieHeader = headers.get('cookie') ?? '';
    const cookies = Object.fromEntries(
        cookieHeader
            .split('; ')
            .filter((c) => c.includes('='))
            .map((c) => {
                const [key, ...v] = c.split('=');
                return [key, v.join('=')];
            })
    );
    return cookies;
};
