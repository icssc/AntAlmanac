import {
  red,
  pink,
  purple,
  indigo,
  deepPurple,
  blue,
  green,
  cyan,
  teal,
  lightGreen,
  lime,
  amber,
  blueGrey,
  orange
} from "@material-ui/core/colors";

const arrayOfColors = [
  red[500],
  red[200],
  red[300],
  red[400],
  pink[500],
  purple[500],
  purple[200],
  purple[300],
  purple[400],
  indigo[500],
  indigo[200],
  indigo[300],
  indigo[400],
  deepPurple[500],
  blue[500],
  blue[200],
  blue[300],
  blue[400],
  green[500],
  green[400],
  green[300],
  green[200],
  cyan[500],
  teal[500],
  teal[200],
  teal[300],
  teal[400],
  lightGreen[500],
  lime[500],
  amber[500],
  amber[400],
  blueGrey[500],
  orange[500],
  orange[400],
  orange[300]
];

export function getColor() {
  return arrayOfColors[Math.floor(Math.random() * arrayOfColors.length)];
}

export async function getCoursesData(courses, ob2) {
  //console.log(courses);
  const params = {};
  for (var i = 0; i < courses.length; ++i) {
    params["courseCodes" + i] = courses[i].courseID;
    params["term" + i] = courses[i].courseTerm;
  }
  params["length"] = courses.length;
  const url = new URL(
    "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/codes?"
  );

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const response = await fetch(url.toString());
  const json = await response.json();
  for (var element of json) {
    const section = element.section;
    const courseName = element.courseName;
    const termName = element.term;

    var foundIndex = courses.findIndex(function(element1) {
      //console.log(element1);
      //console.log(section.classCode, termName);
      return (
        element1.courseID === section.classCode &&
        element1.courseTerm === termName
      );
    });
    //console.log(foundIndex);
    courses[foundIndex]["section"] = section;
    courses[foundIndex]["name"] = courseName;
    for (var pos of courses[foundIndex].index) {
      for (var meeting of section.meetings) {
        const timeString = meeting[0].replace(/\s/g, "");

        const newClasses = convertToCalendar(
          section,
          timeString,
          courses[foundIndex].color,
          courseName,
          termName,
          meeting[1]
        );
        ob2[pos] = ob2[pos].concat(newClasses);
      }
    }
  }
}

export async function saveUserDB(name, arrayToStore) {
  await fetch(
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
}

export async function getUser(param) {
  const response = await fetch(
    // `https://gentle-inlet-23513.herokuapp.com/api/${param}`
    `https://hqyhurqrgh.execute-api.us-west-1.amazonaws.com/latest/${param}`
  );
  const json = await response.json();

  return json;
}

// export async function getCourseData(course) {
//   const response = await fetch(
//     `https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc?courseCodes=${
//       course.courseID
//     }&term=${course.courseTerm}`
//   );
//   const json = await response.json();
//   return json;
// }

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

  let index = 0;
  for (let shouldBeInCal of dates) {
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
    ++index;
  }

  return newClasses;
}

export function getCustomDate(event, id) {
  let obj = [];
  if (id < 0) id = event.courseID;
  event.weekdays.forEach(item => {
    const addCalendar = {
      color: "#551a8b",
      title: event.title,
      start: new Date(2018, 0, item, event.start[0], event.start[1]),
      end: new Date(2018, 0, item, event.end[0], event.end[1]),
      courseID: id,
      customize: true
    };
    obj.push(addCalendar);
  });
  return obj;
}
