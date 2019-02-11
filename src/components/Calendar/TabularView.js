import React, {Component} from 'react';
import ColorPicker from './colorPicker'

class TabularView extends Component {

  render() {    
    const events = this.props.classEventsInCalendar;

    let result =[];

    for(var item of events)
      if(undefined === result.find(function(element){return element.courseCode===item.courseCode;}))
        result.push(item);

    
    console.log(result,"ll");

    // var i =0;
    // var foundIndex =0;
    // for(var schedule of schedules)
    // {
    //   for(var event of schedule)
    //   {
    //     foundIndex = newArr[i].findIndex(function(element){
    //      return ( element.name.join() === event.name.join()&& element.courseTerm ===event.courseTerm);
    //    });

    //    if(foundIndex === -1)
    //      {
    //        newArr[i].push({
    //          name : event.name,
    //          section :[{sec:event.section,color:event.color}],
    //          courseID:event.courseID,
    //          courseTerm :event.courseTerm
    //        }
    //        );
    //      }
    //      else
    //          newArr[i][foundIndex].section.push({sec:event.section,color:event.color});
    //   }
    //   i++;
    // }

    return (
      <table>
        <thead>
        <tr>
          <th>Color</th>
          <th>Code</th>
          <th>Type</th>
          <th>Instructor</th>
          <th>Time</th>
          <th>Place</th>
          <th>Enrollmt</th>
          <th>Rstr</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        {result.map(event => {
          if (!event.isCustomEvent) {
            const section = event.section;
            return (
              <tr>
        <ColorPicker  colorChange={this.props.colorChange} event ={event} />
                <td>{section.classCode}</td>
                <td className="multiline">
                  {`${section.classType}
Sec ${section.sectionCode}
${section.units} units`}
                </td>
                <td className="multiline">
                  {section.instructors.join("\n")}
                </td>
                <td className="multiline">
                  {section.meetings.map(meeting => meeting[0]).join("\n")}
                </td>
                <td className="multiline">
                  {section.meetings.map(meeting => meeting[1]).join("\n")}
                </td>
                <td className={["multiline", section.status].join(" ")}>
                  {`${section.numCurrentlyEnrolled[0]} / ${section.maxCapacity}
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
                </td>
                <td>
                  <a
                    href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {section.restrictions}
                  </a>
                </td>
                <td className={section.status}>{section.status}</td>
              </tr>
            );
          }
        })}
        </tbody>
      </table>
    );
  }
}

export default TabularView;