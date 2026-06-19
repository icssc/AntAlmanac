'use client';
import './MobileSearchMenu.scss';
import { FC } from 'react';
import { useAppSelector } from '../../store/hooks';
import { ResultsHeader } from '../../app/roadmap/search/SavedAndSearch';
import SearchHitContainer from '../SearchHitContainer/SearchHitContainer';
import SearchFilters from '../SearchFilters/SearchFilters';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';
import { getFiltersHint } from '../../helpers/search';

const MobileSearchMenu: FC = () => {
  const inProgressSearch = useAppSelector((state) => state.search.inProgressSearchOperation);
  const hasCompletedQuery = useAppSelector((state) => inProgressSearch !== 'newQuery' && !!state.search.courses.query);
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
