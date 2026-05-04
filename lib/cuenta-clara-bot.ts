import { createRedisState } from "@chat-adapter/state-redis";
import type { KapsoRawMessage } from "@luicho/kapso-chat-sdk";
import { createKapsoAdapter } from "@luicho/kapso-chat-sdk";
import {
  Actions,
  Button,
  Card,
  type CardElement,
  Chat,
  type Message,
  CardText as Text,
  type Thread,
} from "chat";
import {
  createConfirmedTransaction,
  deleteTransaction,
  findTransactionBySourceMessageId,
  formatMoney,
  formatTransactionLine,
  getDemoUser,
  getTodaySummary,
} from "@/lib/accounting";
import type {
  ProfitAndLossSummary,
  Transaction,
  TransactionItem,
} from "@/lib/db/schema";
import { extractTransactionFromMessage } from "@/lib/extraction";
import "@/lib/env";

const DELETE_ACTION_ID = "delete_transaction";
const SUMMARY_ACTION_ID = "show_summary";
const CLOSING_CONFIRM_ACTION_ID = "confirm_daily_close";
const CLOSING_ADJUST_ACTION_ID = "adjust_daily_close";

let botInstance: Chat | null = null;

export function getBot() {
  if (botInstance) {
    return botInstance;
  }

  const bot = new Chat({
    userName: "Cuenta Clara",
    adapters: {
      kapso: createKapsoAdapter({
        userName: process.env.KAPSO_BOT_USERNAME,
      }),
    },
    state: createRedisState(),
    dedupeTtlMs: 10 * 60 * 1000,
    logger: process.env.NODE_ENV === "production" ? "info" : "debug",
  });

  registerHandlers(bot);
  botInstance = bot;

  return botInstance;
}

function registerHandlers(bot: Chat) {
  bot.onDirectMessage(async (thread, message) => {
    await handleAccountingMessage(thread as Thread<unknown>, message);
  });
  bot.onSubscribedMessage(async (thread, message) => {
    await handleAccountingMessage(thread as Thread<unknown>, message);
  });

  bot.onAction(DELETE_ACTION_ID, async (event) => {
    if (!event.value || !event.thread) {
      return;
    }

    const deleted = await deleteTransaction(event.value);

    if (!deleted) {
      await event.thread.post("No encontré ese registro para borrarlo.");
      return;
    }

    await event.thread.post(
      `Listo, borré ese movimiento: ${formatMoney(deleted.totalCents)}.`,
    );
  });

  bot.onAction(SUMMARY_ACTION_ID, async (event) => {
    if (!event.thread) {
      return;
    }

    const user = await getDemoUser(readPhoneFromAuthor(event.user.userId));
    const summary = await getTodaySummary(user.id);
    await postSummaryCard(event.thread, summary);
  });

  bot.onAction(CLOSING_CONFIRM_ACTION_ID, async (event) => {
    await event.thread?.post(
      "Cierre confirmado. Mañana seguimos con las cuentas.",
    );
  });

  bot.onAction(CLOSING_ADJUST_ACTION_ID, async (event) => {
    await event.thread?.post(
      "Mándame el movimiento correcto en audio o texto y lo registro de nuevo.",
    );
  });
}

export async function sendDailySummaryToActiveUser(phone: string) {
  const user = await getDemoUser(phone);
  const summary = await getTodaySummary(user.id);
  const thread = await getBot().openDM(user.phone);

  await thread.post({
    card: buildDailyCloseCard(summary),
    fallbackText: summaryFallbackText(summary),
  });
}

async function handleAccountingMessage(
  thread: Thread<unknown>,
  message: Message<unknown>,
) {
  await thread.subscribe();

  const raw = asKapsoRawMessage(message.raw);
  const text = normalizeInboundText(message, raw);

  if (isSummaryCommand(text)) {
    const user = await getDemoUser(readPhoneFromMessage(message, raw));
    await postSummaryCard(thread, await getTodaySummary(user.id));
    return;
  }

  const sourceMessageId = getSourceMessageId(message, raw);
  const existing = await findTransactionBySourceMessageId(sourceMessageId);

  if (existing) {
    await thread.post({
      card: buildConfirmationCard(existing),
      fallbackText: confirmationFallbackText(existing),
    });
    return;
  }

  const extracted = await extractTransactionFromMessage(text);

  if (!extracted || extracted.confidence < 0.6) {
    await thread.post(
      "No alcancé a entender bien el movimiento. ¿Me lo mandas con cantidad, concepto y precio? Ejemplo: vendí 3 cortes a 200.",
    );
    return;
  }

  const user = await getDemoUser(readPhoneFromMessage(message, raw));
  const transaction = await createConfirmedTransaction({
    userId: user.id,
    type: extracted.type,
    items: extracted.items as TransactionItem[],
    totalCents: extracted.total_cents,
    occurredAt: new Date(extracted.occurred_at),
    sourceMessageId,
  });

  if (!transaction) {
    await thread.post("Ese mensaje ya estaba registrado.");
    return;
  }

  await thread.post({
    card: buildConfirmationCard(transaction),
    fallbackText: confirmationFallbackText(transaction),
  });
}

function buildConfirmationCard(transaction: Transaction): CardElement {
  return Card({
    title: `${transactionEmoji(transaction.type)} ${transactionTitle(
      transaction.type,
    )} registrada`,
    children: [
      Text(formatTransactionLine(transaction)),
      Actions([
        Button({
          id: DELETE_ACTION_ID,
          label: "Borrar",
          value: transaction.id,
          style: "danger",
        }),
        Button({
          id: SUMMARY_ACTION_ID,
          label: "Ver resumen",
          style: "primary",
        }),
      ]),
    ],
  });
}

function buildSummaryCard(summary: ProfitAndLossSummary): CardElement {
  return Card({
    title: "Resumen de hoy",
    children: [
      Text(summaryBody(summary)),
      Actions([
        Button({
          id: CLOSING_ADJUST_ACTION_ID,
          label: "Ajustar",
        }),
      ]),
    ],
  });
}

function buildDailyCloseCard(summary: ProfitAndLossSummary): CardElement {
  return Card({
    title: "Cierre del día",
    children: [
      Text(summaryBody(summary)),
      Actions([
        Button({
          id: CLOSING_CONFIRM_ACTION_ID,
          label: "Confirmar",
          style: "primary",
        }),
        Button({
          id: CLOSING_ADJUST_ACTION_ID,
          label: "Ajustar",
        }),
      ]),
    ],
  });
}

async function postSummaryCard(
  thread: Thread<unknown>,
  summary: ProfitAndLossSummary,
) {
  await thread.post({
    card: buildSummaryCard(summary),
    fallbackText: summaryFallbackText(summary),
  });
}

function summaryBody(summary: ProfitAndLossSummary) {
  return [
    `Ventas: ${formatMoney(summary.ventasCents)}`,
    `Gastos: ${formatMoney(summary.gastosCents)}`,
    `Margen: ${formatMoney(summary.margenCents)}`,
    `Movimientos: ${summary.transactionCount}`,
  ].join("\n");
}

function confirmationFallbackText(transaction: Transaction) {
  return `${transactionTitle(transaction.type)} registrada\n${formatTransactionLine(
    transaction,
  )}`;
}

function summaryFallbackText(summary: ProfitAndLossSummary) {
  return `Cierre del día - Ventas ${formatMoney(
    summary.ventasCents,
  )} / Gastos ${formatMoney(summary.gastosCents)} / Margen ${formatMoney(
    summary.margenCents,
  )}`;
}

function normalizeInboundText(message: Message<unknown>, raw: KapsoRawMessage) {
  const transcript = raw.message.kapso?.transcript;
  return (
    transcript?.text ??
    transcript?.body ??
    raw.message.kapso?.content?.toString() ??
    message.text
  ).trim();
}

function isSummaryCommand(text: string) {
  const normalized = text.trim();

  return (
    /^\/?(resumen|summary|cierre)\b/i.test(normalized) ||
    /\b(what did i sell today|today'?s sales|sales today|daily summary)\b/i.test(
      normalized,
    ) ||
    /\b(cu[aá]nto vend[ií] hoy|ventas de hoy|resumen de hoy)\b/i.test(
      normalized,
    )
  );
}

function getSourceMessageId(message: Message<unknown>, raw: KapsoRawMessage) {
  return raw.message.id || message.id;
}

function readPhoneFromMessage(message: Message<unknown>, raw: KapsoRawMessage) {
  return (
    raw.identity.phoneNumber ??
    raw.identity.waId ??
    raw.userWaId ??
    readPhoneFromAuthor(message.author.userId)
  );
}

function asKapsoRawMessage(raw: unknown): KapsoRawMessage {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "message" in raw &&
    "identity" in raw
  ) {
    return raw as KapsoRawMessage;
  }

  return {
    phoneNumberId: process.env.KAPSO_PHONE_NUMBER_ID ?? "demo",
    identity: {
      primary: {
        kind: "wa_id",
        value: "50400000000",
      },
      waId: "50400000000",
      phoneNumber: "50400000000",
    },
    userWaId: "50400000000",
    message: {
      id: crypto.randomUUID(),
      from: "50400000000",
      timestamp: String(Math.floor(Date.now() / 1000)),
      type: "text",
      text: { body: "" },
    },
  };
}

function readPhoneFromAuthor(userId: string) {
  return userId.replace(/^kapso:/, "");
}

function transactionEmoji(type: Transaction["type"]) {
  switch (type) {
    case "venta":
      return "✂️";
    case "gasto":
      return "💸";
    case "insumo":
      return "🧴";
  }
}

function transactionTitle(type: Transaction["type"]) {
  switch (type) {
    case "venta":
      return "Venta";
    case "gasto":
      return "Gasto";
    case "insumo":
      return "Insumo";
  }
}
