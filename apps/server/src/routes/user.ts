import { z } from 'zod'
import { procedure, router } from '../trpc'
import { scheduleSaveStateSchema } from '@packages/schemas/schedule'
import UserModel from '$models/User'

const saveQuerySchema = z.object({
  id: z.string(),
  scheduleSaveState: scheduleSaveStateSchema
})

const userRouter = router({
  findAll: procedure.query(async () => {
    const users = await UserModel.scan().exec()
    return users
  }),

  saveSchedule: procedure.input(saveQuerySchema).mutation(async ({ input }) => {
    const user = await UserModel.get({
      id: input.id
    })

    if (!user) {
      return null
    }

    const updatedUser = await UserModel.update(
        {
          id: input.id,
          schedules: input.scheduleSaveState.schedules,
          scheduleIndex: input.scheduleSaveState.scheduleIndex,
        },
    )
    return updatedUser
  }),

  create: procedure.mutation(async () => {
    const users = await UserModel.get('1')
    return users
  }),
})

export default userRouter
