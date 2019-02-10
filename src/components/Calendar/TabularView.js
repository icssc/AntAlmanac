import React, {Component} from 'react';

class TabularView extends Component {
  render() {
    return (
      <table>
        <thead>
        <tr>
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
        {this.props.classEventsInCalendar.map(event => {
          if (!event.isCustomEvent) {
            const section = event.section;
            return (
              <tr>
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