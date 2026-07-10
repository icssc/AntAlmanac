import { type FC, type ReactNode } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPageNumber } from '../../store/slices/searchSlice';
import { type CourseGQLData, type ProfessorGQLData, type SearchIndex } from '../../types/types';
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
