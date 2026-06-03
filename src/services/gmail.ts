export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
  body?: string;
}

function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRfc2822Message(to: string, subject: string, bodyText: string): string {
  // Safe header encoding for UTF-8 subjects
  const utf8Subject = `=?utf-8?B?${btoa(
    encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )}?=`;

  const parts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    bodyText,
  ];
  return parts.join("\r\n");
}

export async function sendGmailMessage(
  token: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string; threadId: string }> {
  const rawMessage = buildRfc2822Message(to, subject, bodyText);
  const encoded = base64urlEncode(rawMessage);

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gmail API send failed: ${res.statusText} - ${errorBody}`);
  }

  return res.json();
}

export async function listRecentGmailMessages(token: string): Promise<GmailMessage[]> {
  try {
    // Look for correspondence with Villa Leopardi reservation terms
    const query = encodeURIComponent('subject:("sunset table" OR "prenotazione" OR "leopardi")');
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=8`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      throw new Error(`Failed to list messages: ${listRes.statusText}`);
    }

    const data = await listRes.json();
    if (!data.messages) return [];

    const detailPromises = data.messages.map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();

        const headers = detail.payload?.headers as Array<{ name: string; value: string }> || [];
        const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "Senza Oggetto";
        const from = headers.find((h) => h.name.toLowerCase() === "from")?.value || "Sconosciuto";
        const date = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: detail.snippet || "",
          subject,
          from,
          date,
        };
      } catch (e) {
        console.error("Error fetching message details:", e);
        return null;
      }
    });

    const results = await Promise.all(detailPromises);
    return results.filter((r): r is GmailMessage => r !== null);
  } catch (error) {
    console.error("Error listing Gmail messages:", error);
    return [];
  }
}
