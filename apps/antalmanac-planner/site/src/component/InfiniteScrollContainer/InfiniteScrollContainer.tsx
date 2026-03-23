import { FC, ReactNode } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { CourseGQLData, ProfessorGQLData, SearchIndex } from '../../types/types';
import { setPageNumber } from '../../store/slices/searchSlice';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface InfiniteScrollContainerProps {
  children: ReactNode;
  scrollableTarget: string;
  viewIndex: SearchIndex;
  searchResults: CourseGQLData[] | ProfessorGQLData[];
}

const InfiniteScrollContainer: FC<InfiniteScrollContainerProps> = ({
  children,
  scrollableTarget,
  viewIndex,
  searchResults,
}) => {
  const dispatch = useAppDispatch();
  const { pageNumber, count } = useAppSelector((state) => state.search[viewIndex]);

  const updatePageNumber = () => {
    dispatch(setPageNumber(pageNumber + 1));
  };

  return (
    <div id={scrollableTarget}>
      <InfiniteScroll
        dataLength={searchResults.length}
        next={updatePageNumber}
        hasMore={searchResults.length < count}
        loader={<LoadingSpinner />}
        scrollableTarget={scrollableTarget}
        style={{ overflow: '' }}
      >
        {children}
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteScrollContainer;
