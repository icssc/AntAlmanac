import { type } from 'arktype'

export const googleUserSchema = type({
    email: 'string',
    name: 'string',
    'picture?': 'string',
})

