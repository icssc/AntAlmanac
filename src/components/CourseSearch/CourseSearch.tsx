import { useSearchStore } from '$stores/search';
import SearchForm from './SearchForm';
import CourseList from './CourseList';

export default function ClassSearch() {
  const showResults = useSearchStore((store) => store.showResults);

  if (showResults) {
    return <CourseList />;
  } else {
    return <SearchForm />;
  }
}
