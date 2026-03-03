import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

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
                <Container style={outerContainer}>
                    <Section style={banner}>
                        <Link href="https://antalmanac.com" style={bannerLink}>
                            <Img
                                src="https://antalmanac.com/favicon-96x96.png"
                                alt="AntAlmanac"
                                width={28}
                                height={28}
                                style={bannerLogo}
                            />
                            <Text style={bannerText}>AntAlmanac</Text>
                        </Link>
                    </Section>
                    <Section style={contentSection}>
                        <Heading style={h1}>Hi {userName}!</Heading>
                        <Text style={text}>
                            Based on your notification subscriptions on AntAlmanac, the AntAlmanac team would like to
                            notify you that the following class has had some enrollment changes as of{' '}
                            <strong>{time}</strong>.
                        </Text>

                        <Section style={notificationBox}>
                            <Text style={notificationLabel}>The changes are:</Text>
                            <div dangerouslySetInnerHTML={{ __html: notification }} style={courseDetails} />
                        </Section>

                        <Section style={courseDetailsBox}>
                            <Text style={courseDetailsLabel}>Course details</Text>
                            <Text style={courseDetails}>
                                Course Name:{' '}
                                <strong>
                                    {' '}
                                    {deptCode} {courseNumber} - {courseTitle}{' '}
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
                            <Link href="https://antalmanac.com" style={link}>
                                Go to AntAlmanac
                            </Link>
                            {' · '}
                            <Link href="https://antalmanac.com/feedback" style={link}>
                                Give feedback or report a bug
                            </Link>
                        </Text>
                        <Text style={footerText}>
                            <Link href={unsubscribeUrl} style={link}>
                                Unsubscribe from this course
                            </Link>
                            {' · '}
                            <Link href={unsubscribeAllUrl} style={link}>
                                Unsubscribe from all courses
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
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const outerContainer = {
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
};

const bannerLink = {
    textDecoration: 'none',
    color: '#ffffff',
};

const banner = {
    backgroundColor: '#305db7',
    padding: '10px 20px',
    textAlign: 'center' as const,
    borderRadius: '8px 8px 0 0',
};

const bannerLogo = {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '8px',
};

const bannerText = {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
    display: 'inline-block',
    verticalAlign: 'middle',
};

const contentSection = {
    backgroundColor: '#ffffff',
    padding: '40px 20px',
    marginBottom: '64px',
    borderRadius: '0 0 8px 8px',
};

const h1 = {
    color: '#000000',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 20px',
};

const text = {
    color: '#000000',
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
    color: '#000000',
    fontSize: '16px',
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
    color: '#000000',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px',
};

const courseDetails = {
    color: '#000000',
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
    color: '#000000',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 16px',
    textAlign: 'center' as const,
};

const link = {
    color: '#0066cc',
    textDecoration: 'underline',
};

const signature = {
    color: '#000000',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
    textAlign: 'left' as const,
};

/** Default export with sample data for React Email dev preview */
export default CourseNotificationEmail;
