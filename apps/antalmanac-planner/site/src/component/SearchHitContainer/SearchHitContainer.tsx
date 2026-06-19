import { useEffect, FC, useRef } from 'react';
import './SearchHitContainer.scss';

import { useAppSelector } from '../../store/hooks';
import { CourseGQLData, ProfessorGQLData, SearchIndex } from '../../types/types';

import NoResults from '../NoResults/NoResults';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import CourseHitItem from '../../app/search/CourseHitItem';
import ProfessorHitItem from '../../app/search/ProfessorHitItem';
import InfiniteScrollContainer from '../InfiniteScrollContainer/InfiniteScrollContainer';

interface SearchResultsProps {
  viewIndex: SearchIndex;
  searchResults: CourseGQLData[] | ProfessorGQLData[];
}

const SearchResults: FC<SearchResultsProps> = ({ viewIndex, searchResults }) => {
  return (
    <InfiniteScrollContainer
      viewIndex={viewIndex}
      searchResults={searchResults}
      scrollableTarget="mobileScrollContainer"
    >
      {viewIndex === 'courses'
        ? (searchResults as CourseGQLData[]).map((course) => <CourseHitItem key={course.id} {...course} />)
        : (searchResults as ProfessorGQLData[]).map((professor) => (
            <ProfessorHitItem key={professor.ucinetid} {...professor} />
          ))}
    </InfiniteScrollContainer>
  );
};

const SearchHitContainer: FC = () => {
  const viewIndex = useAppSelector((state) => state.search.viewIndex);
  const { query, results } = useAppSelector((state) => state.search[viewIndex]);
  const searchInProgress = useAppSelector((state) => state.search.inProgressSearchOperation !== 'none');
  const containerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerDivRef.current!.scrollTop = 0;
  }, [results]);

  return (
    <div ref={containerDivRef} className="search-hit-container">
      {searchInProgress && results.length === 0 && <LoadingSpinner />}
      {!searchInProgress && (!query || results.length === 0) && (
        <NoResults
          showPrompt={query === ''}
          prompt={`Start typing in the search bar to search for courses or instructors...`}
        />
      )}
      {query && results.length > 0 && <SearchResults viewIndex={viewIndex} searchResults={results} />}
    </div>
  );
};

export default SearchHitContainer;
