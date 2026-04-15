import { quarterDisplayNames } from '../helpers/planner';
import { useAppSelector } from '../store/hooks';

export const useNamedAcademicTerm = () => {
  const planner = useAppSelector((state) => state.roadmap.plans[state.roadmap.currentPlanIndex].content.yearPlans);
  const { year, quarter } = useAppSelector((state) => state.roadmap.currentYearAndQuarter) || {};

  if (year == null || quarter == null) return { year: null, quarter: null };

  const quarterName = quarterDisplayNames[planner[year].quarters[quarter].name];
  const yearName = planner[year].startYear + Number(quarterName !== quarterDisplayNames.Fall);
  return { year: yearName, quarter: quarterName };
};
