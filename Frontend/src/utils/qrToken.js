export const extractQrToken = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  try {
    const parsedUrl = new URL(rawValue);
    const token = parsedUrl.searchParams.get("token");
    if (token) return token.trim();
  } catch {
    const tokenMatch = rawValue.match(/[?&]token=([^&]+)/);
    if (tokenMatch?.[1]) return decodeURIComponent(tokenMatch[1]).trim();
  }

  return rawValue;
};

export const isQrToken = (value) => {
  const token = extractQrToken(value);
  return Boolean(token && token.includes("."));
};
