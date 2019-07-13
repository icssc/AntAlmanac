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
            let [
                ,
                dates,
                start,
                startMin,
                end,
                endMin,
                ampm,
            ] = timeString.match(
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
                        id: Math.floor(Math.random() * 1000000000),
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
    console.log(userData);

    if (userData !== undefined) {
        const dataToSend = [];

        for (let i = 0; i < userData.addedCourses.length; ++i) {
            dataToSend.push({
                courseCodes: userData.addedCourses[i].sectionCode,
                term: userData.addedCourses[i].term,
            });
        }

        let addedCourses = [];
        let customEvents = userData.customEvents;

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

            const courseDataJson = await response.json();

            for (const course of addedCourses) {
                let foundData = null;

                for (const courseData of courseDataJson) {
                    if (courseData.section.sectionCode === course.sectionCode) {
                        foundData = courseData;
                        break;
                    }
                }

                if (foundData !== null)
                    addedCourses.push(
                        ...calendarize(
                            foundData.section,
                            course.color,
                            course.courseTerm,
                            course.scheduleIndex,
                            foundData.courseName,
                            foundData.prerequisiteLink
                        )
                    );
            }
        }

        for (let customEvent of customEvents) {
            customEvent.start = new Date(customEvent.start);
            customEvent.end = new Date(customEvent.end);
        }

        return {
            // canceledClass: dataToSend.length > addedCourses.length,
            addedCourses: addedCourses,
            customEvents: customEvents,
        };
    } else {
        return -1;
    }
}

export async function saveUserData(userID, objectToStore) {
    // console.log(JSON.stringify({ userID: userID, userData: objectToStore }));
    await fetch(
        // `https://a0pg5v5sai.execute-api.us-west-1.amazonaws.com/latest/create`,
        `https://qkruslenf8.execute-api.us-west-1.amazonaws.com/latest/create`,
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
        // `https://a0pg5v5sai.execute-api.us-west-1.amazonaws.com/latest/read`,
        `https://qkruslenf8.execute-api.us-west-1.amazonaws.com/latest/read`,
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
