'use client';
import { useAppSelector } from '$planner/store/hooks';
import { notFound } from 'next/navigation';
import { type PropsWithChildren } from 'react';

export default function AdminPageLayout({ children }: PropsWithChildren) {
    const isAdmin = useAppSelector((state) => state.user.isAdmin);
    if (!isAdmin) return notFound();
    return children;
}
