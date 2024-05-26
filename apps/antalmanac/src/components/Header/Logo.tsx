import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import HalloweenLogo from '$assets/halloween-logo.png';
import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';
import DefaultLogo from '$assets/logo.svg';
import MobileDefaultLogo from '$assets/mobile-logo.svg';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';

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
    mobileLogo: MobileDefaultLogo,
    desktopLogo: DefaultLogo,
    startDay: 0,
    startMonthIndex: 0,
    endDay: 31,
    endMonthIndex: 12,
};

const logos: Logo[] = [
    {
        name: 'Christmas',
        mobileLogo: MobileChristmasLogo,
        desktopLogo: ChristmasLogo,
        startDay: 1,
        startMonthIndex: 11,
        endDay: 1,
        endMonthIndex: 1,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        mobileLogo: MobileThanksgivingLogo,
        desktopLogo: ThanksgivingLogo,
        startDay: 1,
        startMonthIndex: 10,
        endDay: 1,
        endMonthIndex: 11,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        mobileLogo: MobileHalloweenLogo,
        desktopLogo: HalloweenLogo,
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
        <img
            height={32}
            src={isMobileScreen ? currentLogo?.mobileLogo : currentLogo?.desktopLogo}
            title={currentLogo?.attribution}
            alt="logo"
        />
    );
}

export default Logo;
