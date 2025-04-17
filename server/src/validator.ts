import { z } from "zod";
import { SYSTEM_ROLE, USER_ROLE } from "./helper";

// UUID v4 regex: ensures the version is 4 and variant is 8, 9, a, or b
const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type Bindings = {
  KV: KVNamespace;
  HYPERDRIVE: Hyperdrive;
  BUCKET: R2Bucket;
  SECRET: string;
  NODE_ENV: string;
  API_URL: string;
  GEMINI_API_KEY: string;
  RESEND_API_KEY: string;
  SENTRY_DSN: string;
};

export type Env = {
  //Variables: Variables;
  Bindings: Bindings;
};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests within the window
  routePrefix?: string;
}

export const newChatSchema = z.object({
  chatId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for chatId",
  }),
  prompt: z
    .string({
      message: "Prompt is required",
    })
    .min(1, {
      message: "Prompt must be at least 1 word",
    }),
});

export const newChatMessageSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt must be at least 1 word",
  }),
  chatId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for chatId",
  }),
  userMessageId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for userMessageId",
  }),
  systemMessageId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for systemMessageId",
  }),
  lastMessage: z
    .object({
      id: z.string(),
      text: z.string(),
    })
    .nullable()
    .optional(),
  history: z.array(
    z.object({
      role: z.string(),
      parts: z.array(
        z.object({
          text: z.string(),
        })
      ),
    })
  ),
});

export const newAgentsChatMessageSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt must be at least 1 word",
  }),
  chatId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for chatId",
  }),
  userMessageId: z
    .string()
    .refine((val) => uuidV4Regex.test(val), {
      message: "Invalid UUID v4 format for userMessageId",
    })
    .nullable()
    .optional(),
  systemMessageId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for systemMessageId",
  }),
  lastMessage: z
    .object({
      id: z.string(),
      text: z.string(),
    })
    .nullable()
    .optional(),
  history: z.array(
    z.object({
      role: z.string(),
      parts: z.array(
        z.object({
          text: z.string(),
        })
      ),
    })
  ),
  agent: z.object({
    id: z.number().nullable().optional(),
    name: z.string(),
    description: z.string(),
    prompt: z.string(),
    consecutiveReply: z.boolean().nullable().optional().default(false),
  }),
  talkMore: z.boolean().default(false),
  selectedAI: z.string().default(""),
});

export const addChatMessageSchema = z.object({
  text: z.string().min(1, {
    message: "Text must be at least 1 word",
  }),
  chatId: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for chatId",
  }),
  id: z.string().refine((val) => uuidV4Regex.test(val), {
    message: "Invalid UUID v4 format for messageId",
  }),
  role: z.enum([USER_ROLE, SYSTEM_ROLE]),
});

export const generatePersonaSchema = z.object({
  persona: z.string().min(1, {
    message: "Persona must be at least 1 word",
  }),
});

export const newAgentSchema = z.object({
  name: z
    .string({
      message: "Name is required",
    })
    .min(1, {
      message: "Name must be at least 1 word",
    }),
  description: z
    .string({
      message: "Description is required",
    })
    .min(1, {
      message: "Description must be at least 1 word",
    }),
  prompt: z
    .string({
      message: "Prompt is required",
    })
    .min(1, {
      message: "Prompt must be at least 1 word",
    }),
});

export const updateMemorySchema = z.object({
  history: z.array(
    z.object({
      role: z.string(),
      parts: z.array(
        z.object({
          text: z.string(),
        })
      ),
    })
  ),
});

export const sendCodeSchema = z.object({
  email: z
    .string({
      message: "Email is required",
    })
    .min(1, {
      message: "Email must be at least 1 word",
    })
    .email({
      message: "Invalid email address",
    }),
});

export const verifyCodeSchema = z.object({
  email: z
    .string({
      message: "Email is required",
    })
    .min(1, {
      message: "Email must be at least 1 word",
    })
    .email({
      message: "Invalid email address",
    }),
  code: z
    .string({
      message: "Code is required",
    })
    .length(6, { message: "Code must be 6 digits" }),
});
