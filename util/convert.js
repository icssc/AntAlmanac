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

        for (const courseEvent of scheduleDataObj['userData']['courseEvents']) {
            if (courseEvent['isCustomEvent'] === false) {
                let course;
                const key = [courseEvent['courseCode'], courseEvent['courseTerm']]

                if (courseObjMap.has(key)) {
                    course = courseObjMap.get(key)
                    course['scheduleIndices'].push(courseEvent['scheduleIndex'])
                } else {
                    course = {
                        'scheduleIndices': [courseEvent['scheduleIndex']],
                        'color': courseEvent['color'] === undefined ? '#4287f5' : courseEvent['color'],
                        'term': courseEvent['courseTerm'],
                        'sectionCode': courseEvent['courseCode'],
                    }
                    courseObjMap.set(key, course)
                }
            }
        }

        newFormatObj['userData']['addedCourses'] =[...courseObjMap.values()]
        docs.push(newFormatObj)
    }

    const result = await dbClient.db("aa-db").collection("users").insertMany(docs);
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