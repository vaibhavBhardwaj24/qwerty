import {
  boolean,
  integer,
  jsonb,
  pgTable,
  PgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { prices, subscription_status, users } from "../../../migrations/schema";
import { sql } from "drizzle-orm";
export const workspace = pgTable("workspace", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  owner: uuid("owner").notNull(),
  title: text("title").notNull(),
  iconId: text("iconId").notNull(),
  data: text("data"),
  inTrash: text("inTrash"),
  logo: text("logo"),
  private: boolean("private").default(true),
  bannerURL: text("bannerURL"),
});
export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  isCompleted: boolean("isCompleted").default(false),
  isUrgent: boolean("isUrgent").default(false),
  task: text("task").notNull(),
  dueDate: timestamp("dueDate", {
    withTimezone: true,
    mode: "string",
  }),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  workspaceId: uuid("workspaceId").references(() => workspace.id, {
    onDelete: "cascade",
  }),
});
export const subTodo = pgTable("subTodo", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  isCompleted: boolean("isCompleted").default(false),
  subTask: text("subTask").notNull(),
  dueDate: timestamp("dueDate", {
    withTimezone: true,
    mode: "string",
  }),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  workspaceId: uuid("workspaceId").references(() => workspace.id, {
    onDelete: "cascade",
  }),
  todoId: uuid("todoId").references(() => todo.id, {
    onDelete: "cascade",
  }),
});
export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  owner: text("owner").notNull(),
  title: text("title").notNull(),
  iconId: text("iconId").notNull(),
  data: text("data"),
  inTrash: text("inTrash"),
  bannerURL: text("bannerURL"),
  workspaceId: uuid("workspaceId").references(() => workspace.id, {
    onDelete: "cascade",
  }),
});
export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  owner: uuid("owner").notNull(),
  title: text("title").notNull(),
  iconId: text("iconId").notNull(),
  data: text("data"),
  inTrash: text("inTrash"),
  bannerURL: text("bannerURL"),
  workspaceId: uuid("workspaceId").references(() => workspace.id, {
    onDelete: "cascade",
  }),
  folderId: uuid("folderId").references(() => folders.id, {
    onDelete: "cascade",
  }),
});

export const collaborators = pgTable(
  "collaborators",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    addedAt: timestamp("createdAt", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    workspaceId: uuid("workspaceId")
      .references(() => workspace.id, {
        onDelete: "cascade",
      })
      .notNull(),
    collabId: uuid("collabId")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    email: text("email"),
  },
  (table) => {
    return {
      compositeKey: uniqueIndex("composite_key").on(
        table.workspaceId,
        table.collabId
      ),
    };
  }
);

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  status: subscription_status("status"),
  metadata: jsonb("metadata"),
  price_id: text("price_id").references(() => prices.id),
  quantity: integer("quantity"),
  cancel_at_period_end: boolean("cancel_at_period_end"),
  created: timestamp("created", { withTimezone: true, mode: "string" })
    .default(sql`now()`)
    .notNull(),
  current_period_start: timestamp("current_period_start", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`now()`)
    .notNull(),
  current_period_end: timestamp("current_period_end", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`now()`)
    .notNull(),
  ended_at: timestamp("ended_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  cancel_at: timestamp("cancel_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  canceled_at: timestamp("canceled_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  trial_start: timestamp("trial_start", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  trial_end: timestamp("trial_end", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
});
