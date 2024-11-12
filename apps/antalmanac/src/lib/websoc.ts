import trpc from '$lib/api/trpc';

class _WebSOC {
    async query(params: Record<string, string>) {
        return await trpc.websoc.getOne.query(params);
    }

    async queryMultiple(params: { [key: string]: string }, fieldName: string) {
        return await trpc.websoc.getMany.query({ params, fieldName });
    }

    async getCourseInfo(params: Record<string, string>) {
        return await trpc.websoc.getCourseInfo.query(params);
    }
}

export const WebSOC = new _WebSOC();
