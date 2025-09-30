import { v4 } from "uuid";
import { InferSelectModel } from "drizzle-orm";
import {
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { Edge } from "@xyflow/react";
import { WorkflowNode } from "@/store/workflowStore";

export const user = sqliteTable("User", {
	id: text("id").notNull().primaryKey().$defaultFn(v4),
	email: text("email").notNull(),
});

export type User = InferSelectModel<typeof user>;

export const workflow = sqliteTable("Workflow", {
	id: text("id").notNull().primaryKey().$defaultFn(v4),
	nodes: text("nodes", { mode: 'json' }).$type<WorkflowNode[]>().notNull(),
	edges: text("edges", { mode: 'json' }).$type<Edge[]>().notNull(),
	userId: text("userId").references(() => user.id).notNull(),
});

export type Workflow = InferSelectModel<typeof workflow>;
