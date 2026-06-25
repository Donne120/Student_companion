import auth from "@react-native-firebase/auth";

// Same backend as the web app
export const API_URL = "https://studentcompanion-alu-chatbot.hf.space";

const CHAT_ENDPOINT = `${API_URL}/api/chat/claude`;
export const CHAT_STREAM_ENDPOINT = `${API_URL}/api/chat/claude/stream`;

export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

export const authHeader = async (): Promise<{ Authorization: string }> => {
  const user = auth().currentUser;
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export type Message = {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: number;
};

export const sendMessage = async (
  query: string,
  history: Message[]
): Promise<string> => {
  const formattedHistory = history.map((m) => ({
    role: m.isAi ? "assistant" : "user",
    content: m.text,
  }));

  const res = await fetchWithTimeout(
    CHAT_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify({ message: query, history: formattedHistory }),
    },
    30_000
  );

  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const data = await res.json();
  return data.response ?? "No response from backend";
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetchWithTimeout(API_URL, {}, 5000);
    return res.ok;
  } catch {
    return false;
  }
};
