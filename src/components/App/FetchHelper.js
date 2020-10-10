function calendarize(
  section,
  color,
  courseTerm,
  scheduleIndex,
  name,
  prerequisiteLink
) {
  const events = [];

  section.meetings.forEach((meeting) => {
    const timeString = meeting[0].replace(/\s/g, '');

    if (timeString !== 'TBA') {
      let [, dates, start, startMin, end, endMin, ampm] = timeString.match(
        /([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
      );

      start = parseInt(start, 10);
      startMin = parseInt(startMin, 10);
      end = parseInt(end, 10);
      endMin = parseInt(endMin, 10);
      dates = [
        dates.includes('M'),
        dates.includes('Tu'),
        dates.includes('W'),
        dates.includes('Th'),
        dates.includes('F'),
      ];

      if (ampm === 'p' && end !== 12) {
        start += 12;
        end += 12;
        if (start > end) start -= 12;
      }

      dates.forEach((shouldBeInCal, index) => {
        if (shouldBeInCal) {
          const newEvent = {
            name: name,
            color: color,
            courseTerm: courseTerm,
            title: name[0] + ' ' + name[1],
            location: meeting[1],
            final: section.finalExam,
            section: section,
            courseCode: section.classCode,
            courseType: section.classType,
            start: new Date(2018, 0, index + 1, start, startMin),
            end: new Date(2018, 0, index + 1, end, endMin),
            isCustomEvent: false,
            scheduleIndex: scheduleIndex,
            prerequisiteLink: prerequisiteLink,
          };

          events.push(newEvent);
        }
      });
    } else {
      //tba or online section
      const newEvent = {
        name: name,
        // color: randomColor,
        courseTerm: courseTerm,
        title: name[0] + ' ' + name[1],
        location: meeting[1],
        section: section,
        courseCode: section.classCode,
        courseType: section.classType,
        start: 'tba',
        end: 'tba',
        isCustomEvent: false,
        scheduleIndex: scheduleIndex,
      };

      events.push(newEvent);
    }
  });

  return events;
}

async function getCoursesData(userData) {
  //TODO: Change this API to use POST, integrate into WebSoc-API, decrapify this functionality
  if (userData !== undefined) {
    const courses = userData.courseEvents;
    const dataToSend = [];

    for (let i = 0; i < courses.length; ++i) {
      if (!courses[i].isCustomEvent) {
        dataToSend.push({
          courseCodes: courses[i].courseCode,
          term: courses[i].courseTerm,
        });
      }
    }

    let events = [];

    if (dataToSend.length > 0) {
      const response = await fetch(
        `https://fanrn93vye.execute-api.us-west-1.amazonaws.com/latest/api/codes`,
        {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          redirect: 'follow',
          referrer: 'no-referrer',
          body: JSON.stringify({ dataToSend: dataToSend }),
        }
      );

      const json = await response.json();

      for (const courseEvent of courses) {
        let foundData = null;

        if (!courseEvent.isCustomEvent) {
          for (const courseData of json) {
            if (courseData.section.classCode === courseEvent.courseCode) {
              // name parity shit, pls fix
              foundData = courseData;
              break;
            }
          }
          if (foundData !== null)
            events.push(
              ...calendarize(
                foundData.section,
                courseEvent.color,
                courseEvent.courseTerm,
                courseEvent.scheduleIndex,
                foundData.courseName,
                foundData.prerequisiteLink
              )
            );
        }
      }

      for (const possibleCustomEvent of courses) {
        if (possibleCustomEvent.isCustomEvent) {
          events.push({
            ...possibleCustomEvent,
            start: new Date(possibleCustomEvent.start),
            end: new Date(possibleCustomEvent.end),
          });
        }
      }
    } else {
      for (const customEvent of courses) {
        events.push({
          ...customEvent,
          start: new Date(customEvent.start),
          end: new Date(customEvent.end),
        });
      }
    }
    let canceledClass = false;
    if (dataToSend.length > events.length) canceledClass = true;
    return {
      canceledClass: canceledClass,
      courseEvents: events,
      unavailableColors: userData.unavailableColors,
    };
  } else return -1;
}

export async function saveUserData(userID, objectToStore) {
  await fetch(
    `https://hkdx1omfzh.execute-api.us-west-1.amazonaws.com/latest/create`,
    {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify({ userID: userID, userData: objectToStore }),
    }
  );
}

export async function loadUserData(userID) {
  const response = await fetch(
    `https://hkdx1omfzh.execute-api.us-west-1.amazonaws.com/latest/read`,
    {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify({ userID: userID }),
    }
  );

  return await getCoursesData(await (await response.json()).userData);
}
