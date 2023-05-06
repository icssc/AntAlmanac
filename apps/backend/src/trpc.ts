import { initTRPC } from '@trpc/server'
import type { context } from './context'
import superjson from 'superjson'

const { procedure, router, _config, mergeRouters, middleware } = initTRPC.context<context>().create({
    transformer: superjson
    }
)

export { procedure, router, _config, mergeRouters, middleware }
