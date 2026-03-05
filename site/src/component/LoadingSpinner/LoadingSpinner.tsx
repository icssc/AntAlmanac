'use client';
import dynamic from 'next/dynamic';
import './LoadingSpinner.scss';

const CircularProgress = dynamic(() => import('@mui/material/CircularProgress'), { ssr: false });

const LoadingSpinner = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`loading-spinner ${className}`.trim()}>
      <CircularProgress />
    </div>
  );
};

export default LoadingSpinner;
