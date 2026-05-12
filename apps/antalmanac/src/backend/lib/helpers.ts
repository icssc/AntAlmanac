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
