import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    date,
    foreignKey,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    real,
    serial,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';

export const user = pgTable(
    'user',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        name: text('name').notNull(),
        email: text('email').notNull(),
        picture: text('picture').notNull(),
        theme: text('theme'),
        lastRoadmapEditAt: timestamp('last_roadmap_edit_at'),
        currentPlanIndex: integer('current_plan_index').notNull().default(0),
        autoSaveEnabled: boolean('auto_save_enabled').notNull().default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        /**
         * MCP daily request quota. `mcpRequestCount` is the number of MCP tool calls the
         * user has made on `mcpRequestDay` (a UTC calendar day). The counter resets implicitly
         * the first time a request is seen on a new day, so no cleanup job is needed.
         * See `controllers/mcp/rateLimit.ts`.
         */
        mcpRequestCount: integer('mcp_request_count').notNull().default(0),
        mcpRequestDay: date('mcp_request_day'),
    },
    (table) => [unique('unique_email').on(table.email)]
);

export const providerEnum = pgEnum('provider', ['GOOGLE', 'APPLE']);

export const account = pgTable(
    'account',
    {
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
            .notNull(),
        provider: providerEnum('provider').notNull(),
        providerAccountId: text('provider_account_id').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.provider] }),
        unique('unique_provider_account_id').on(table.providerAccountId),
    ]
);

export const report = pgTable(
    'report',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        reviewId: integer('review_id')
            .notNull()
            .references(() => review.id, { onDelete: 'cascade' }),
        reason: text('reason').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('reports_review_id_idx').on(table.reviewId)]
);

export const review = pgTable(
    'review',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        professorId: text('professor_id').notNull(),
        courseId: text('course_id').notNull(),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id),
        anonymous: boolean('anonymous').notNull(),
        content: text('content'),
        rating: integer('rating').notNull(),
        difficulty: integer('difficulty').notNull(),
        gradeReceived: text('grade_received'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at'),
        forCredit: boolean('for_credit').notNull(),
        quarter: text('quarter').notNull(),
        takeAgain: boolean('take_again'),
        textbook: boolean('textbook'),
        attendance: boolean('attendance'),
        tags: text('tags').array(),
        verified: boolean('verified').notNull().default(false),
    },
    (table) => [
        check('rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
        check('difficulty_check', sql`${table.difficulty} >= 1 AND ${table.difficulty} <= 5`),
        unique('unique_review').on(table.userId, table.professorId, table.courseId),
        index('reviews_professor_id_idx').on(table.professorId),
        index('reviews_course_id_idx').on(table.courseId),
    ]
);

export const planner = pgTable(
    'planner',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),
        name: text('name').notNull(),
        shareId: text('share_id'),
        chc: text('chc'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index('planners_user_id_idx').on(table.userId),
        unique('unique_planner_user_id_name').on(table.userId, table.name),
    ]
);

export const plannerYear = pgTable(
    'planner_year',
    {
        plannerId: integer('planner_id')
            .references(() => planner.id, { onDelete: 'cascade' })
            .notNull(),
        startYear: integer('start_year').notNull(),
        name: text('name').notNull(),
        collapsed: boolean('collapsed').default(false).notNull(),
    },
    (table) => [primaryKey({ columns: [table.plannerId, table.startYear] })]
);

export const plannerQuarter = pgTable(
    'planner_quarter',
    {
        plannerId: integer('planner_id').notNull(),
        startYear: integer('start_year').notNull(),
        quarterName: text('quarter_name').notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.plannerId, table.startYear, table.quarterName] }),
        foreignKey({
            columns: [table.plannerId, table.startYear],
            foreignColumns: [plannerYear.plannerId, plannerYear.startYear],
        }).onDelete('cascade'),
    ]
);

export const customCard = pgTable(
    'custom_card',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
            .notNull(),
        name: text('name').notNull(),
        description: text('description').notNull(),
        units: real('units').notNull().default(0),
    },
    (table) => [index('custom_card_user_id_idx').on(table.userId)]
);

export const plannerCourse = pgTable(
    'planner_course',
    {
        plannerId: integer('planner_id').notNull(),
        startYear: integer('start_year').notNull(),
        quarterName: text('quarter_name').notNull(),
        index: integer('index').notNull(),
        courseId: text('course_id').notNull(),
        customCardId: integer('custom_card_id').references(() => customCard.id, { onDelete: 'set null' }),
        units: real('units'),
    },
    (table) => [
        primaryKey({ columns: [table.plannerId, table.startYear, table.quarterName, table.index] }),
        foreignKey({
            columns: [table.plannerId, table.startYear, table.quarterName],
            foreignColumns: [plannerQuarter.plannerId, plannerQuarter.startYear, plannerQuarter.quarterName],
        }).onDelete('cascade'),
        check(
            'planner_course_custom_card_id_check',
            sql`(${table.customCardId} IS NOT NULL) = (${table.courseId} = 'CUSTOM')`
        ),
    ]
);

export const plannerMajor = pgTable(
    'planner_major',
    {
        id: serial('id').primaryKey().notNull(),
        plannerId: integer('planner_id')
            .references(() => planner.id, { onDelete: 'cascade' })
            .notNull(),
        majorId: text('major_id').notNull(),
        specializationId: text('specialization_id'),
    },
    (table) => [index('planner_major_planner_id_idx').on(table.plannerId)]
);

export const plannerMinor = pgTable(
    'planner_minor',
    {
        id: serial('id').primaryKey().notNull(),
        plannerId: integer('planner_id')
            .references(() => planner.id, { onDelete: 'cascade' })
            .notNull(),
        minorId: text('minor_id'),
    },
    (table) => [index('planner_minor_planner_id_idx').on(table.plannerId)]
);

export const userMajor = pgTable(
    'user_major',
    {
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
            .notNull(),
        majorId: text('major_id').notNull(),
        specializationId: text('specialization_id'),
    },
    (table) => [primaryKey({ columns: [table.userId, table.majorId] })]
);

export const userMinor = pgTable(
    'user_minor',
    {
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
            .notNull(),
        minorId: text('minor_id').notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.minorId] })]
);

export const transferredMisc = pgTable(
    'transferred_misc',
    {
        userId: integer('user_id').references(() => user.id),
        courseName: text('course_name'),
        units: real('units'),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.courseName] }),
        index('transferred_courses_user_id_idx').on(table.userId),
    ]
);

export const vote = pgTable(
    'vote',
    {
        reviewId: integer('review_id')
            .notNull()
            .references(() => review.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => user.id),
        vote: integer('vote').notNull(),
    },
    (table) => [
        check('votes_vote_check', sql`${table.vote} = 1 OR ${table.vote} = -1`),
        primaryKey({ columns: [table.reviewId, table.userId] }),
        index('votes_user_id_idx').on(table.userId),
    ]
);

export const savedCourse = pgTable(
    'saved_course',
    {
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),
        courseId: text('course_id').notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.courseId] })]
);

export const courseNotes = pgTable(
    'course_notes',
    {
        userId: integer('user_id').references(() => user.id),
        courseId: text('course_id').notNull(),
        content: text('content'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.courseId] })]
);

export const zot4PlanImports = pgTable(
    'zot4plan_imports',
    {
        scheduleId: text('schedule_id').notNull(),
        userId: integer('user_id').references(() => user.id),
        timestamp: timestamp('timestamp')
            .notNull()
            .default(sql`now()`),
    },
    (table) => [primaryKey({ columns: [table.scheduleId, table.timestamp] })]
);

export const session = pgTable('session', {
    sid: text('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
});

export const transferredApExam = pgTable(
    'transferred_ap_exam',
    {
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),
        examName: text('exam_name').notNull(),
        score: integer('score'),
        units: real('units').notNull(),
    },
    (table) => [
        check('score_in_range', sql`${table.score} IS NULL OR (${table.score} >= 1 AND ${table.score} <= 5)`),
        primaryKey({ columns: [table.userId, table.examName] }),
    ]
);

export const selectedApReward = pgTable(
    'transferred_ap_exam_reward_selection',
    {
        userId: integer('user_id').notNull(),
        examName: text('exam_name').notNull(),
        path: text('path').notNull(),
        selectedIndex: integer('selected_index').notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId, table.examName],
            foreignColumns: [transferredApExam.userId, transferredApExam.examName],
        }).onDelete('cascade'),
        primaryKey({ columns: [table.userId, table.examName, table.path] }),
    ]
);

export const transferredGe = pgTable(
    'transferred_ge',
    {
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),
        geName: text('ge_name').notNull(),
        numberOfCourses: integer('number_of_courses').notNull(),
        units: real('units').notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.geName] })]
);

export const transferredCourse = pgTable(
    'transferred_course',
    {
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),
        courseName: text('course_name').notNull(),
        units: real('units').notNull().default(0),
    },
    (table) => [primaryKey({ columns: [table.userId, table.courseName] })]
);

export const completedMarkerRequirement = pgTable(
    'completed_marker_requirement',
    {
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),
        markerName: text('marker_name').notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.markerName] })]
);

export const userMajorCatalogYear = pgTable(
    'user_major_catalog_year',
    {
        userId: integer('user_id').notNull(),
        majorId: text('major_id').notNull(),
        catalogYear: text('catalog_year'),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.majorId] }),
        foreignKey({
            columns: [table.userId, table.majorId],
            foreignColumns: [userMajor.userId, userMajor.majorId],
        }).onDelete('cascade'),
    ]
);

export const userMinorCatalogYear = pgTable(
    'user_minor_catalog_year',
    {
        userId: integer('user_id').notNull(),
        minorId: text('minor_id').notNull(),
        catalogYear: text('catalog_year'),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.minorId] }),
        foreignKey({
            columns: [table.userId, table.minorId],
            foreignColumns: [userMinor.userId, userMinor.minorId],
        }).onDelete('cascade'),
    ]
);

export const override = pgTable(
    'override',
    {
        userId: integer('user_id')
            .references(() => user.id)
            .notNull(),

        plannerId: integer('planner_id')
            .references(() => planner.id, { onDelete: 'cascade' })
            .notNull(),

        requirement: text('requirement').notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.plannerId, table.requirement] }),

        index('override_user_planner_idx').on(table.userId, table.plannerId),
    ]
);

/**
 * Tables backing the MCP server's OAuth 2.1 authorization server.
 *
 * The MCP server lets external AI agents authenticate a student (via the existing OIDC
 * provider) and act on their behalf. These tables persist OAuth state across stateless
 * invocations: registered clients, in-flight authorize requests, one-time authorization codes,
 * and issued bearer tokens. Secrets (auth codes, access/refresh tokens) are stored only as
 * SHA-256 hashes; the raw values live solely on the client. See `controllers/mcp/`.
 */

/** Dynamically-registered OAuth clients (RFC 7591). `info` holds the full client record. */
export const mcpClient = pgTable('mcp_client', {
    clientId: text('client_id').primaryKey(),
    info: jsonb('info').$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * In-flight authorization requests. Created when a client hits `/authorize`; the browser is
 * then bounced to the OIDC provider. The callback looks the row up by `state` to resume the flow.
 */
export const mcpAuthRequest = pgTable('mcp_auth_request', {
    state: text('state').primaryKey(),
    clientId: text('client_id').notNull(),
    redirectUri: text('redirect_uri').notNull(),
    clientState: text('client_state'),
    codeChallenge: text('code_challenge').notNull(),
    scopes: jsonb('scopes').$type<string[]>().notNull(),
    googleCodeVerifier: text('google_code_verifier').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** One-time authorization codes (hashed) issued after a successful @uci.edu login. */
export const mcpAuthCode = pgTable('mcp_auth_code', {
    codeHash: text('code_hash').primaryKey(),
    userId: integer('user_id')
        .references(() => user.id, { onDelete: 'cascade' })
        .notNull(),
    clientId: text('client_id').notNull(),
    redirectUri: text('redirect_uri').notNull(),
    codeChallenge: text('code_challenge').notNull(),
    scopes: jsonb('scopes').$type<string[]>().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mcpTokenTypeEnum = pgEnum('mcp_token_type', ['access', 'refresh']);

/** Issued access/refresh tokens (hashed). `verifyAccessToken` resolves these back to a user. */
export const mcpToken = pgTable(
    'mcp_token',
    {
        tokenHash: text('token_hash').primaryKey(),
        type: mcpTokenTypeEnum('type').notNull(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
            .notNull(),
        clientId: text('client_id').notNull(),
        scopes: jsonb('scopes').$type<string[]>().notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index('mcp_token_user_id_idx').on(table.userId)]
);
