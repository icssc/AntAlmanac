import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

const createContext = (opts: CreateExpressContextOptions) => opts
export type context = typeof createContext
export default createContext
