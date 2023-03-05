import { useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import type { AutocompleteInputChangeReason } from '@mui/material'
import search, { SearchResult } from 'websoc-fuzzy-search'
import { useSearchStore } from '$stores/search'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

const emojiMap = {
  GE_CATEGORY: '🏫', // U+1F3EB :school:
  DEPARTMENT: '🏢', // U+1F3E2 :office:
  COURSE: '📚', // U+1F4DA :books:
  INSTRUCTOR: '🍎', // U+1F34E :apple:
} as const

const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const

export default function FuzzySearch() {
  const { resetFields, setField, setShowResults, form } = useSearchStore()
  const [results, setResults] = useState<Record<string, SearchResult>>({})
  const [cache, setCache] = useState<Record<string, Record<string, SearchResult>>>({})

  function getOptionLabel(option: string) {
    const object = results[option]
    if (!object) {
      return option
    }
    switch (object.type) {
      case 'GE_CATEGORY': {
        const cat = option.split('-')[1].toLowerCase()
        const num = parseInt(cat)
        return `${emojiMap.GE_CATEGORY} GE ${cat.replace(num.toString(), romanArr[num - 1])} (${cat}): ${object.name}`
      }
      case 'DEPARTMENT':
        return `${emojiMap.DEPARTMENT} ${option}: ${object.name}`
      case 'COURSE':
        return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`
      case 'INSTRUCTOR':
        return `${emojiMap.INSTRUCTOR} ${object.name}`
      default:
        return ''
    }
  }

  function handleInputChange(_event: React.SyntheticEvent, query: string, reason: AutocompleteInputChangeReason) {
    if (reason === 'input') {
      setField('fuzzy', query)
      if (cache[query]) {
        setResults(cache[query])
      } else {
        try {
          const result = search({ query, numResults: 10 })
          setResults(result)
          setCache({ ...cache, [query]: result })
        } catch (e) {
          setResults({})
          console.error(e)
        }
      }
    }
  }

  function handleChange(_event: React.SyntheticEvent, v: string | null) {
    const object = results[v || '']
    if (!object || !v) {
      return
    }

    setField('fuzzy', v)

    /**
     * reset the form values whenever a new option is selected
     */
    resetFields(['ge', 'instructor', 'deptValue', 'deptLabel', 'courseNumber'])

    switch (object.type) {
      case 'GE_CATEGORY':
        setField('ge', v)
        break

      case 'INSTRUCTOR':
        setField('instructor', v)
        break

      case 'DEPARTMENT':
        /**
         * values in cache object are objects with string keys mapped to a SearchResult
         * find a value that has a key with the current autocomplete value
         */
        const cachedRecord = Object.values(cache).find((value) => Object.keys(value).includes(v))

        /**
         * access the cachedRecord using the autocomplete value as the key to get the SearchResult
         */
        const result = cachedRecord?.[v]

        setField('deptValue', v)
        setField('deptLabel', `${v}: ${result?.name}`)
        break

      case 'COURSE': {
        /**
         * all values in cache are records with keys that are course names
         * find a cached record that has a key with current autocomplete value
         */
        const cachedRecord = Object.values(cache).find((value) => Object.keys(value).includes(v))

        /**
         * access the record at the autocomplete value to get a SearchResult
         */
        const result = cachedRecord?.[v]

        let deptLabel = result?.name
        if (!deptLabel) {
          const deptSearch = search({ query: v.toLowerCase(), numResults: 1 })
          deptLabel = deptSearch[v].name
          setCache({ ...cache, [v.toLowerCase()]: deptSearch })
        }
        setField('deptValue', result?.metadata.department)
        setField('deptLabel', `${v}: ${deptLabel}`)
        setField('courseNumber', result?.metadata.number)
        break
      }

      default:
        break
    }

    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: analyticsEnum.classSearch.actions.FUZZY_SEARCH,
    })

    /**
     * switch to the course list page and query for the selected option
     */
    setShowResults(true)
  }

  return (
    <Autocomplete
      options={Object.keys(results)}
      fullWidth
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} label="Search" />}
      getOptionLabel={getOptionLabel}
      noOptionsText="No results found! Try broadening your search."
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={form.fuzzy}
    />
  )
}
