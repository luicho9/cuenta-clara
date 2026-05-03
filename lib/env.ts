import "dotenv/config";
import { z } from "zod";

const envVariables = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  AI_GATEWAY_API_KEY: z.string(),
  KAPSO_API_KEY: z.string(),
  KAPSO_PHONE_NUMBER_ID: z.string(),
  KAPSO_WEBHOOK_SECRET: z.string(),
  KAPSO_BOT_USERNAME: z.string().default("Suyapa"),
  CRON_SECRET: z.string(),
  SUYAPA_DEMO_USER_ID: z
    .string()
    .uuid()
    .default("00000000-0000-4000-8000-000000000001"),
  SUYAPA_DEMO_BUSINESS_NAME: z.string().default("Mi negocio"),
  SUYAPA_DEMO_PHONE: z.string().default("50400000000"),
  NEXT_PUBLIC_SUYAPA_WHATSAPP: z.string().default("50400000000"),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
