import { fetch } from "expo/fetch";
import {
  GENERIC_SUCCESS_MESSAGE,
  API_URL,
  GENERIC_ERROR_MESSAGE,
} from "@/lib/helper";
import { getJwtToken } from "@/lib/storage";

export async function sendCode(email: string) {
  try {
    const resp = await fetch(`${API_URL}/v1/public/auth/send/code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return GENERIC_SUCCESS_MESSAGE;
    } else {
      return data.errors[0];
    }
  } catch (error) {
    console.error(error);
  }
  return GENERIC_ERROR_MESSAGE;
}

export async function verifyCode(email: string, code: string) {
  try {
    const resp = await fetch(`${API_URL}/v1/public/auth/verify/code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return {
        token: data.token,
        expiry: data.expiry,
      };
    } else {
      return data.errors[0];
    }
  } catch (error) {
    console.error(error);
  }
  return GENERIC_ERROR_MESSAGE;
}

export async function getMe() {
  try {
    const resp = await fetch(`${API_URL}/v1/user/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });
    const data = await resp.json();
    return data.user;
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function deleteMe() {
  try {
    const resp = await fetch(`${API_URL}/v1/user/auth/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return data.message;
    } else {
      return data.errors[0];
    }
  } catch (error) {
    console.error(error);
  }
  return GENERIC_ERROR_MESSAGE;
}
