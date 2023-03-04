import { procedure, router } from '../trpc'
import UserModel from '$models/User'

const userRouter = router({
  findAll: procedure.query(async () => {
    const users = await UserModel.scan().exec()
    return users
  }),
  create: procedure.mutation(async () => {
    const users = await UserModel.get('1')
    return users
  }),
})

export default userRouter
