import { TRPCError } from '@trpc/server';

export async function fetchAnteaterAPI(
    url: string,
    headersOverride: NonNullable<Parameters<typeof fetch>[1]>['headers'] | null = null
): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(url, {
            headers:
                headersOverride === null
                    ? {
                          ...(process.env.ANTEATER_API_KEY && {
                              Authorization: `Bearer ${process.env.ANTEATER_API_KEY}`,
                          }),
                      }
                    : headersOverride,
        });
    } catch (err) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to reach the Anteater API: ${err}`,
        });
    }

    if (!response.ok) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Anteater API returned an error: ${response.status} ${response.statusText}`,
        });
    }
    return response;
}

export async function fetchAnteaterAPIData<Data>(
    url: string,
    headersOverride: NonNullable<Parameters<typeof fetch>[1]>['headers'] | null = null
): Promise<Data> {
    const response = await fetchAnteaterAPI(url, headersOverride);

    try {
        return await response.json();
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
