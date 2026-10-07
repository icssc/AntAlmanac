import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import DefaultLogo from '$assets/default-logo.svg';
import HalloweenLogo from '$assets/halloween-logo.png';
import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';
import { useIsMobile } from '$hooks/useIsMobile';
import { addDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import Image, { type StaticImageData } from 'next/image';

type Logo = {
    name: string;
    desktopLogo: StaticImageData;
    mobileLogo: StaticImageData;
    startDate?: string; // inclusive Date string
    endDate?: string; // inclusive Date string
    attribution?: string;
};

const defaultLogo: Logo = {
    name: 'Default',
    desktopLogo: DefaultLogo,
    mobileLogo: DefaultLogo,
};

const seasonalLogos: Logo[] = [
    {
        name: 'Christmas',
        desktopLogo: ChristmasLogo,
        mobileLogo: MobileChristmasLogo,
        startDate: 'December 1',
        endDate: 'December 31',
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        desktopLogo: ThanksgivingLogo,
        mobileLogo: MobileThanksgivingLogo,
        startDate: 'November 1',
        endDate: 'November 30',
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        desktopLogo: HalloweenLogo,
        mobileLogo: MobileHalloweenLogo,
        startDate: 'October 1',
        endDate: 'October 31',
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
];

const IRVINE_TIME_ZONE = 'America/Los_Angeles';

function getCurrentLogo() {
    const currentDate = new Date();
    const currentYear = toZonedTime(currentDate, IRVINE_TIME_ZONE).getFullYear();

    for (const logo of seasonalLogos) {
        const startInclusive = fromZonedTime(new Date(`${logo.startDate}, ${currentYear}`), IRVINE_TIME_ZONE);
        const endExclusive = fromZonedTime(addDays(new Date(`${logo.endDate}, ${currentYear}`), 1), IRVINE_TIME_ZONE);

        if (currentDate >= startInclusive && currentDate < endExclusive) {
            return logo;
        }
    }

    return defaultLogo;
}

export function Logo() {
    const isMobile = useIsMobile();
    const currentLogo = getCurrentLogo();
    const logo = isMobile ? currentLogo.mobileLogo : currentLogo.desktopLogo;

    return (
        <Image
            src={logo}
            alt="logo"
            title={currentLogo.attribution}
            width={logo.width}
            height={logo.height}
            style={{ height: 32, width: 'auto', maxWidth: '100%' }}
        />
    );
}
