import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda'

/**
 * TODO: how TypeScript?
 */
export const createContext = (opts: CreateAWSLambdaContextOptions<unknown>) => opts

export type Context = inferAsyncReturnType<typeof createContext>
