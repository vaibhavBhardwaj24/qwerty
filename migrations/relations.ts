import { relations } from "drizzle-orm/relations";
import {
  users,
  workspace,
  folders,
  files,
  customers,
  products,
  prices,
  subscriptions,
  collaborators,
  todo,
  subTodo,
} from "./schema";

export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  user: one(users, {
    fields: [workspace.owner],
    references: [users.id],
  }),
  files: many(files),
  folders: many(folders),
  collaborators: many(collaborators),
  subTodos: many(subTodo),
  todos: many(todo),
}));

// export const usersRelations = relations(users, ({one, many}) => ({
// 	workspaces: many(workspace),
// 	usersInAuth: one(usersInAuth, {
// 		fields: [users.id],
// 		references: [usersInAuth.id]
// 	}),
// 	subscriptions: many(subscriptions),
// 	collaborators: many(collaborators),
// }));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
  workspace: one(workspace, {
    fields: [files.workspaceId],
    references: [workspace.id],
  }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  files: many(files),
  workspace: one(workspace, {
    fields: [folders.workspaceId],
    references: [workspace.id],
  }),
}));

// export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
// 	users: many(users),
// 	customers: many(customers),
// 	subscriptions: many(subscriptions),
// }));

// export const customersRelations = relations(customers, ({one}) => ({
// 	usersInAuth: one(usersInAuth, {
// 		fields: [customers.id],
// 		references: [usersInAuth.id]
// 	}),
// }));

export const pricesRelations = relations(prices, ({ one, many }) => ({
  product: one(products, {
    fields: [prices.product_id],
    references: [products.id],
  }),
  subscriptions_price_id: many(subscriptions, {
    relationName: "subscriptions_price_id_prices_id",
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	price_price_id: one(prices, {
		fields: [subscriptions.price_id],
		references: [prices.id],
		relationName: "subscriptions_price_id_prices_id"
	}),
	// price_price_id: one(prices, {
	// 	fields: [subscriptions.price_id],
	// 	references: [prices.id],
	// 	relationName: "subscriptions_price_id_prices_id"
	// }),
	// usersInAuth: one(usersInAuth, {
	// 	fields: [subscriptions.user_id],
	// 	references: [usersInAuth.id]
	// }),
	user: one(users, {
		fields: [subscriptions.user_id],
		references: [users.id]
	}),
}));

export const collaboratorsRelations = relations(collaborators, ({ one }) => ({
  user: one(users, {
    fields: [collaborators.collabId],
    references: [users.id],
  }),
  workspace: one(workspace, {
    fields: [collaborators.workspaceId],
    references: [workspace.id],
  }),
}));

export const subTodoRelations = relations(subTodo, ({ one }) => ({
  todo: one(todo, {
    fields: [subTodo.todoId],
    references: [todo.id],
  }),
  workspace: one(workspace, {
    fields: [subTodo.workspaceId],
    references: [workspace.id],
  }),
}));

export const todoRelations = relations(todo, ({ one, many }) => ({
  subTodos: many(subTodo),
  workspace: one(workspace, {
    fields: [todo.workspaceId],
    references: [workspace.id],
  }),
}));
