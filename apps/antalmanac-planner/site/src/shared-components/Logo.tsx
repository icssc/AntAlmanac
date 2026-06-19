import Image, { type StaticImageData } from 'next/image';
import { useIsMobile } from '../helpers/util';

import NewDefaultLogo from '../asset/mobile-logo-cropped.svg'; // @TODO rename when done
import MobileDefaultLogo from '../asset/mobile-logo.svg';

import ChristmasLogo from '../asset/christmas-logo.png';
import MobileChristmasLogo from '../asset/christmas-mobile-logo.png';

import ThanksgivingLogo from '../asset/thanksgiving-logo.png';
import MobileThanksgivingLogo from '../asset/thanksgiving-mobile-logo.png';

import HalloweenLogo from '../asset/halloween-logo.png';
import MobileHalloweenLogo from '../asset/halloween-mobile-logo.png';

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
  const end = new Date(year, logo.endMonthIndex, logo.endDay);

  return now >= start && now <= end;
}

export function Logo() {
  const isMobile = useIsMobile();
  const currentLogo = logos.find(isCurrentSeason) ?? defaultLogo;

  return (
    <Image
      src={currentLogo.desktopLogo}
      alt="logo"
      title={currentLogo?.attribution}
      height={32}
      width={isMobile ? 48 : 78}
    />
  );
}
