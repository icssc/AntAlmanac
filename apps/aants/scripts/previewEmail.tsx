/*
 * Run pnpm run preview:email to view AANTS email template in browswer
 */

import { createServer } from 'http';

import { render } from '@react-email/render';

import { CourseNotificationEmail } from '../src/emails/CourseNotificationEmail';

const SAMPLE_PROPS = {
    messageId: crypto.randomUUID(),
    userName: 'Test User',
    time:
        new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles',
        }) +
        ' on ' +
        new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' }),
    notification:
        '- The class is now <strong>OPEN</strong> (formerly <strong>WAITLISTED</strong>)<br>- The class now has restriction codes <strong>E</strong>',
    deptCode: 'ICS',
    courseNumber: '31',
    courseTitle: 'Introduction to Programming',
    courseType: 'Lecture',
    instructor: 'Smith, J.',
    days: 'TuTh',
    hours: '2:00-3:20 PM',
    sectionCode: '12345',
    userId: 'test-user-123',
    quarter: 'Spring',
    year: '2025',
};

const PORT = 3457;

const server = createServer(async (req, res) => {
    if (req.url === '/' || req.url === '/preview.html') {
        const html = await render(<CourseNotificationEmail {...SAMPLE_PROPS} />);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n📧 Email preview at ${url}\n`);
    console.log('   Edits auto-reload on save (refresh browser to see changes)\n');
});
