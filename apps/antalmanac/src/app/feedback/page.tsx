import { FEEDBACK_LINK } from '$src/globals';
import { redirect } from 'next/navigation';

export default function FeedbackPage() {
    redirect(FEEDBACK_LINK);
}
