import { Section, Text } from '@react-email/components';

interface CourseDetailsBoxProps {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseType: string;
    instructor: string;
    days: string;
    hours: string;
    sectionCode: string;
}

export function CourseDetailsBox({
    deptCode,
    courseNumber,
    courseTitle,
    courseType,
    instructor,
    days,
    hours,
    sectionCode,
}: CourseDetailsBoxProps) {
    return (
        <Section
            style={{
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                padding: '16px',
                margin: '0 0 24px',
            }}
        >
            <Text
                style={{
                    color: '#000000',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 8px',
                }}
            >
                Course Details
            </Text>
            <Text
                style={{
                    color: '#000000',
                    fontSize: '14px',
                    lineHeight: '22px',
                    margin: '0',
                }}
            >
                Course Name:{' '}
                <strong>
                    {deptCode} {courseNumber} - {courseTitle}
                </strong>
                <br />
                Type: <strong>{courseType}</strong>
                <br />
                Instructor: <strong>{instructor}</strong>
                <br />
                Time:{' '}
                <strong>
                    {days} {hours}
                </strong>
                <br />
                Section: <strong>{sectionCode}</strong>
            </Text>
        </Section>
    );
}
