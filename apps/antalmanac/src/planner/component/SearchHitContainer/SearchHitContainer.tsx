import CourseHitItem from '$plannerApp/search/CourseHitItem';

import './SearchHitContainer.scss';
import ProfessorHitItem from '$plannerApp/search/ProfessorHitItem';
import { type FC, useEffect, useRef } from 'react';

import { useAppSelector } from '../../store/hooks';
import { type CourseGQLData, type ProfessorGQLData, type SearchIndex } from '../../types/types';
import InfiniteScrollContainer from '../InfiniteScrollContainer/InfiniteScrollContainer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import NoResults from '../NoResults/NoResults';

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
