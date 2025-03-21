import { FEEDBACK_LINK } from '$src/globals';

export default function Feedback() {
    window.location.replace(FEEDBACK_LINK);
    return null;
}
