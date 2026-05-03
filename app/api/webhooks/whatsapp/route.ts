import { getBot } from "@/lib/suyapa-bot";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return await getBot().webhooks.kapso(request);
  } catch (error) {
    console.error("[whatsapp webhook]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
