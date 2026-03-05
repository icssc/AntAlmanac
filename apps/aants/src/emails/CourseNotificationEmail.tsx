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

import {
    banner,
    bannerLink,
    bannerLogo,
    button,
    buttonContainer,
    changeArrow,
    restrictionPill,
    changeRowCell,
    changeRowLabel,
    boxBase,
    changeTable,
    contentSection,
    courseDetails,
    sectionLabel,
    footerText,
    h1,
    hiddenMessageId,
    hr,
    link,
    main,
    notificationBox,
    outerContainer,
    signature,
    statusPillDefault,
    statusPillFull,
    statusPillOpen,
    statusPillWaitlisted,
    text,
} from './CourseNotificationEmail.styles';

const STATUS_PILL_STYLES: Record<string, object> = {
    WAITLISTED: statusPillWaitlisted,
    OPEN: statusPillOpen,
    FULL: statusPillFull,
};

function getStatusPillStyle(status: string) {
    return STATUS_PILL_STYLES[status] ?? statusPillDefault;
}

export interface StatusChange {
    from: string;
    to: string;
}

export interface CourseNotificationEmailProps {
    messageId: string;
    userName: string;
    time: string;
    statusChange?: StatusChange | null;
    restrictionCodesChange?: { from: string; to: string } | null;
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
    statusChange,
    restrictionCodesChange,
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
    const unsubscribeParams = new URLSearchParams({
        sectionCode,
        quarter,
        year,
        deptCode,
        courseNumber,
        instructor,
    });
    const unsubscribeUrl = `https://antalmanac.com/unsubscribe/${userId}?${unsubscribeParams.toString()}`;

    const unsubscribeAllParams = new URLSearchParams({
        sectionCode,
        quarter,
        year,
        unsubscribeAll: 'true',
    });
    const unsubscribeAllUrl = `https://antalmanac.com/unsubscribe/${userId}?${unsubscribeAllParams.toString()}`;

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
                                src="https://antalmanac.com/assets/logo.png"
                                alt="AntAlmanac"
                                width={180}
                                height={28}
                                style={bannerLogo}
                            />
                        </Link>
                    </Section>
                    <Section style={contentSection}>
                        <Heading style={h1}>Hi {userName}!</Heading>
                        <Text style={text}>
                            The AntAlmanac team would like to notify you that the following class has had some
                            enrollment changes as of <strong>{time}</strong>.
                        </Text>

                        {(statusChange || restrictionCodesChange) && (
                            <Section style={notificationBox}>
                                <Text style={sectionLabel}>What changed</Text>
                                <table style={changeTable}>
                                    <tbody>
                                        {statusChange && (
                                            <tr>
                                                <td style={changeRowLabel}>Enrollment Status:</td>
                                                <td style={changeRowCell}>
                                                    <span style={getStatusPillStyle(statusChange.from)}>
                                                        {statusChange.from}
                                                    </span>
                                                    <span style={changeArrow}>→</span>
                                                    <span style={getStatusPillStyle(statusChange.to)}>
                                                        {statusChange.to}
                                                    </span>
                                                </td>
                                            </tr>
                                        )}
                                        {restrictionCodesChange && (
                                            <tr>
                                                <td style={changeRowLabel}>Restriction Codes:</td>
                                                <td style={changeRowCell}>
                                                    <span style={restrictionPill}>{restrictionCodesChange.from}</span>
                                                    <span style={changeArrow}>→</span>
                                                    <span style={restrictionPill}>{restrictionCodesChange.to}</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Section>
                        )}

                        <Section style={boxBase}>
                            <Text style={sectionLabel}>Course Details</Text>
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
                        <div style={hiddenMessageId}>ID: {messageId}</div>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

export default CourseNotificationEmail;
