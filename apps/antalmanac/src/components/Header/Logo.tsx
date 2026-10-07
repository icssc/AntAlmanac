import ChristmasLogo from '$assets/christmas-logo.png';
import DefaultLogo from '$assets/default-logo.svg';
import HalloweenLogo from '$assets/halloween-logo.png';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import { endOfDay, isWithinInterval, parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import Image, { type StaticImageData } from 'next/image';

type Logo = {
    name: string;
    logo: StaticImageData;
    attribution?: string;
};

type SeasonalLogo = Logo & {
    startDate: string; // inclusive, 'MMMM d'
    endDate: string; // inclusive, 'MMMM d'
};

const defaultLogo: Logo = {
    name: 'Default',
    logo: DefaultLogo,
};

// start date must come before end date for a given year
const seasonalLogos: SeasonalLogo[] = [
    {
        name: 'Christmas',
        logo: ChristmasLogo,
        startDate: 'December 1',
        endDate: 'December 31',
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Thanksgiving',
        logo: ThanksgivingLogo,
        startDate: 'November 1',
        endDate: 'November 30',
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
    {
        name: 'Halloween',
        logo: HalloweenLogo,
        startDate: 'October 1',
        endDate: 'October 31',
        attribution: 'Thanks Aejin for designing this seasonal logo!',
    },
];

// server and browser may be in different timezones, pin to Irvine time
const IRVINE_TIME_ZONE = 'America/Los_Angeles';

function getCurrentLogo(): Logo {
    const currentDate = new Date();
    const referenceDate = toZonedTime(currentDate, IRVINE_TIME_ZONE);

    return (
        seasonalLogos.find(({ startDate, endDate }) =>
            isWithinInterval(currentDate, {
                start: fromZonedTime(parse(startDate, 'MMMM d', referenceDate), IRVINE_TIME_ZONE),
                end: fromZonedTime(endOfDay(parse(endDate, 'MMMM d', referenceDate)), IRVINE_TIME_ZONE),
            })
        ) ?? defaultLogo
    );
}

export function Logo() {
    const currentLogo = getCurrentLogo();

    return (
        <Image
            src={currentLogo.logo}
            height={32}
            width={72}
            alt="logo"
            title={currentLogo.attribution}
            style={{ objectFit: 'contain' }}
        />
    );
}
