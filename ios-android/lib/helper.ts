export const GENERIC_SUCCESS_MESSAGE = "success";
export const GENERIC_ERROR_MESSAGE = "error";
export const USER_ROLE = "user";
export const SYSTEM_ROLE = "system";
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const DOCUMENT_UPLOAD_TYPES = [
  "application/pdf",
  "application/x-javascript",
  "text/javascript",
  "application/x-python",
  "text/x-python",
  "text/plain",
  "text/html",
  "text/css",
  "text/md",
  "text/csv",
  "text/xml",
  "text/rtf",
];
export const VIDEO_UPLOAD_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime", // for video/mov
  "video/x-msvideo", // for video/avi
  "video/x-flv",
  "video/webm",
  "video/x-ms-wmv", // for video/wmv
  "video/3gpp",
];
export const PROMPT_HELPERS = [
  {
    title: "Youtube Video",
    description: "Can you summarize the video?",
    prompt:
      "Can you summarize this video https://www.youtube.com/watch?v=9hE5-98ZeCg",
  },
  {
    title: "Image Generation",
    description: "Can you generate an image?",
    prompt: "Generate an image of a cat",
  },
  {
    title: "Warm Welcome",
    description: "Just saying Hi",
    prompt: "Hi Memi, how are you?",
  },
];
export const PREBUILT_PERSONAS = [
  "Mom",
  "Dad",
  "Old Friend",
  "Software Engineer from San Francisco",
  "Doctor from India",
  "Lawyer from London",
];
