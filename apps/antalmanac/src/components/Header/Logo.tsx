import { useMediaQuery } from '@mui/material';
import Image from 'next/image';
import { useMemo } from 'react';

type Logo = {
    name: string;
    mobileLogo: string;
    desktopLogo: string;
    startDay: number; // inclusive
    startMonthIndex: number;
    endDay: number; // exclusive
    endMonthIndex: number;
    attribution?: string;
};

const defaultLogo: Logo = {
    name: 'Default',
    mobileLogo: '/assets/mobile-logo.svg',
    desktopLogo: '/assets/logo.svg',
    startDay: 0,
    startMonthIndex: 0,
    endDay: 31,
    endMonthIndex: 12,
};

const logos: Logo[] = [
    {
        name: 'Christmas',
        mobileLogo: '/assets/christmas-mobile-logo.png',
        desktopLogo: '/assets/christmas-logo.png',
        startDay: 1,
        startMonthIndex: 11,
        endDay: 1,
        endMonthIndex: 1,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        mobileLogo: '/assets/thanksgiving-mobile-logo.png',
        desktopLogo: '/assets/thanksgiving-logo.png',
        startDay: 1,
        startMonthIndex: 10,
        endDay: 1,
        endMonthIndex: 11,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        mobileLogo: '/assets/halloween-mobile-logo.png',
        desktopLogo: '/assets/halloween-logo.png',
        startDay: 1,
        startMonthIndex: 9,
        endDay: 1,
        endMonthIndex: 10,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    defaultLogo,
];

function logoIsForCurrentSeason(logo: Logo) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const endYear = currentYear;
    const startYear = logo.startMonthIndex > logo.endMonthIndex ? endYear - 1 : endYear;
    const endDate = new Date(endYear, logo.endMonthIndex, logo.endDay);
    const startDate = new Date(startYear, logo.startMonthIndex, logo.startDay);

    return currentDate >= startDate && currentDate < endDate;
}

export function Logo() {
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const currentLogo = useMemo(() => {
        return logos.find((logo) => logoIsForCurrentSeason(logo)) ?? defaultLogo;
    }, []);

    return (
        <Image
            src={isMobileScreen ? currentLogo?.mobileLogo : currentLogo?.desktopLogo}
            height={32}
            width={32}
            style={{
                width: 'auto',
                height: '32px',
            }}
            title={currentLogo?.attribution}
            alt="logo"
        />
    );
}
