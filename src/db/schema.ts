import { v4 } from "uuid";
import { InferSelectModel } from "drizzle-orm";
import {
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("User", {
  id: text("id").notNull().primaryKey().$defaultFn(v4),
  email: text("email").notNull(),
});

export type User = InferSelectModel<typeof user>;
