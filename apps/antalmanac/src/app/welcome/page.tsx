'use client';

import { useAppInitStore } from '$stores/AppInitStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const router = useRouter();
    const setIsNewUser = useAppInitStore((state) => state.setIsNewUser);

    useEffect(() => {
        setIsNewUser(true);
        router.replace('/');
    }, [router, setIsNewUser]);

    return null;
}
