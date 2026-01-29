import Image from 'next/image';

import { useIsMobile } from '$hooks/useIsMobile';

type Logo = {
    name: string;
    logo: string;
    mobileLogo: string;
    desktopLogo: string;
    startDay: number; // inclusive
    startMonthIndex: number;
    endDay: number; // inclusive
    endMonthIndex: number;
    attribution?: string;
};

const defaultLogo: Logo = {
    name: 'Default',
    logo: '/assets/mobile-logo-cropped.svg',
    mobileLogo: '/assets/mobile-logo-cropped.svg',
    desktopLogo: '/assets/logo.svg',
    startDay: 0,
    startMonthIndex: 0,
    endDay: 31,
    endMonthIndex: 12,
};

const logos: Logo[] = [
    {
        name: 'Christmas',
        logo: '/assets/christmas-logo.png',
        mobileLogo: '/assets/christmas-mobile-logo.png',
        desktopLogo: '/assets/christmas-logo.png',
        startDay: 1,
        startMonthIndex: 11,
        endDay: 31,
        endMonthIndex: 11,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        logo: '/assets/thanksgiving-mobile-logo.png',
        mobileLogo: '/assets/thanksgiving-mobile-logo.png',
        desktopLogo: '/assets/thanksgiving-logo.png',
        startDay: 1,
        startMonthIndex: 10,
        endDay: 30,
        endMonthIndex: 10,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        logo: '/assets/halloween-mobile-logo.png',
        mobileLogo: '/assets/halloween-mobile-logo.png',
        desktopLogo: '/assets/halloween-logo.png',
        startDay: 1,
        startMonthIndex: 9,
        endDay: 31,
        endMonthIndex: 9,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    defaultLogo,
];

function logoIsForCurrentSeason(logo: Logo) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(currentYear, logo.startMonthIndex, logo.startDay);
    const endDate = new Date(currentYear, logo.endMonthIndex, logo.endDay);

    return currentDate >= startDate && currentDate <= endDate;
}

export function Logo() {
    const currentLogo = logos.find((logo) => logoIsForCurrentSeason(logo)) ?? defaultLogo;

    const isMobile = useIsMobile();
    return (
        <Image
            src={currentLogo?.logo}
            height={32}
            width={isMobile ? 48 : 78}
            title={currentLogo?.attribution}
            alt="logo"
        />
    );
}
