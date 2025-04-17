import { fetch } from "expo/fetch";
import { GENERIC_SUCCESS_MESSAGE, API_URL } from "@/lib/helper";
import { Agent } from "@/lib/types";
import { getJwtToken } from "@/lib/storage";

export async function generatePersona(persona: string) {
  const resp = await fetch(`${API_URL}/v1/user/agents/generate/persona`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
    body: JSON.stringify({ persona }),
  });
  const data = await resp.json();
  if (data.message === GENERIC_SUCCESS_MESSAGE) {
    return data.persona;
  }
  return null;
}

export async function getAgents() {
  const resp = await fetch(`${API_URL}/v1/user/agents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });
  const data = await resp.json();
  if (data.message === GENERIC_SUCCESS_MESSAGE) {
    return data.agents;
  }
  return [];
}

export async function createAgent(agent: Agent) {
  const resp = await fetch(`${API_URL}/v1/user/agents/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
    body: JSON.stringify(agent),
  });
  const data = await resp.json();
  if (data.message === GENERIC_SUCCESS_MESSAGE) {
    return data.agent;
  }
  return null;
}

export async function updateAgent(id: number, agent: Agent) {
  const resp = await fetch(`${API_URL}/v1/user/agents/update/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
    body: JSON.stringify(agent),
  });
  const data = await resp.json();
  if (data.message === GENERIC_SUCCESS_MESSAGE) {
    return data.agent;
  }
  return null;
}

export async function deleteAgent(id: number) {
  const resp = await fetch(`${API_URL}/v1/user/agents/delete/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });
  const data = await resp.json();
  if (data.message === GENERIC_SUCCESS_MESSAGE) {
    return true;
  }
  return false;
}
