import { useIsMobile } from '$planner/helpers/util';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { clearUnreadTransfers, setShowMobileCreditsMenu } from '$planner/store/slices/transferCreditsSlice';
import { type FC, useEffect } from 'react';

import MobilePopup from '../MobilePopup';
import TransferCreditsMenu, { ToggleTransfersButton } from './TransferCreditsMenu';

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
