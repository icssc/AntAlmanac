import { cachedProgramQuery } from './programCache';

beforeEach(() => sessionStorage.clear());

it('fetches once per key and gives each caller its own copy', async () => {
    const fetcher = jest.fn().mockResolvedValue({ requirements: [1] });
    const a = await cachedProgramQuery('k', fetcher);
    a.requirements.push(2);
    const b = await cachedProgramQuery('k', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(b).toEqual({ requirements: [1] });
});

it('shares an in-flight request between concurrent callers', async () => {
    const fetcher = jest.fn().mockResolvedValue({ x: 1 });
    await Promise.all([cachedProgramQuery('k', fetcher), cachedProgramQuery('k', fetcher)]);
    expect(fetcher).toHaveBeenCalledTimes(1);
});

it('refetches after the entry expires and for different keys', async () => {
    const fetcher = jest.fn().mockResolvedValue({ x: 1 });
    await cachedProgramQuery('k', fetcher);
    await cachedProgramQuery('other', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 6 * 60 * 1000);
    await cachedProgramQuery('k', fetcher);
    expect(fetcher).toHaveBeenCalledTimes(3);
    jest.restoreAllMocks();
});

it('does not cache failures', async () => {
    const fetcher = jest.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue({ x: 1 });
    await expect(cachedProgramQuery('k', fetcher)).rejects.toThrow('boom');
    await expect(cachedProgramQuery('k', fetcher)).resolves.toEqual({ x: 1 });
});
