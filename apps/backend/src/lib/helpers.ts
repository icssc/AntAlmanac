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

    if (!res.ok || json.data === null) return null;

    return json as Promise<PromiseReturnType>;
}