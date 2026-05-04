import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "venta",
  "gasto",
  "insumo",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "confirmed",
  "deleted",
]);

export type TransactionItem = {
  description: string;
  quantity: number;
  unit_price_cents: number;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  businessName: text("business_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: transactionTypeEnum("type").notNull(),
    items: jsonb("items").$type<TransactionItem[]>().notNull(),
    totalCents: bigint("total_cents", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("HNL"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    sourceMessageId: text("source_message_id").notNull().unique(),
    status: transactionStatusEnum("status").notNull().default("confirmed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("transactions_user_occurred_idx").on(table.userId, table.occurredAt),
    index("transactions_status_idx").on(table.status),
  ],
);

export const userRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type ProfitAndLossSummary = {
  ventasCents: number;
  gastosCents: number;
  margenCents: number;
  transactionCount: number;
};
