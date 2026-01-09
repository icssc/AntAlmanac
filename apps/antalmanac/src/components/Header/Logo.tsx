import Image from 'next/image';

type Logo = {
    name: string;
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

    return (
        <Image
            src={currentLogo?.mobileLogo}
            height={64}
            width={340}
            style={{
                width: 'auto',
                height: '2rem',
            }}
            title={currentLogo?.attribution}
            alt="logo"
        />
    );
}
