export async function saveUserDB(name, arrayToStore) {
  const response = await fetch(
    // `https://gentle-inlet-23513.herokuapp.com/api/${param}`,

    `https://hqyhurqrgh.execute-api.us-west-1.amazonaws.com/latest/create`,
    {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
        "Content-Type": "application/json; charset=utf-8"
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify({ username: name, schedules: arrayToStore }) // body data type must match "Content-Type" header
    }
  );
  const json = await response.json();
}

export async function getUser(param) {
  const response = await fetch(
    // `https://gentle-inlet-23513.herokuapp.com/api/${param}`
    `https://hqyhurqrgh.execute-api.us-west-1.amazonaws.com/latest/${param}`
  );
  const json = await response.json();

  return json;
}

export async function getCourseData(course) {
  const response = await fetch(
    `https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc?courseCodes=${
      course.courseID
    }&term=${course.courseTerm}`
  );
  const json = await response.json();
  return json;
}

export function getTime() {
  var time = new Date();
  return "Saved at " + time.getHours() + ":" + time.getMinutes();
}

export function convertToCalendar(
  section,
  timeString,
  random_color,
  name,
  termName,
  meeting
) {
  let newClasses = [];

  let [_, dates, start, startMin, end, endMin, ampm] = timeString.match(
    /([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
  );

  start = parseInt(start, 10);
  startMin = parseInt(startMin, 10);
  end = parseInt(end, 10);
  endMin = parseInt(endMin, 10);
  dates = [
    dates.includes("M"),
    dates.includes("Tu"),
    dates.includes("W"),
    dates.includes("Th"),
    dates.includes("F")
  ];

  if (ampm === "p" && end !== 12) {
    start += 12;
    end += 12;
    if (start > end) start -= 12;
  }

  dates.forEach((shouldBeInCal, index) => {
    if (shouldBeInCal) {
      const newClass = {
        color: random_color,
        title: section.classCode + " " + name[0] + " " + name[1],
        start: new Date(2018, 0, index + 1, start, startMin),
        end: new Date(2018, 0, index + 1, end, endMin),
        courseID: section.classCode,
        courseTerm: termName,
        location: meeting,
        type: section.classType,
        customize: false
      };
      newClasses.push(newClass);
    }
  });
  return newClasses;
}

export function getCustomDate(event, id) {
  let obj = [];
  if (id < 0) id = event.courseID;
  event.weekdays.forEach(item => {
    let addCalender = {
      color: "#551a8b",
      title: event.title,
      start: new Date(2018, 0, item, event.start[0], event.start[1]),
      end: new Date(2018, 0, item, event.end[0], event.end[1]),
      courseID: id,
      customize: true
    };
    obj.push(addCalender);
  });
  return obj;
}
