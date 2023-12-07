import { GoogleUserSchema } from '@packages/antalmanac-types';
import { decodeJwt } from 'jose'
import { router, procedure } from '../trpc';

const authRouter = router({
    /**
     * Gets the status of the client, i.e whether the client is logged in or not.
     */
    status: procedure.query(async (opts) => {
        /**
         * The client will append any Google ID token in their possession to the `Authorization` header.
         */
        const googleIdToken = opts.ctx.req.headers.authorization

        if (googleIdToken == null) {
            console.log('no access token')
            return
        }

        const jwt = decodeJwt(googleIdToken)

        const result = GoogleUserSchema(jwt)

        return result.data
    }),
})

export default authRouter
