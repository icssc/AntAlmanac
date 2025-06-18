import trpc from '$lib/api/trpc';

class _Larc {
    private aaCacheKey = Date.now().toString(10);

    clearCache() {
        this.aaCacheKey = Date.now().toString(10);
    }

    async query(params: Record<string, string>) {
        return await trpc.larc.getOne.query({ ...params, aaCacheKey: this.aaCacheKey });
    }
}

export const Larc = new _Larc();
