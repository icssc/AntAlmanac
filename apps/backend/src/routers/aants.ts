import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { router, procedure } from '../trpc';
import env from '../env';

// Initialize SES client to send AANTS emails
const sesClient = new SESClient({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: '',
		secretAccessKey: ''
	}
});

const sendEmail = async () => {
	const params = {
		Destination: {
			ToAddresses: [''],
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
		Source: '', // Must be a verified SES email
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
