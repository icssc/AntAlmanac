const scheduleDataList = require('./export.json')
const { MongoClient } = require('mongodb');
require('dotenv').config({path: '../.env'})

const url = process.env.AA_MONGODB_URI;

async function convert(dbClient) {
    const docs = []

    for (const scheduleDataObj of scheduleDataList) {
        const newFormatObj = {
            "_id": scheduleDataObj['userID'],
            'userData': {
                'addedCourses': [],
                'customEvents': [],
            },
        };

        const courseObjMap = new Map()
        const customEventObjMap = new Map()

        for (const courseEvent of scheduleDataObj['userData']['courseEvents']) {
            if (courseEvent['isCustomEvent'] === false) {
                let course;
                const key = `${courseEvent['courseCode']}${courseEvent['courseTerm']}`

                if (courseObjMap.has(key)) {
                    course = courseObjMap.get(key)

                    if (course['scheduleIndices'].indexOf(courseEvent['scheduleIndex']) === -1) {
                        course['scheduleIndices'].push(courseEvent['scheduleIndex'])
                    }
                } else {
                    course = {
                        'scheduleIndices': [courseEvent['scheduleIndex']],
                        'color': courseEvent['color'] === undefined ? '#4287f5' : courseEvent['color'],
                        'term': courseEvent['courseTerm'],
                        'sectionCode': courseEvent['courseCode'],
                    }
                    courseObjMap.set(key, course)
                }
            } else {
                let customEvent;
                const key = courseEvent['customEventID'].toString()

                if (customEventObjMap.has(key)) {
                    customEvent = customEventObjMap.get(key)

                    if (customEvent['scheduleIndices'].indexOf(courseEvent['scheduleIndex']) === -1 && courseEvent['scheduleIndex'] !== 4) {
                        customEvent['scheduleIndices'].push(courseEvent['scheduleIndex'])
                    }

                    const dayNum = new Date(courseEvent['start']).toString().substring(8,  10)
                    customEvent.days[dayNum - 1] = true
                } else {
                    customEvent = {
                        "days": [
                            false,
                            false,
                            false,
                            false,
                            false
                        ],
                        "scheduleIndices": courseEvent['scheduleIndex'] === 4 ? [0, 1, 2, 3] : [courseEvent['scheduleIndex']],
                        "color": courseEvent['color'],
                        "title": courseEvent['title'],
                        "start": new Date(courseEvent['start']).toString().substring(16,  21),
                        "end": new Date(courseEvent['end']).toString().substring(16,  21),
                        "customEventID": courseEvent['customEventID'].toString()
                    }
                    const dayNum = new Date(courseEvent['start']).toString().substring(8,  10)
                    customEvent.days[dayNum - 1] = true
                    customEventObjMap.set(key, customEvent)
                }
            }
        }

        newFormatObj['userData']['addedCourses'] =[...courseObjMap.values()]
        newFormatObj['userData']['customEvents'] =[...customEventObjMap.values()]
        docs.push(newFormatObj)
    }

    const result = await dbClient.db("aa-prod-db").collection("users").insertMany(docs);
    console.log(`${result.insertedCount} documents were inserted`);
}

(async () => {
    try {
        const client = new MongoClient(url)
        await client.connect()
        await convert(client)
        await client.close()
    } catch (e) {
        console.log(e)
    }
})()