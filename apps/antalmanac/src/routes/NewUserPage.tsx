'use client';

import { useSessionStore } from '$stores/SessionStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const NewUserPage = () => {
    const router = useRouter();
    const setIsNewUser = useSessionStore((state) => state.setIsNewUser);

    useEffect(() => {
        setIsNewUser(true);
        router.replace('/');
    }, [router, setIsNewUser]);
    return null;
};
