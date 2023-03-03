import type { inferAsyncReturnType } from '@trpc/server'
// import type { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

/**
 * TODO: how TypeScript?
 */
export const createContext = (opts: CreateExpressContextOptions) => opts

export type Context = inferAsyncReturnType<typeof createContext>
