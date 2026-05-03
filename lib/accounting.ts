import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type NewTransaction,
  type ProfitAndLossSummary,
  type Transaction,
  transactions,
  users,
} from "@/lib/db/schema";
import "@/lib/env";

const DEMO_USER_ID = process.env.SUYAPA_DEMO_USER_ID;
const DEMO_BUSINESS_NAME = process.env.SUYAPA_DEMO_BUSINESS_NAME;
const DEFAULT_DEMO_PHONE = process.env.SUYAPA_DEMO_PHONE;
export const TEGUCIGALPA_TIME_ZONE = "America/Tegucigalpa";

export async function getDemoUser(phone = DEFAULT_DEMO_PHONE) {
  const normalizedPhone = normalizePhone(phone);

  const [user] = await db
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      phone: normalizedPhone,
      businessName: DEMO_BUSINESS_NAME,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        phone: normalizedPhone,
        businessName: DEMO_BUSINESS_NAME,
      },
    })
    .returning();

  return user;
}

export async function findTransactionBySourceMessageId(
  sourceMessageId: string,
) {
  const [existing] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.sourceMessageId, sourceMessageId))
    .limit(1);

  return existing ?? null;
}

export async function createConfirmedTransaction(
  values: Omit<NewTransaction, "id" | "status" | "currency">,
) {
  const [transaction] = await db
    .insert(transactions)
    .values({
      ...values,
      id: crypto.randomUUID(),
      currency: "HNL",
      status: "confirmed",
    })
    .onConflictDoNothing({ target: transactions.sourceMessageId })
    .returning();

  if (transaction) {
    return transaction;
  }

  return findTransactionBySourceMessageId(values.sourceMessageId);
}

export async function deleteTransaction(id: string) {
  const [transaction] = await db
    .update(transactions)
    .set({ status: "deleted" })
    .where(eq(transactions.id, id))
    .returning();

  return transaction ?? null;
}

export async function getTransaction(id: string) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);

  return transaction ?? null;
}

export async function listActiveUsers() {
  const rows = await db.select().from(users);

  if (rows.length > 0) {
    return rows;
  }

  return [await getDemoUser(DEFAULT_DEMO_PHONE)];
}

export async function getTodaySummary(userId: string, now = new Date()) {
  return getSummaryForLocalDay(userId, now);
}

export async function getSummaryForLocalDay(userId: string, day: Date) {
  const { start, end } = tegucigalpaDayBounds(day);

  const [summary] = await db
    .select({
      ventasCents:
        sql<number>`coalesce(sum(case when ${transactions.type} = 'venta' then ${transactions.totalCents} else 0 end), 0)`.mapWith(
          Number,
        ),
      gastosCents:
        sql<number>`coalesce(sum(case when ${transactions.type} in ('gasto', 'insumo') then ${transactions.totalCents} else 0 end), 0)`.mapWith(
          Number,
        ),
      transactionCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.status, "confirmed"),
        gte(transactions.occurredAt, start),
        lt(transactions.occurredAt, end),
      ),
    );

  const ventasCents = summary?.ventasCents ?? 0;
  const gastosCents = summary?.gastosCents ?? 0;

  return {
    ventasCents,
    gastosCents,
    margenCents: ventasCents - gastosCents,
    transactionCount: summary?.transactionCount ?? 0,
  } satisfies ProfitAndLossSummary;
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("504") ? digits : `504${digits}`;
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("es-HN", {
    timeZone: TEGUCIGALPA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatTransactionLine(transaction: Transaction) {
  const itemLines = transaction.items.map((item) => {
    const lineTotal = item.quantity * item.unit_price_cents;
    return `${item.quantity}x ${item.description} ${formatMoney(
      item.unit_price_cents,
    )} = ${formatMoney(lineTotal)}`;
  });

  return `${itemLines.join("\n")}\nTotal: ${formatMoney(
    transaction.totalCents,
  )}\nHora: ${formatTime(transaction.occurredAt)}`;
}

function tegucigalpaDayBounds(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TEGUCIGALPA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const year = value("year");
  const month = value("month");
  const day = value("day");

  return {
    start: new Date(Date.UTC(year, month - 1, day, 6, 0, 0)),
    end: new Date(Date.UTC(year, month - 1, day + 1, 6, 0, 0)),
  };
}
