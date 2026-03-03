import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

export interface CourseNotificationEmailProps {
    /** Unique ID per email to prevent Gmail from collapsing duplicate messages */
    messageId: string;
    userName: string;
    time: string;
    notification: string;
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseType: string;
    instructor: string;
    days: string;
    hours: string;
    sectionCode: string;
    userId: string;
    quarter: string;
    year: string;
}

export function CourseNotificationEmail({
    messageId,
    userName,
    time,
    notification,
    deptCode,
    courseNumber,
    courseTitle,
    courseType,
    instructor,
    days,
    hours,
    sectionCode,
    userId,
    quarter,
    year,
}: CourseNotificationEmailProps) {
    const unsubscribeUrl = `https://antalmanac.com/unsubscribe/${userId}?sectionCode=${sectionCode}&quarter=${quarter}&year=${year}&deptCode=${deptCode}&courseNumber=${courseNumber}&instructor=${encodeURIComponent(instructor)}`;
    const unsubscribeAllUrl = `https://antalmanac.com/unsubscribe/${userId}?sectionCode=${sectionCode}&quarter=${quarter}&year=${year}&unsubscribeAll=true`;

    return (
        <Html lang="en">
            <Head />
            <Preview>
                {deptCode} {courseNumber} ({courseType}) had enrollment changes
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Hi {userName}!</Heading>
                    <Text style={text}>
                        Based on your notification subscriptions on AntAlmanac, the AntAlmanac team would like to notify
                        you that the following class has had some enrollment changes as of <strong>{time}</strong>.
                    </Text>

                    <Section style={notificationBox}>
                        <Text style={notificationLabel}>The changes are:</Text>
                        <div dangerouslySetInnerHTML={{ __html: notification }} style={courseDetails} />
                    </Section>

                    <Section style={courseDetailsBox}>
                        <Text style={courseDetailsLabel}>Course details</Text>
                        <Text style={courseDetails}>
                            <strong>
                                {deptCode} {courseNumber}
                            </strong>{' '}
                            – {courseTitle}
                            <br />
                            Type: {courseType}
                            <br />
                            Instructor: {instructor}
                            <br />
                            Time: {days} {hours}
                            <br />
                            Section: {sectionCode}
                        </Text>
                    </Section>

                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href="https://www.reg.uci.edu/registrar/soc/webreg.html?page=startUp&call="
                        >
                            Go to WebReg to enroll
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footerText}>
                        <Link href={unsubscribeUrl} style={link}>
                            Unsubscribe from this course
                        </Link>
                        {' · '}
                        <Link href={unsubscribeAllUrl} style={link}>
                            Unsubscribe from all courses
                        </Link>
                        {' · '}
                        <Link href="https://antalmanac.com/feedback" style={link}>
                            Give feedback
                        </Link>
                    </Text>

                    <Text style={signature}>
                        Best,
                        <br />
                        The AntAlmanac Team
                    </Text>
                    <div
                        style={{
                            display: 'none',
                            maxHeight: 0,
                            overflow: 'hidden',
                            visibility: 'hidden',
                        }}
                    >
                        ID: {messageId}
                    </div>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 20px',
    marginBottom: '64px',
    borderRadius: '8px',
    maxWidth: '520px',
};

const h1 = {
    color: '#1a1a2e',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 20px',
};

const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 20px',
};

const notificationBox = {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px',
    margin: '0 0 24px',
    borderLeft: '4px solid #0066cc',
};

const notificationLabel = {
    color: '#1a1a2e',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px',
};

const courseDetailsBox = {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px',
    margin: '0 0 24px',
};

const courseDetailsLabel = {
    color: '#1a1a2e',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px',
};

const courseDetails = {
    color: '#525f7f',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
};

const buttonContainer = {
    margin: '0 0 24px',
};

const button = {
    backgroundColor: '#0066cc',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '24px 0',
};

const footerText = {
    color: '#8898aa',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 16px',
};

const link = {
    color: '#0066cc',
    textDecoration: 'underline',
};

const signature = {
    color: '#525f7f',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
};

/** Default export with sample data for React Email dev preview */
export default CourseNotificationEmail;
