import { listActiveUsers } from "@/lib/accounting";
import { sendDailySummaryToActiveUser } from "@/lib/cuenta-clara-bot";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const activeUsers = await listActiveUsers();

    await Promise.all(
      activeUsers.map((user) => sendDailySummaryToActiveUser(user.phone)),
    );

    return Response.json({
      ok: true,
      sent: activeUsers.length,
    });
  } catch (error) {
    console.error("[daily summary cron]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
