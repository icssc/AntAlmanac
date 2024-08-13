export class QueryZotCourseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QueryZotCourseError';
    }
}
