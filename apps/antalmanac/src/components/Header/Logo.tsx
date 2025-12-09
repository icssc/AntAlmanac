import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import HalloweenLogo from '$assets/halloween-logo.png';
import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';
import DefaultLogo from '$assets/logo.svg';
import MobileDefaultLogo from '$assets/mobile-logo.svg';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';
import { useIsMobile } from '$hooks/useIsMobile';

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
        endDay: 31,
        endMonthIndex: 11,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        mobileLogo: MobileThanksgivingLogo,
        desktopLogo: ThanksgivingLogo,
        startDay: 1,
        startMonthIndex: 10,
        endDay: 30,
        endMonthIndex: 10,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        mobileLogo: MobileHalloweenLogo,
        desktopLogo: HalloweenLogo,
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
    const isMobile = useIsMobile();

    const currentLogo = logos.find((logo) => logoIsForCurrentSeason(logo)) ?? defaultLogo;

    return (
        <img
            height={32}
            src={isMobile ? currentLogo?.mobileLogo : currentLogo?.desktopLogo}
            title={currentLogo?.attribution}
            alt="logo"
        />
    );
}
