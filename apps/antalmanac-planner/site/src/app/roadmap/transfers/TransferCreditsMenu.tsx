'use client';

import './TransferCreditsMenu.scss';
import APExamsSection from './APExamsSection';
import CoursesSection from './CoursesSection';
import GESection from './GESection';
import UncategorizedCreditsSection from './UncategorizedCreditsSection';

export const TransferCreditsMenu = () => {
    return (
        <div className="transfers-menu">
            <h3>Add Course Credits</h3>

            <CoursesSection />
            <APExamsSection />
            <GESection />
            <UncategorizedCreditsSection />
        </div>
    );
};

export default TransferCreditsMenu;
