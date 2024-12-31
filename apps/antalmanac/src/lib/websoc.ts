import { WebsocAPIResponse } from '@packages/antalmanac-types';

import trpc from '$lib/api/trpc';

type CacheEntry = WebsocAPIResponse & {
    timestamp: number;
};

class _WebSOC {
    private aaCacheKey = Date.now().toString(10);
    private cache: { [key: string]: CacheEntry };

    constructor() {
        this.cache = {};
    }

    clearCache() {
        this.aaCacheKey = Date.now().toString(10);
        Object.keys(this.cache).forEach((key) => delete this.cache[key]); // https://stackoverflow.com/a/19316873/14587004
    }

    async query(params: Record<string, string>) {
        const paramsString = JSON.stringify(params);

        // hit cache if data is less than 15 minutes old
        if (this.cache[paramsString]?.timestamp > Date.now() - 15 * 60 * 1000) {
            return this.cache[paramsString];
        }

        const response = await trpc.websoc.getOne.query({ ...params, aaCacheKey: this.aaCacheKey });
        this.cache[paramsString] = { ...response, timestamp: Date.now() };

        return response;
    }

    async queryMultiple(params: { [key: string]: string }, fieldName: string) {
        return await trpc.websoc.getMany.query({ params, fieldName });
    }

    async getCourseInfo(params: Record<string, string>) {
        return await trpc.websoc.getCourseInfo.query(params);
    }
}

export const WebSOC = new _WebSOC();
