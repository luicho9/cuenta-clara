import { after } from "next/server";
import { getBot } from "@/lib/cuenta-clara-bot";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return await getBot().webhooks.kapso(request, {
      waitUntil: (task) => after(task),
    });
  } catch (error) {
    console.error("[whatsapp webhook]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
