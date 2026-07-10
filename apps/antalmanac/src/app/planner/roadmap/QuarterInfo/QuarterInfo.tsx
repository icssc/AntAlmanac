import './QuarterInfo.scss';
import { addDelimiter } from '$planner/helpers/util';
import { useAppSelector } from '$planner/store/hooks';

const QuarterInfo = () => {
    const week = useAppSelector((state) => state.schedule.currentWeek);
    const weekText = addDelimiter(week.split(' | '), <br />);
    return <p className="quarter-info">{weekText}</p>;
};

export default QuarterInfo;
