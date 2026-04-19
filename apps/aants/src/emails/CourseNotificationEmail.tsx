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

import { CourseDetailsBox } from '../components/CourseDetailsBox';
import { StatusChange, WhatChangedBox } from '../components/WhatChangedBox';
import { BLUE } from '../theme';

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
            <Head>
                <style>{`
                    .status-desktop { display: inline; }
                    .status-mobile { display: none; }
                    @media screen and (max-width: 480px) {
                        .status-desktop { display: none !important; }
                        .status-mobile { display: inline !important; }
                    }
                `}</style>
            </Head>
            <Preview>
                {deptCode} {courseNumber} ({courseType}) had enrollment changes
            </Preview>
            <Body
                style={{
                    backgroundColor: '#f6f9fc',
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
                }}
            >
                <Container style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
                    <Section
                        style={{
                            backgroundColor: BLUE,
                            padding: '10px 20px',
                            textAlign: 'center' as const,
                            borderRadius: '8px 8px 0 0',
                        }}
                    >
                        <Link href="https://antalmanac.com" style={{ textDecoration: 'none', color: '#ffffff' }}>
                            <Img
                                src="https://antalmanac.com/assets/logo.png"
                                alt="AntAlmanac"
                                width={180}
                                height={28}
                                style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    marginRight: '8px',
                                }}
                            />
                        </Link>
                    </Section>
                    <Section
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '40px 20px',
                            marginBottom: '64px',
                            borderRadius: '0 0 8px 8px',
                        }}
                    >
                        <Heading
                            style={{
                                color: '#000000',
                                fontSize: '24px',
                                fontWeight: '600',
                                margin: '0 0 20px',
                            }}
                        >
                            Hi {userName}!
                        </Heading>
                        <Text
                            style={{
                                color: '#000000',
                                fontSize: '16px',
                                lineHeight: '24px',
                                margin: '0 0 20px',
                            }}
                        >
                            The AntAlmanac team would like to notify you that the following class has had some
                            enrollment changes as of <strong>{time}</strong>.
                        </Text>

                        <WhatChangedBox statusChange={statusChange} restrictionCodesChange={restrictionCodesChange} />

                        <CourseDetailsBox
                            deptCode={deptCode}
                            courseNumber={courseNumber}
                            courseTitle={courseTitle}
                            courseType={courseType}
                            instructor={instructor}
                            days={days}
                            hours={hours}
                            sectionCode={sectionCode}
                        />

                        <Section style={{ margin: '0 0 24px' }}>
                            <Button
                                style={{
                                    backgroundColor: BLUE,
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    textAlign: 'center' as const,
                                    display: 'block',
                                    padding: '12px 24px',
                                }}
                                href="https://www.reg.uci.edu/registrar/soc/webreg.html?page=startUp&call="
                            >
                                Go to WebReg to enroll
                            </Button>
                        </Section>

                        <Hr style={{ borderColor: '#e6ebf1', margin: '24px 0' }} />

                        <Text
                            style={{
                                color: '#000000',
                                fontSize: '13px',
                                lineHeight: '20px',
                                margin: '0 0 16px',
                                textAlign: 'center' as const,
                            }}
                        >
                            <Link href="https://antalmanac.com" style={{ color: BLUE, textDecoration: 'underline' }}>
                                Go to AntAlmanac
                            </Link>
                            {' · '}
                            <Link
                                href="https://antalmanac.com/feedback"
                                style={{ color: BLUE, textDecoration: 'underline' }}
                            >
                                Give feedback or report a bug
                            </Link>
                        </Text>
                        <Text
                            style={{
                                color: '#000000',
                                fontSize: '13px',
                                lineHeight: '20px',
                                margin: '0 0 16px',
                                textAlign: 'center' as const,
                            }}
                        >
                            <Link href={unsubscribeUrl} style={{ color: BLUE, textDecoration: 'underline' }}>
                                Unsubscribe from this course
                            </Link>
                            {' · '}
                            <Link href={unsubscribeAllUrl} style={{ color: BLUE, textDecoration: 'underline' }}>
                                Unsubscribe from all courses
                            </Link>
                        </Text>
                        <div
                            style={{
                                display: 'none' as const,
                                maxHeight: 0,
                                overflow: 'hidden' as const,
                                visibility: 'hidden' as const,
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

export default CourseNotificationEmail;
