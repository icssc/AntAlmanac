import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import HalloweenLogo from '$assets/halloween-logo.png';
import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';
import NewDefaultLogo from '$assets/mobile-logo-cropped.svg';
import MobileDefaultLogo from '$assets/mobile-logo.svg';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';
import { useIsMobile } from '$hooks/useIsMobile';
import Image, { type StaticImageData } from 'next/image';

type Logo = {
    name: string;
    desktopLogo: StaticImageData;
    mobileLogo: StaticImageData;
    startDay: number;
    startMonthIndex: number;
    endDay: number;
    endMonthIndex: number;
    attribution?: string;
};

const defaultLogo: Logo = {
    name: 'Default',
    desktopLogo: NewDefaultLogo,
    mobileLogo: MobileDefaultLogo,
    startDay: 0,
    startMonthIndex: 0,
    endDay: 31,
    endMonthIndex: 11,
};

const logos: Logo[] = [
    {
        name: 'Christmas',
        desktopLogo: ChristmasLogo,
        mobileLogo: MobileChristmasLogo,
        startDay: 1,
        startMonthIndex: 11,
        endDay: 31,
        endMonthIndex: 11,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        desktopLogo: ThanksgivingLogo,
        mobileLogo: MobileThanksgivingLogo,
        startDay: 1,
        startMonthIndex: 10,
        endDay: 30,
        endMonthIndex: 10,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        desktopLogo: HalloweenLogo,
        mobileLogo: MobileHalloweenLogo,
        startDay: 1,
        startMonthIndex: 9,
        endDay: 31,
        endMonthIndex: 9,
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    defaultLogo,
];

function isCurrentSeason(logo: Logo) {
    const now = new Date();
    const year = now.getFullYear();

    const start = new Date(year, logo.startMonthIndex, logo.startDay);
    const end = new Date(year, logo.endMonthIndex, logo.endDay + 1);

    return now >= start && now < end;
}

export function Logo() {
    const isMobile = useIsMobile();
    const currentLogo = logos.find(isCurrentSeason) ?? defaultLogo;
    const logo = isMobile ? currentLogo.mobileLogo : currentLogo.desktopLogo;

    return (
        <Image
            src={logo}
            alt="logo"
            title={currentLogo?.attribution}
            width={logo.width}
            height={logo.height}
            style={{ height: 32, width: 'auto', maxWidth: '100%' }}
        />
    );
}
