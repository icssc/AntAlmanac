import { FEEDBACK_LINK } from '$src/globals';
import { redirect } from 'next/navigation';

export default function Page() {
    redirect(FEEDBACK_LINK);
}
