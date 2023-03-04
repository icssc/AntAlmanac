import { procedure, router } from '../trpc'
import UserModel from '$models/User'

const userRouter = router({
  find: procedure.query(async () => {
    const users = UserModel.scan().exec()
    return users
  })
})

export default userRouter
