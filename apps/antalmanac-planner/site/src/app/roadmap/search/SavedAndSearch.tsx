import './SavedAndSearch.scss';
import React, { FC } from 'react';
import SearchModule from '../../../component/SearchModule/SearchModule';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useSavedCourses } from '../../../hooks/savedCourses';
import { CourseGQLData, ProfessorGQLData, SearchIndex } from '../../../types/types';
import { useGetCoursesInSameQuarter } from '../../../hooks/sameQuarterCourses';
import { deepCopy, useIsMobile } from '../../../helpers/util';
import { getFiltersHint } from '../../../helpers/search';
import { ReactSortable, SortableEvent } from 'react-sortablejs';
import { setActiveCourse, setSelectedSidebarTab } from '../../../store/slices/roadmapSlice';
import { getMissingPrerequisites } from '../../../helpers/planner';
import { courseSearchSortable } from '../../../helpers/sortable';
import Course from '../planner/Course';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import NoResults from '../../../component/NoResults/NoResults';
import { useClearedCoursesUntil } from '../../../hooks/planner';
import ProfessorResult from './ProfessorResult';
import { setSearchViewIndex } from '../../../store/slices/searchSlice';
import SearchFilters from '../../../component/SearchFilters/SearchFilters';
import InfiniteScrollContainer from '../../../component/InfiniteScrollContainer/InfiniteScrollContainer';
import ScrollToTopButton from '../../../component/ScrollToTopButton/ScrollToTopButton';
import { setSelectedTab } from '../../../store/slices/courseRequirementsSlice';
import Button from '@mui/material/Button';

interface SearchResultsProps {
  viewIndex: SearchIndex;
  searchResults: CourseGQLData[] | ProfessorGQLData[];
}

const SearchResults: FC<SearchResultsProps> = ({ viewIndex, searchResults }) => {
  return (
    <InfiniteScrollContainer
      viewIndex={viewIndex}
      searchResults={searchResults}
      scrollableTarget="sidebarScrollContainer"
    >
      {viewIndex === 'instructors' ? (
        <ProfessorResultsContainer searchResults={searchResults as ProfessorGQLData[]} />
      ) : (
        <CourseResultsContainer searchResults={searchResults as CourseGQLData[]} />
      )}
    </InfiniteScrollContainer>
  );
};

interface CourseResultsContainerProps {
  searchResults: CourseGQLData[];
}

const CourseResultItem: FC<{ course: CourseGQLData; addMode: 'tap' | 'drag' }> = ({ course, addMode }) => {
  const courseId = `${course.department} ${course.courseNumber}`;
  const clearedCourses = useClearedCoursesUntil(courseId);
  const coursesInCurrentQuarter = useGetCoursesInSameQuarter(courseId);

  const missingPrerequisites = getMissingPrerequisites(
    clearedCourses,
    course.prerequisiteTree,
    coursesInCurrentQuarter,
  );

  return <Course data={course} addMode={addMode} requiredCourses={missingPrerequisites} />;
};

const CourseResultsContainer: FC<CourseResultsContainerProps> = ({ searchResults }) => {
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const setDraggedItem = (event: SortableEvent) => {
    const course = searchResults[event.oldIndex!];
    dispatch(setActiveCourse({ course }));
  };

  // Deep copy because Sortable requires data to be extensible (non read-only). Must be done within component
  const copiedResults = deepCopy(searchResults);

  return (
    <ReactSortable
      {...courseSearchSortable}
      list={copiedResults}
      onStart={setDraggedItem}
      onEnd={() => dispatch(setActiveCourse(null))}
      disabled={isMobile}
      /**
       * @todo merge classNames for `roadmap-search-results` for courses + profs after getting
       * rid of independent search pages
       */
      className={'roadmap-search-results' + (isMobile ? ' disabled' : '')}
    >
      {copiedResults.map((course, i) => (
        <CourseResultItem key={i} course={course} addMode={isMobile ? 'tap' : 'drag'} />
      ))}
    </ReactSortable>
  );
};

interface ProfessorResultsContainerProps {
  searchResults: ProfessorGQLData[];
}

const ProfessorResultsContainer: FC<ProfessorResultsContainerProps> = ({ searchResults }) => {
  return (
    <div className="professor-results">
      {searchResults.map((prof) => {
        return <ProfessorResult key={prof.ucinetid} data={prof} />;
      })}
    </div>
  );
};

interface ShowSavedProps {
  showSavedCoursesOnEmpty?: boolean;
  autoFocusSearch?: boolean;
}

export const ResultsHeader: FC<ShowSavedProps> = ({ showSavedCoursesOnEmpty }) => {
  const inProgressSearch = useAppSelector((state) => state.search.inProgressSearchOperation);
  const showSavedCourses = useAppSelector((state) => !!showSavedCoursesOnEmpty && state.roadmap.showSavedCourses);
  const viewIndex = useAppSelector((state) => state.search.viewIndex);
  const showMobileCatalog = useAppSelector((state) => state.roadmap.showMobileCatalog);
  const dispatch = useAppDispatch();

  const singularIndexType = viewIndex.replace(/s$/, '');
  const otherIndexType: SearchIndex = viewIndex === 'courses' ? 'instructors' : 'courses';

  const resultsOther = useAppSelector((state) => state.search[otherIndexType].results);

  if (inProgressSearch === 'newQuery') return null;

  if (showSavedCourses) {
    return <h3 className="results-list-title">Saved Courses</h3>;
  }

  if (showMobileCatalog) {
    return <h3 className="results-list-title">Search Results</h3>;
  }

  const switchViewIndex = (event: React.MouseEvent) => {
    event.preventDefault();
    dispatch(setSearchViewIndex(otherIndexType));
  };

  return (
    <p className="result-type-header">
      Showing {singularIndexType} results.{' '}
      {resultsOther.length > 0 && (
        <a className="results-switcher" href={`#${otherIndexType}`} onClick={switchViewIndex}>
          Show {otherIndexType}
        </a>
      )}
    </p>
  );
};

const SavedAndSearch: FC<ShowSavedProps> = ({ showSavedCoursesOnEmpty, autoFocusSearch = false }) => {
  const showSavedCourses = useAppSelector((state) => !!showSavedCoursesOnEmpty && state.roadmap.showSavedCourses);
  const showMobileCatalog = useAppSelector((state) => state.roadmap.showMobileCatalog);
  const viewIndex = useAppSelector((state) => (showMobileCatalog ? 'courses' : state.search.viewIndex));
  const results = useAppSelector((state) => state.search[viewIndex].results);
  const courseCount = useAppSelector((state) => state.search.courses.count);
  const hasQuery = useAppSelector((state) => !!state.search[viewIndex].query);
  const inProgressSearch = useAppSelector((state) => state.search.inProgressSearchOperation);
  const { savedCourses } = useSavedCourses();
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const searchResults = showSavedCourses ? savedCourses : results;
  const showCustomCourseLink = hasQuery && !showSavedCourses && viewIndex === 'courses';

  const openLibrary = () => {
    dispatch(setSelectedTab('Library'));
    if (!isMobile) dispatch(setSelectedSidebarTab(1));
  };

  const showCustomPrompt = showSavedCourses || !hasQuery;
  const customPrompt = showSavedCourses
    ? 'No courses saved. Try searching for something!'
    : 'Start typing in the search bar to search for courses or instructors...';

  const showHeader = showSavedCoursesOnEmpty || hasQuery;
  const filtersDimmed = hasQuery && viewIndex === 'instructors';
  const filtersHint = getFiltersHint(filtersDimmed, courseCount > 0);

  return (
    <>
      <SearchModule autoFocusInput={autoFocusSearch} />
      <SearchFilters dimmed={filtersDimmed} hint={filtersHint} addTopPadding />
      {showHeader && <ResultsHeader showSavedCoursesOnEmpty />}
      {inProgressSearch === 'newQuery' || inProgressSearch === 'newFilters' ? (
        <LoadingSpinner />
      ) : searchResults.length === 0 ? (
        <>
          <NoResults showPrompt={showCustomPrompt} prompt={customPrompt} />
          {showCustomCourseLink && (
            <div className="custom-course-empty-action">
              <Button type="button" onClick={openLibrary}>
                Add a custom course
              </Button>
            </div>
          )}
        </>
      ) : (
        <SearchResults viewIndex={viewIndex} searchResults={searchResults} />
      )}
      {!isMobile && <ScrollToTopButton scrollableTarget="sidebarScrollContainer" />}
    </>
  );
};

export default SavedAndSearch;
