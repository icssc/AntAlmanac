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

interface Logos {
    logos: Logo[];
}

interface LogoImage extends Pick<Logo, 'mobileLogo' | 'desktopLogo'> {
    imageCredit?: string;
}

const inBounds = (props: Logo): boolean => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const endYear = currentYear;
    const startYear = props.startMonthIndex > props.endMonthIndex ? endYear - 1 : endYear;
    const endDate = new Date(endYear, props.endMonthIndex, props.endDay);
    const startDate = new Date(startYear, props.startMonthIndex, props.startDay);

    return currentDate >= startDate && currentDate < endDate;
};

const getLogo = (props: Logos): LogoImage => {
    for (const logo of props.logos) {
        if (inBounds(logo)) {
            return {
                mobileLogo: logo.mobileLogo,
                desktopLogo: logo.desktopLogo,
                imageCredit: 'Thanks Aejin for designing this seasonal logo!',
            };
        }
    }
    return { mobileLogo: MobileDefaultLogo, desktopLogo: DefaultLogo };
};

export default function Logo({ isMobileScreen }: { isMobileScreen: boolean }) {
    const { mobileLogo, desktopLogo, imageCredit } = getLogo({ logos });

    return <img height={32} src={isMobileScreen ? mobileLogo : desktopLogo} title={imageCredit ?? ''} alt="logo" />;
}
