import { FC, useEffect } from 'react';
import { useIsMobile } from '../../../helpers/util';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { clearUnreadTransfers, setShowMobileCreditsMenu } from '../../../store/slices/transferCreditsSlice';
import TransferCreditsMenu, { ToggleTransfersButton } from './TransferCreditsMenu';
import MobilePopup from '../MobilePopup';

export const MobileCreditsMenu: FC = () => {
  const isMobile = useIsMobile();
  const show = useAppSelector((state) => state.transferCredits.showMobileCreditsMenu);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isMobile) dispatch(setShowMobileCreditsMenu(false));
  }, [dispatch, isMobile]);

  const closeMenu = () => {
    dispatch(clearUnreadTransfers());
    dispatch(setShowMobileCreditsMenu(false));
  };

  return (
    <MobilePopup show={show} onClose={closeMenu}>
      <TransferCreditsMenu />
      <ToggleTransfersButton />
    </MobilePopup>
  );
};
