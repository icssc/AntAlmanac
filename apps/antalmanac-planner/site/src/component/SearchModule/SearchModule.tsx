import { useState, FC } from 'react';
import './SearchModule.scss';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { SearchIndex } from '../../types/types';
import { setShowSavedCourses } from '../../store/slices/roadmapSlice';
import { setFirstPageResults, setQuery } from '../../store/slices/searchSlice';

import { InputAdornment, IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchTrigger } from '../../hooks/search.ts';

const SEARCH_TIMEOUT_MS = 300;

interface SearchModuleProps {
  index?: SearchIndex;
}

const SearchModule: FC<SearchModuleProps> = () => {
  const dispatch = useAppDispatch();
  const index = useAppSelector((state) => state.search.viewIndex);
  const search = useAppSelector((state) => state.search[index]);
  const showMobileCatalog = useAppSelector((state) => state.roadmap.showMobileCatalog);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequest, setPendingRequest] = useState<number | null>(null);
  useSearchTrigger();

  const searchImmediately = (query: string) => {
    if (pendingRequest) clearTimeout(pendingRequest);
    if (location.pathname === '/planner') {
      dispatch(setShowSavedCourses(!query));
    }
    if (query !== search.query) {
      dispatch(setQuery(query));
      setPendingRequest(null);
      // if empty query, remove all results
      if (!query) {
        dispatch(setFirstPageResults({ index: 'courses', count: 0, results: [] }));
        dispatch(setFirstPageResults({ index: 'instructors', count: 0, results: [] }));
      }
    }
  };

  const searchAfterTimeout = (query: string) => {
    setSearchQuery(query);
    if (pendingRequest) clearTimeout(pendingRequest);
    const timeout = window.setTimeout(() => searchImmediately(query), SEARCH_TIMEOUT_MS);
    setPendingRequest(timeout);
  };

  const placeholder = showMobileCatalog ? 'Search for a course...' : 'Search for a course or instructor...';

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton aria-label="Search" onClick={() => searchImmediately(searchQuery)}>
        <SearchIcon />
      </IconButton>
    </InputAdornment>
  );

  return (
    <div className="search-module">
      <TextField
        variant="outlined"
        className="search-bar"
        aria-label="search"
        type="text"
        placeholder={placeholder}
        onChange={(e) => searchAfterTimeout(e.target.value)}
        defaultValue={search.query}
        autoCorrect="off"
        slotProps={{ input: { endAdornment, className: 'input-wrapper' } }}
      />
    </div>
  );
};

export default SearchModule;
