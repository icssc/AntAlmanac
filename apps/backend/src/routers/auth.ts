import { type } from 'arktype'
import jose from 'jose'
import { router, procedure } from '../trpc';

export const loginSchema = type({
    email: 'string',
    name: 'string',
    'picture?': 'string',
})

const authRouter = router({
    check: procedure.mutation(async (opts) => {
        console.log(opts.ctx.req.cookies)

        const accessToken = opts.ctx.req.cookies.access_token

        if (accessToken == null) {
            console.log('no access token')
            return
        }

        const jwt = jose.decodeJwt(accessToken)

        const result = loginSchema(jwt)

        console.log('result: ', result)
    }),
})

export default authRouter
