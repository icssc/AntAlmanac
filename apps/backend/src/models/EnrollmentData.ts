import { Schema, model } from 'mongoose';

interface Enrollment {
    date: string;
    maxCapacity: string;
    numCurrentlyEnrolled: string;
    numOnWaitlist: string;
    numRequested: string;
    restrictions: string;
}

interface EnrollmentData {
    quarter: string;
    sectionCode: string;
    year: string;
    data: Enrollment[];
}

const EnrollmentDataSchema = new Schema<EnrollmentData>({
    quarter: String,
    sectionCode: String,
    year: String,
    data: [
        {
            date: String,
            maxCapacity: String,
            numCurrentlyEnrolled: String,
            numOnWaitlist: String,
            numRequested: String,
            restrictions: String,
        },
    ],
});

export default model<EnrollmentData>('EnrollmentData', EnrollmentDataSchema, 'enrollment_data');
