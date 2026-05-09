import { UnsubscribeClient } from '$src/app/unsubscribe/[userId]/UnsubscribeClient';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ userId: string }>;
}

export default async function UnsubscribePage({ params }: Props) {
    const { userId } = await params;
    return <UnsubscribeClient userId={userId} />;
}
