import subscriptionTemplate from "../subscription.txt";
import allowedUuidsYaml from "../uuids.yml";

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function parseAllowedUuids(yamlContent) {
  const matches = yamlContent.matchAll(/^\s*-\s+uuid:\s*([0-9a-fA-F-]+)\s*$/gm);
  return new Set([...matches].map((match) => match[1].toLowerCase()));
}

const allowedUuids = parseAllowedUuids(allowedUuidsYaml);

export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return new Response("Missing required query parameter: uuid", {
        status: 400,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const normalizedUuid = uuid.toLowerCase();
    if (!allowedUuids.has(normalizedUuid)) {
      return new Response("UUID is not allowed", {
        status: 403,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const subscription = subscriptionTemplate.replaceAll("__UUID__", normalizedUuid);
    const encodedSubscription = toBase64(subscription);

    return new Response(encodedSubscription, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
