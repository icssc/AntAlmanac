import { z } from 'zod'
import fetch from 'node-fetch'
import generateFullSchedule from '$services/schedule'
import type { ScheduleSaveState } from '@packages/schemas/schedule'
import { procedure, router } from '../trpc'

const apiBaseUrl = 'https://dev.api.antalmanac.com'
const LOAD_DATA_ENDPOINT = `${apiBaseUrl}/api/users/loadUserData`

type ResponseData = { userData: ScheduleSaveState }

const scheduleRouter = router({
  find: procedure.input(z.string()).query(async ({ input }) => {
    /**
     * TODO: get data from database
     */
    const response = await fetch(LOAD_DATA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: input }),
    })

    const data = (await response.json()) as ResponseData
    const fullSchedule = await generateFullSchedule(data.userData)
    return fullSchedule
  }),
})

export default scheduleRouter
