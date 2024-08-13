export class QueryZotcourseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QueryZotCourseError';
    }
}
