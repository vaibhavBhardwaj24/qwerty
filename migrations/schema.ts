import { pgTable, foreignKey, pgEnum, uuid, timestamp, text, boolean, jsonb, bigint, integer, uniqueIndex } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const aal_level = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const code_challenge_method = pgEnum("code_challenge_method", ['s256', 'plain'])
export const factor_status = pgEnum("factor_status", ['unverified', 'verified'])
export const factor_type = pgEnum("factor_type", ['totp', 'webauthn'])
export const one_time_token_type = pgEnum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])
export const key_status = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const key_type = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const pricing_plan_interval = pgEnum("pricing_plan_interval", ['day', 'week', 'month', 'year'])
export const pricing_type = pgEnum("pricing_type", ['one_time', 'recurring'])
export const subscription_status = pgEnum("subscription_status", ['trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const equality_op = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])


export const workspace = pgTable("workspace", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow(),
	owner: uuid("owner").notNull().references(() => users.id),
	title: text("title").notNull(),
	iconId: text("iconId").notNull(),
	data: text("data"),
	inTrash: text("inTrash"),
	logo: text("logo"),
	bannerURL: text("bannerURL"),
	private: boolean("private").default(true),
});

export const files = pgTable("files", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow(),
	owner: uuid("owner").notNull(),
	title: text("title").notNull(),
	iconId: text("iconId").notNull(),
	data: text("data"),
	inTrash: text("inTrash"),
	bannerURL: text("bannerURL"),
	workspaceId: uuid("workspaceId").references(() => workspace.id, { onDelete: "cascade" } ),
	folderId: uuid("folderId").references(() => folders.id, { onDelete: "cascade" } ),
});

export const folders = pgTable("folders", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow(),
	owner: text("owner").notNull(),
	title: text("title").notNull(),
	iconId: text("iconId").notNull(),
	data: text("data"),
	inTrash: text("inTrash"),
	bannerURL: text("bannerURL"),
	workspaceId: uuid("workspaceId").references(() => workspace.id, { onDelete: "cascade" } ),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().notNull(),
	full_name: text("full_name"),
	avatar_url: text("avatar_url"),
	updated_at: timestamp("updated_at", { mode: 'string' }),
	email: text("email"),
},
(table) => {
	return {
		users_id_fkey: foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey"
		}),
	}
});

export const customers = pgTable("customers", {
	id: uuid("id").primaryKey().notNull().references(() => users.id),
	stripe_customer_id: text("stripe_customer_id"),
});

export const products = pgTable("products", {
	id: text("id").primaryKey().notNull(),
	active: boolean("active"),
	name: text("name"),
	description: text("description"),
	image: text("image"),
	metadata: jsonb("metadata"),
});

export const prices = pgTable("prices", {
	id: text("id").primaryKey().notNull(),
	product_id: text("product_id").references(() => products.id),
	active: boolean("active"),
	description: text("description"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	unit_amount: bigint("unit_amount", { mode: "number" }),
	currency: text("currency"),
	type: pricing_type("type"),
	interval: pricing_plan_interval("interval"),
	interval_count: integer("interval_count"),
	trial_period_days: integer("trial_period_days"),
	metadata: jsonb("metadata"),
});

export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id).references(() => users.id),
	status: subscription_status("status"),
	metadata: jsonb("metadata"),
	price_id: text("price_id").references(() => prices.id).references(() => prices.id),
	quantity: integer("quantity"),
	cancel_at_period_end: boolean("cancel_at_period_end"),
	// created: timestamp("created", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())).notNull(),
	// current_period_start: timestamp("current_period_start", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())).notNull(),
	// current_period_end: timestamp("current_period_end", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())).notNull(),
	// ended_at: timestamp("ended_at", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())),
	// cancel_at: timestamp("cancel_at", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())),
	// canceled_at: timestamp("canceled_at", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())),
	// trial_start: timestamp("trial_start", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())),
	// trial_end: timestamp("trial_end", { withTimezone: true, mode: 'string' }).default(timezone('utc'::text, now())),
});

export const collaborators = pgTable("collaborators", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow(),
	workspaceId: uuid("workspaceId").notNull().references(() => workspace.id, { onDelete: "cascade" } ),
	collabId: uuid("collabId").notNull().references(() => users.id, { onDelete: "cascade" } ),
	email: text("email"),
},
(table) => {
	return {
		composite_key: uniqueIndex("composite_key").using("btree", table.workspaceId, table.collabId),
	}
});

export const subTodo = pgTable("subTodo", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	isCompleted: boolean("isCompleted").default(false),
	subTask: text("subTask").notNull(),
	dueDate: timestamp("dueDate", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow(),
	workspaceId: uuid("workspaceId").references(() => workspace.id, { onDelete: "cascade" } ),
	todoId: uuid("todoId").references(() => todo.id, { onDelete: "cascade" } ),
});

export const todo = pgTable("todo", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	isCompleted: boolean("isCompleted").default(false),
	isUrgent: boolean("isUrgent").default(false),
	task: text("task").notNull(),
	dueDate: timestamp("dueDate", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow(),
	workspaceId: uuid("workspaceId").references(() => workspace.id, { onDelete: "cascade" } ),
});