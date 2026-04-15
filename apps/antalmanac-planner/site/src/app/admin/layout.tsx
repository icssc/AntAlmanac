'use client';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useAppSelector } from '../../store/hooks';

export default function AdminPageLayout({ children }: PropsWithChildren) {
  const isAdmin = useAppSelector((state) => state.user.isAdmin);
  if (!isAdmin) return notFound();
  return children;
}
