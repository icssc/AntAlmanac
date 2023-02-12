import { useState } from 'react';
import { Autocomplete, Button, TextField } from '@mui/material';
import type { AutocompleteInputChangeReason } from '@mui/material';
import search, { SearchResult } from 'websoc-fuzzy-search';
import { useSearchStore } from '$stores/search';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import useWebsocQuery from '$hooks/useQueryWebsoc';

const emojiMap = {
  GE_CATEGORY: '🏫', // U+1F3EB :school:
  DEPARTMENT: '🏢', // U+1F3E2 :office:
  COURSE: '📚', // U+1F4DA :books:
  INSTRUCTOR: '🍎', // U+1F34E :apple:
} as const;

const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

export default function FuzzySearch() {
  const { reset, value: formValue, setField } = useSearchStore();
  const [results, setResults] = useState<Record<string, SearchResult>>({});
  const [cache, setCache] = useState<Record<string, Record<string, SearchResult>>>({});
  const [params, setParams] = useState({});
  const query = useWebsocQuery(params, {
    enabled: Object.keys(params).length > 0,
  });

  function getOptionLabel(option: string) {
    const object = results[option];
    if (!object) {
      return option;
    }
    switch (object.type) {
      case 'GE_CATEGORY': {
        const cat = option.split('-')[1].toLowerCase();
        const num = parseInt(cat);
        return `${emojiMap.GE_CATEGORY} GE ${cat.replace(num.toString(), romanArr[num - 1])} (${cat}): ${object.name}`;
      }
      case 'DEPARTMENT':
        return `${emojiMap.DEPARTMENT} ${option}: ${object.name}`;
      case 'COURSE':
        return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`;
      case 'INSTRUCTOR':
        return `${emojiMap.INSTRUCTOR} ${object.name}`;
      default:
        return '';
    }
  }

  function handleInputChange(_event: React.SyntheticEvent, query: string, reason: AutocompleteInputChangeReason) {
    if (reason === 'input') {
      if (cache[query]) {
        setResults(cache[query]);
      } else {
        try {
          const result = search({ query, numResults: 10 });
          setResults(result);
          setCache({ ...cache, [query]: result });
        } catch (e) {
          setResults({});
          console.error(e);
        }
      }
    }
  }

  function handleChange(_event: React.SyntheticEvent, v: string | null) {
    const object = results[v || ''];
    if (!object || !v) {
      return;
    }

    /**
     * reset the form values whenever a new option is selected
     */
    reset();

    switch (object.type) {
      case 'GE_CATEGORY':
        setField('ge', v);
        break;

      case 'INSTRUCTOR':
        setField('instructor', v);
        break;

      case 'DEPARTMENT':
        /**
         * values in cache object are objects with string keys mapped to a SearchResult
         * find a value that has a key with the current autocomplete value
         */
        const cachedRecord = Object.values(cache).find((value) => Object.keys(value).includes(v));

        /**
         * access the cachedRecord using the autocomplete value as the key to get the SearchResult
         */
        const result = cachedRecord?.[v];

        setField('deptValue', v);
        setField('deptLabel', `${v}: ${result?.name}`);
        break;

      case 'COURSE': {
        /**
         * all values in cache are records with keys that are course names
         * find a cached record that has a key with current autocomplete value
         */
        const cachedRecord = Object.values(cache).find((value) => Object.keys(value).includes(v));

        /**
         * access the record at the autocomplete value to get a SearchResult
         */
        const result = cachedRecord?.[v];

        let deptLabel = result?.name;
        if (!deptLabel) {
          const deptSearch = search({ query: v.toLowerCase(), numResults: 1 });
          deptLabel = deptSearch[v].name;
          setCache({ ...cache, [v.toLowerCase()]: deptSearch });
        }
        setField('deptValue', v);
        setField('deptLabel', `${v}: ${deptLabel}`);
        setField('courseNumber', result?.metadata.number);
        break;
      }

      default:
        break;
    }

    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: analyticsEnum.classSearch.actions.FUZZY_SEARCH,
    });
  }

  async function handleSubmit() {
    const formData = formValue();
    const params = {
      department: formData.deptValue,
      term: formData.term,
      ge: formData.ge,
      courseNumber: formData.courseNumber,
      sectionCodes: formData.sectionCode,
      instructorName: formData.instructor,
      units: formData.units,
      endTime: formData.endTime,
      startTime: formData.startTime,
      fullCourses: formData.coursesFull,
      building: formData.building,
      room: formData.room,
    };
    setParams(params);
  }

  return (
    <>
      <Autocomplete
        options={Object.keys(results)}
        renderInput={(params) => <TextField {...params} label="Search" />}
        getOptionLabel={getOptionLabel}
        noOptionsText="No results found! Try broadening your search."
        onChange={handleChange}
        onInputChange={handleInputChange}
      />
      <Button onClick={handleSubmit}>Submit FOrm</Button>
      {JSON.stringify(query.data)}
    </>
  );
}
