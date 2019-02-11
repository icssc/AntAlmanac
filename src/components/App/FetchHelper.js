function calendarize(section, color, courseTerm, scheduleIndex, name) {
  const events = [];

  section.meetings.forEach(meeting => {
    const timeString = meeting[0].replace(/\s/g, "");

    if (timeString !== 'TBA') {
      let [_, dates, start, startMin, end, endMin, ampm] = timeString.match(/([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/);

      start = parseInt(start, 10);
      startMin = parseInt(startMin, 10);
      end = parseInt(end, 10);
      endMin = parseInt(endMin, 10);
      dates = [dates.includes('M'), dates.includes('Tu'), dates.includes('W'), dates.includes('Th'), dates.includes('F')];

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
            section: section,
            courseCode: section.classCode,
            courseType: section.classType,
            start: new Date(2018, 0, index + 1, start, startMin),
            end: new Date(2018, 0, index + 1, end, endMin),
            isCustomEvent: false,
            scheduleIndex: scheduleIndex
          };

          events.push(newEvent);
        }
      });
    }
  });

  return events;
}

async function getCoursesData(userData) {
  //TODO: Change this API to use POST, integrate into WebSoc-API, decrapify this functionality
  const courses = userData.courseEvents;
  const params = {};
  let numClasses = 0;

  for (let i = 0; i < courses.length; ++i) {
    if (!courses[i].isCustomEvent) {
      params["courseCodes" + i] = courses[i].courseCode;
      params["term" + i] = courses[i].courseTerm;
      numClasses++;
    }
  }
  params["length"] = numClasses;

  const events = [];

  if (numClasses > 0) {
    const url = new URL(
      "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/codes?"
    );

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    console.log(url.toString());

    const response = await fetch(url.toString());
    const json = await response.json(); //is it an array or obj



    for (const savedEvent of json) {
      let stripped = null;

      for (const strippedCourse of courses) {
        if (savedEvent.section.classCode === strippedCourse.courseCode) { // name parity shit, pls fix
          stripped = strippedCourse;
        }
      }

      events.push(...calendarize(savedEvent.section, stripped.color, savedEvent.term, stripped.scheduleIndex, savedEvent.courseName));
    }

    for (const possibleCustomEvent of courses) {
      if (possibleCustomEvent.isCustomEvent) {
        events.push({...possibleCustomEvent, start: new Date(possibleCustomEvent.start), end: new Date(possibleCustomEvent.end)});
      }
    }
  } else {
    for (const customEvent of courses) {
      events.push({...customEvent, start: new Date(customEvent.start), end: new Date(customEvent.end)});
    }
  }

  return {courseEvents: events, unavailableColors: userData.unavailableColors};
}

export async function saveUserData(userID, objectToStore) {
  await fetch(
    `https://a0pg5v5sai.execute-api.us-west-1.amazonaws.com/latest/create`,
    {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify({userID: userID, userData: objectToStore})
    }
  );
}

export async function loadUserData(userID) {
  const response = await fetch(
    `https://a0pg5v5sai.execute-api.us-west-1.amazonaws.com/latest/read`,
    {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify({userID: userID})
    }
  );

  return await getCoursesData(await (await response.json()).userData);
}