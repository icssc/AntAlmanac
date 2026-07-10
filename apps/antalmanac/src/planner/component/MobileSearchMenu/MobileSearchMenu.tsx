'use client';
import './MobileSearchMenu.scss';
import { ResultsHeader } from '$plannerApp/roadmap/search/SavedAndSearch';
import { type FC } from 'react';

import { getFiltersHint } from '../../helpers/search';
import { useAppSelector } from '../../store/hooks';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';
import SearchFilters from '../SearchFilters/SearchFilters';
import SearchHitContainer from '../SearchHitContainer/SearchHitContainer';

const MobileSearchMenu: FC = () => {
    const inProgressSearch = useAppSelector((state) => state.search.inProgressSearchOperation);
    const hasCompletedQuery = useAppSelector(
        (state) => inProgressSearch !== 'newQuery' && !!state.search.courses.query
    );
    const hasQuery = useAppSelector((state) => !!state.search.courses.query);
    const courseCount = useAppSelector((state) => state.search.courses.count);
    const filtersDimmed = useAppSelector((state) => hasQuery && state.search.viewIndex === 'instructors');
    const filtersHint = getFiltersHint(filtersDimmed, courseCount > 0);

    return (
        <div className="mobile-search-menu">
            <div className="result-info-container">
                <SearchFilters dimmed={filtersDimmed} hint={filtersHint} addTopPadding={!hasCompletedQuery} />
                {hasCompletedQuery && <ResultsHeader />}
            </div>
            <SearchHitContainer />
            <ScrollToTopButton scrollableTarget="mobileScrollContainer" />
        </div>
    );
};

export default MobileSearchMenu;
