import jose from 'jose'
import { googleUserSchema } from 'src/schemas/user';
import { router, procedure } from '../trpc';

const authRouter = router({
    /**
     * Gets the status of the client, i.e whether the client is logged in or not.
     */
    status: procedure.query(async (opts) => {
        const accessToken = opts.ctx.req.cookies.access_token

        if (accessToken == null) {
            console.log('no access token')
            return
        }

        const jwt = jose.decodeJwt(accessToken)

        const result = googleUserSchema(jwt)

        console.log('result', result)

        return result
    }),
})

export default authRouter
