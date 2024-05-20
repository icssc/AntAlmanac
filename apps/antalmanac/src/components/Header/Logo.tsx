import ChristmasLogo from '$assets/christmas-logo.png';
import MobileChristmasLogo from '$assets/christmas-mobile-logo.png';
import HalloweenLogo from '$assets/halloween-logo.png';
import MobileHalloweenLogo from '$assets/halloween-mobile-logo.png';
import DefaultLogo from '$assets/logo.svg';
import MobileDefaultLogo from '$assets/mobile-logo.svg';
import ThanksgivingLogo from '$assets/thanksgiving-logo.png';
import MobileThanksgivingLogo from '$assets/thanksgiving-mobile-logo.png';

const logos: Logo[] = [
    {
        name: 'Christmas',
        mobileLogo: MobileChristmasLogo,
        desktopLogo: ChristmasLogo,
        startDay: 1,
        startMonthIndex: 11,
        endDay: 1,
        endMonthIndex: 1,
    },
    {
        name: 'Thanksgiving',
        mobileLogo: MobileThanksgivingLogo,
        desktopLogo: ThanksgivingLogo,
        startDay: 1,
        startMonthIndex: 10,
        endDay: 1,
        endMonthIndex: 11,
    },
    {
        name: 'Halloween',
        mobileLogo: MobileHalloweenLogo,
        desktopLogo: HalloweenLogo,
        startDay: 1,
        startMonthIndex: 9,
        endDay: 1,
        endMonthIndex: 10,
    },
];

interface Logo {
    name: string;
    mobileLogo: string;
    desktopLogo: string;
    startDay: number; // inclusive
    startMonthIndex: number;
    endDay: number; // exclusive
    endMonthIndex: number;
}

interface LogoProps {
    isMobileScreen: boolean;
    logos: Logo[];
}

const inBounds = (props: Logo): boolean => {
    // get current date
    const currentDate = new Date();

    // for testing...
    // const currentDate = new Date(2024, 8, 30); // within default logo range
    // const currentDate = new Date(2024, 9, 31); // last day of halloween logo (last day of october)
    // const currentDate = new Date(2024, 10, 1); // first day of thanksgiving logo (first day of november, etc.)
    // const currentDate = new Date(2024, 10, 30); // last day of thanksgiving logo
    // const currentDate = new Date(2024, 0, 15); // should be christmas logo
    // const currentDate = new Date(2024, 1, 1); // first day back in default range - dalton as of 5/20/24

    // get bounds
    const currentYear = currentDate.getFullYear();
    const endYear = currentYear;
    const startYear = props.startMonthIndex > props.endMonthIndex ? endYear - 1 : endYear;
    const endDate = new Date(endYear, props.endMonthIndex, props.endDay);
    const startDate = new Date(startYear, props.startMonthIndex, props.startDay);

    // check if current date is in bounds of special event/holiday/season
    return currentDate >= startDate && currentDate < endDate;
};

const getLogo = (props: LogoProps): string => {
    for (const logo of props.logos) {
        if (inBounds(logo)) {
            // console.log('using the ' + logo.name + ' logo!');
            return props.isMobileScreen ? logo.mobileLogo : logo.desktopLogo;
        }
    }
    return props.isMobileScreen ? MobileDefaultLogo : DefaultLogo;
};

export default function Logo({ isMobileScreen }: { isMobileScreen: boolean }) {
    return (
        <img
            height={32}
            src={getLogo({ isMobileScreen: isMobileScreen, logos: logos })}
            title={'Thanks Aejin for designing this seasonal logo!'}
            alt="logo"
        />
    );
}
