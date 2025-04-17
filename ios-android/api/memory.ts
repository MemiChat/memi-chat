import { fetch } from "expo/fetch";
import { GENERIC_SUCCESS_MESSAGE, API_URL } from "@/lib/helper";
import { getJwtToken } from "@/lib/storage";

export async function getMemory() {
  try {
    const resp = await fetch(`${API_URL}/v1/user/memory`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return data.memory;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function changeMemory(memory: string) {
  try {
    await fetch(`${API_URL}/v1/user/memory/change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({ memory }),
    });
  } catch (error) {
    console.error(error);
  }

  return null;
}
