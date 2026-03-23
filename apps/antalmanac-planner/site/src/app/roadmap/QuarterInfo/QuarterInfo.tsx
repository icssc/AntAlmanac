import './QuarterInfo.scss';
import { useAppSelector } from '../../../store/hooks';
import { addDelimiter } from '../../../helpers/util';

const QuarterInfo = () => {
  const week = useAppSelector((state) => state.schedule.currentWeek);
  const weekText = addDelimiter(week.split(' | '), <br />);
  return <p className="quarter-info">{weekText}</p>;
};

export default QuarterInfo;
