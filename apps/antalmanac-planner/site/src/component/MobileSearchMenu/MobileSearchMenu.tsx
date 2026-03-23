'use client';
import './MobileSearchMenu.scss';
import { FC } from 'react';
import { useAppSelector } from '../../store/hooks';
import { ResultsHeader } from '../../app/roadmap/search/SavedAndSearch';
import SearchHitContainer from '../SearchHitContainer/SearchHitContainer';
import SearchFilters from '../SearchFilters/SearchFilters';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';

const MobileSearchMenu: FC = () => {
  const inProgressSearch = useAppSelector((state) => state.search.inProgressSearchOperation);
  const hasCompletedQuery = useAppSelector((state) => inProgressSearch !== 'newQuery' && !!state.search.courses.query);
  const showFilters = useAppSelector((state) => hasCompletedQuery && state.search.viewIndex === 'courses');

  return (
    <div className="mobile-search-menu">
      <div className="result-info-container">
        {hasCompletedQuery && <ResultsHeader />}
        {hasCompletedQuery && showFilters && <SearchFilters />}
      </div>
      <SearchHitContainer />
      <ScrollToTopButton scrollableTarget="mobileScrollContainer" />
    </div>
  );
};

export default MobileSearchMenu;
