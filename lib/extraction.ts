import { gateway, generateText, NoOutputGeneratedError, Output } from "ai";
import { z } from "zod";

const itemSchema = z.object({
  description: z
    .string()
    .min(2)
    .describe("Nombre corto del producto, servicio o insumo."),
  quantity: z.number().positive().describe("Cantidad vendida o comprada."),
  unit_price_cents: z
    .number()
    .int()
    .positive()
    .describe("Precio unitario en centavos de HNL."),
});

export const extractedTransactionSchema = z
  .object({
    type: z.enum(["venta", "gasto", "insumo"]),
    items: z.array(itemSchema).min(1),
    total_cents: z.number().int().positive(),
    occurred_at: z.string().datetime(),
    confidence: z.number().min(0).max(1),
  })
  .refine(
    (transaction) => {
      const itemTotal = transaction.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price_cents,
        0,
      );
      return Math.abs(itemTotal - transaction.total_cents) <= 1;
    },
    {
      message:
        "El total debe coincidir con cantidad por precio unitario de los items.",
      path: ["total_cents"],
    },
  );

export type ExtractedTransaction = z.infer<typeof extractedTransactionSchema>;

const extractionResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("transaction"),
    transaction: extractedTransactionSchema,
  }),
  z.object({
    kind: z.literal("not_transaction"),
    reason: z
      .string()
      .min(2)
      .describe("Razón breve por la que el mensaje no es una transacción."),
    confidence: z.number().min(0).max(1),
  }),
]);

const extractionSystemPrompt = `Eres Suyapa, una contadora hondureña para micro-negocios de LATAM.
Extraes UNA transacción contable desde mensajes de WhatsApp en español hondureño o inglés, incluyendo transcripciones de audio desordenadas.

Reglas:
- Entiende mensajes en español e inglés, pero devuelve los valores del esquema exactamente como están definidos.
- Devuelve siempre HNL (Lempiras) y cantidades en centavos.
- Clasifica como "venta" cuando entra dinero por ventas o servicios.
- Clasifica como "gasto" cuando sale dinero por renta, luz, nómina, transporte, comisiones u operación general.
- Clasifica como "insumo" cuando compra inventario o materiales para vender/prestar servicio, por ejemplo shampoo, tortillas, carne, refrescos, navajas o productos.
- Si el mensaje es una pregunta, saludo, comando, solicitud de resumen o no contiene un movimiento contable concreto, devuelve kind "not_transaction".
- Si el usuario se corrige a media frase ("dos cortes... no, esperáte, tres"), usa el último valor mencionado.
- Si no hay fecha u hora explícita, usa la fecha actual proporcionada.
- Si falta precio, cantidad, tipo o hay ambigüedad fuerte, baja confidence por debajo de 0.6.
- No inventes conceptos que el mensaje no contiene.

Ejemplos:
- "vendí 3 cortes a 200 cada uno" -> type venta, items [{ description: "corte", quantity: 3, unit_price_cents: 20000 }], total_cents 60000.
- "compré shampoo por 800" -> type insumo, items [{ description: "shampoo", quantity: 1, unit_price_cents: 80000 }], total_cents 80000.
- "pagué 350 de luz" -> type gasto, items [{ description: "luz", quantity: 1, unit_price_cents: 35000 }], total_cents 35000.
- "I sold 2 haircuts at 150 each" -> type venta, items [{ description: "haircut", quantity: 2, unit_price_cents: 15000 }], total_cents 30000.
- "what did I sell today?" -> kind not_transaction.
- "hola" -> kind not_transaction.`;

export async function extractTransactionFromMessage(
  text: string,
  now = new Date(),
): Promise<ExtractedTransaction | null> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { output } = await generateText({
        model: gateway("anthropic/claude-sonnet-4.6"),
        output: Output.object({
          name: "TransactionExtractionResult",
          description:
            "Resultado de extraer una transacción contable de un mensaje de WhatsApp.",
          schema: extractionResultSchema,
        }),
        system: extractionSystemPrompt,
        prompt: `Fecha actual: ${now.toISOString()}
Mensaje del dueño:
${text}`,
      });

      if (output.kind === "not_transaction") {
        return null;
      }

      return output.transaction;
    } catch (error) {
      lastError = error;
    }
  }

  if (NoOutputGeneratedError.isInstance(lastError)) {
    return null;
  }

  throw lastError;
}
