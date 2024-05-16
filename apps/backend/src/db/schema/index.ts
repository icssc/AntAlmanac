import { integer, pgEnum, pgTable, serial, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable(
    'user',
    {
        id: serial('id').primaryKey(),
        name: varchar('name', { length: 256 }),
    },
);

export const cities = pgTable('cities', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }),
    countryId: integer('country_id').references(() => countries.id),
    popularity: popularityEnum('popularity'),
});
