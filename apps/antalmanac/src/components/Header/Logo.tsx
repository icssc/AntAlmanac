import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import DefaultLogo from '$assets/default-logo.svg';
import HalloweenLogo from '$assets/halloween-logo.png';
import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';
import { useIsMobile } from '$hooks/useIsMobile';
import { endOfDay, isWithinInterval, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Image, { type StaticImageData } from 'next/image';

type Logo = {
    name: string;
    desktopLogo: StaticImageData;
    mobileLogo: StaticImageData;
    attribution?: string;
};

type SeasonalLogo = Logo & {
    startDate: string; // inclusive, 'MMMM d'
    endDate: string; // inclusive, 'MMMM d'
};

const defaultLogo: Logo = {
    name: 'Default',
    desktopLogo: DefaultLogo,
    mobileLogo: DefaultLogo,
};

// start date must come before end date for a given year
const seasonalLogos: SeasonalLogo[] = [
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

// server and browser may be in different timezones, pin to Irvine time
const IRVINE_TIME_ZONE = 'America/Los_Angeles';

function getCurrentLogo(): Logo {
    const currentDate = toZonedTime(new Date(), IRVINE_TIME_ZONE);

    return (
        seasonalLogos.find(({ startDate, endDate }) =>
            isWithinInterval(currentDate, {
                start: parse(startDate, 'MMMM d', currentDate),
                end: endOfDay(parse(endDate, 'MMMM d', currentDate)),
            })
        ) ?? defaultLogo
    );
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
