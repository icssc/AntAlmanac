import { z } from 'zod'
import { scheduleSaveStateSchema } from '@packages/types'
import UserModel from '$models/User'
import { procedure, router } from '../trpc'

const saveQuerySchema = z.object({
  id: z.string(),
  scheduleSaveState: scheduleSaveStateSchema,
})

const userRouter = router({
  findAll: procedure.query(async () => {
    const users = await UserModel.scan().exec()
    return users
  }),

  saveSchedule: procedure.input(saveQuerySchema).mutation(async ({ input }) => {
    const user = await UserModel.get({
      id: input.id,
    })

    if (!user) {
      return null
    }

    const updatedUser = await UserModel.update({
      id: input.id,
      schedules: input.scheduleSaveState.schedules,
      scheduleIndex: input.scheduleSaveState.scheduleIndex,
    })
    return updatedUser
  }),

  create: procedure.mutation(async () => {
    const users = await UserModel.get('1')
    return users
  }),
})

export default userRouter
