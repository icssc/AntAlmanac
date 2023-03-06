import { useSearchStore } from '$stores/search'
import SearchForm from './SearchForm'
import SearchResults from './SearchResults'

export default function ClassSearch() {
  const showResults = useSearchStore((store) => store.showResults)

  if (showResults) {
    return <SearchResults />
  }
  return <SearchForm />
}
