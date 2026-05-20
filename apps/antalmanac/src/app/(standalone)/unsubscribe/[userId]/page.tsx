import { Unsubscribe } from '$routes/UnsubscribePage';
import { Suspense } from 'react';

export default function UnsubscribePage() {
    return (
        <Suspense>
            <Unsubscribe />
        </Suspense>
    );
}
