/*
 * Fallback preview script: Renders the React Email template and serves it locally.
 * Use this if `pnpm run preview:email` (react-email dev) has issues.
 *
 * Usage: pnpm run preview:email:fallback
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
        '- The class is now <strong>WAITLISTED</strong><br>- The class now has restriction codes <strong>E</strong>',
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

function wrapInHtml(html: string) {
    return `<!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AANTS Email Preview</title>
            </head>
            <body style="margin: 0; padding: 20px; background: #f6f9fc;">
            ${html}
            </body>
            </html>`;
}

const server = createServer(async (req, res) => {
    if (req.url === '/' || req.url === '/preview.html') {
        const html = await render(<CourseNotificationEmail {...SAMPLE_PROPS} />);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(wrapInHtml(html));
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
