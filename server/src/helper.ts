export const API_V1_PREFIX = "/v1";
export const API_V1_PUBLIC_PREFIX = `${API_V1_PREFIX}/public`;
export const API_V1_USER_PREFIX = `${API_V1_PREFIX}/user`;
export const GENERIC_SUCCESS_MESSAGE = "success";
export const GENERIC_ERROR_MESSAGE = "error";
export const USER_ROLE = "user";
export const SYSTEM_ROLE = "system";
export const SYSTEM_PROMPT =
  "If you are replying with text always reply in Markdown format.\n\n";
export const NEW_CHAT_TITLE_PROMPT =
  "Generate a title for the chat based on the prompt. The title should be 24 characters or less. Reply with only the title.";
export const ALL_MARKDOWN_URL_REGEX = /!?\[(.*?)\]\((.*?)\)/g;
export const STREAM_ERROR =
  "I am sorry, I am not able to complete the request right now. Please try again later.";
export const AGENT_STREAM_ERROR =
  "Sorry, can you send the message again? I cannot see it";
export const AGENT_CONSECUTIVE_STREAM_ERROR = "Oh, never mind.";
export const GENERATE_PERSONA_PROMPT =
  "Generate a persona for the user based on the prompt. Describe the life they are living, how they behave, what they are passionate about and go into detail about their personality. Reply with only the persona.";
export const AGENT_HEADER_REGEX_SOURCE = "### \\*\\*\\*(.*?)\\*\\*\\*";
export const AGENT_HEADER_REGEX = new RegExp(AGENT_HEADER_REGEX_SOURCE);
export const AGENT_HEADER_REGEX_GLOBAL = new RegExp(
  AGENT_HEADER_REGEX_SOURCE,
  "g"
);
