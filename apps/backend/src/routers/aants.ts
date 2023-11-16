import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { router, procedure } from '../trpc';

// Initialize SES client to send AANTS emails
const sesClient = new SESClient({
	region: 'us-west-1'
});

const sendEmail = async () => {
	const params = {
		Destination: {
			ToAddresses: ['antalmanac@gmail.com'],
		},
		Message: {
			Body: {
				Text: {
					Data: 'AANTS Test Body',
				},
			},
			Subject: {
				Data: 'AANTS Test',
			},
		},
		Source: 'antalmanac@gmail.com', // Must be a verified SES email
	};

	const command = new SendEmailCommand(params);
	try {
		const data = await sesClient.send(command);
		return `Email sent successfully: ${data.MessageId}`;
	} catch (err) {
		return `Error sending email: ${err}`;
	}
};

const aantsRouter = router({
    sendEmail: procedure.mutation(() => {
        return sendEmail();
    }),
});

export default aantsRouter;
