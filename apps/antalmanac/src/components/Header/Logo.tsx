import Image from 'next/image';

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
    logo: '/logos/mobile-logo-cropped.svg',
    mobileLogo: '/logos/mobile-logo-cropped.svg',
    desktopLogo: '/logos/logo.svg',
    startDay: 0,
    startMonthIndex: 0,
    endDay: 31,
    endMonthIndex: 12,
};

const logos: Logo[] = [
    {
        name: 'Christmas',
        logo: '/logos/christmas-logo.png',
        mobileLogo: '/logos/christmas-mobile-logo.png',
        desktopLogo: '/logos/christmas-logo.png',
        startDay: 1,
        startMonthIndex: 11,
        endDay: 31,
        endMonthIndex: 11,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        logo: '/logos/thanksgiving-mobile-logo.png',
        mobileLogo: '/logos/thanksgiving-mobile-logo.png',
        desktopLogo: '/logos/thanksgiving-logo.png',
        startDay: 1,
        startMonthIndex: 10,
        endDay: 30,
        endMonthIndex: 10,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        logo: '/logos/halloween-mobile-logo.png',
        mobileLogo: '/logos/halloween-mobile-logo.png',
        desktopLogo: '/logos/halloween-logo.png',
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

    return (
        <Image
            src={currentLogo?.logo}
            height={32}
            width={78}
            title={currentLogo?.attribution}
            loading="eager"
            alt="logo"
            style={{ width: 'auto', maxWidth: 78 }}
        />
    );
}
