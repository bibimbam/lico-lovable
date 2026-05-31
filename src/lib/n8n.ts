/**
 * n8n Webhook integration
 *
 * Sends POST requests to a configurable n8n Webhook URL.
 * The URL is read from the Vite environment variable VITE_N8N_WEBHOOK_URL.
 */

interface N8nPayload {
  [key: string]: unknown;
}

/**
 * Send a POST request to the n8n Webhook.
 *
 * @param payload - The JSON body to send to the webhook.
 * @returns The parsed JSON response from n8n.
 * @throws If the webhook URL is not configured or the request fails.
 */
export async function callN8n(payload: N8nPayload): Promise<unknown> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

  if (!webhookUrl) {
    throw new Error(
      "n8n Webhook URL is not configured. Set VITE_N8N_WEBHOOK_URL in your environment."
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `n8n Webhook request failed: ${response.status} ${response.statusText}`
    );
  }

  // Some n8n webhooks return an empty body; guard against that.
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    // If the response isn't JSON, return the raw text.
    return text;
  }
}
