'use client';
import { FC } from 'react';

import './TransferCreditsMenu.scss';
import { useIsMobile } from '../../../helpers/util';
import { useIsReadOnly } from '../../../hooks/planner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setShowMobileCreditsMenu, clearUnreadTransfers } from '../../../store/slices/transferCreditsSlice';
import APExamsSection from './APExamsSection';
import CoursesSection from './CoursesSection';
import GESection from './GESection';
import UncategorizedCreditsSection from './UncategorizedCreditsSection';

export const ToggleTransfersButton: FC = () => {
    const isMobile = useIsMobile();
    const show = useAppSelector((state) => state.transferCredits.showMobileCreditsMenu);
    const readOnly = useIsReadOnly();
    const dispatch = useAppDispatch();

    const toggleMenu = () => {
        if (show) {
            // After closing the menu, clear all the unread markers
            dispatch(clearUnreadTransfers());
        }
        dispatch(setShowMobileCreditsMenu(!show));
    };

    return (
        <button className={`toggle-transfers-button ${isMobile ? 'mobile' : ''}`} onClick={toggleMenu}>
            {readOnly ? 'Done' : 'Done Editing Credits'}
        </button>
    );
};

export const TransferCreditsMenu = () => {
    const readOnly = useIsReadOnly();

    return (
        <div className="transfers-menu">
            <h3>{readOnly ? 'Transfer Credits' : 'Add Course Credits'}</h3>

            <CoursesSection />
            <APExamsSection />
            <GESection />
            <UncategorizedCreditsSection />
        </div>
    );
};

export default TransferCreditsMenu;
