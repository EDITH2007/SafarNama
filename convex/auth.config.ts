function base64Encode(str: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let i = 0; i < str.length; i += 3) {
    const c1 = str.charCodeAt(i);
    const c2 = i + 1 < str.length ? str.charCodeAt(i + 1) : NaN;
    const c3 = i + 2 < str.length ? str.charCodeAt(i + 2) : NaN;
    
    const byte1 = c1 >> 2;
    const byte2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4);
    const byte3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6);
    const byte4 = isNaN(c3) ? 64 : c3 & 63;
    
    output += chars.charAt(byte1) + chars.charAt(byte2) + 
              (byte3 === 64 ? "=" : chars.charAt(byte3)) + 
              (byte4 === 64 ? "=" : chars.charAt(byte4));
  }
  return output;
}

function getCleanJwks(raw: string): string {
  if (!raw) return "";
  try {
    let parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (parsed && parsed.keys && Array.isArray(parsed.keys)) {
      for (const key of parsed.keys) {
        if (!key.kid) {
          key.kid = "my-key-id";
        }
      }
    }
    return JSON.stringify(parsed);
  } catch (e) {
    if (raw.includes('\\"')) {
      try {
        const replaced = raw.replace(/\\"/g, '"');
        let parsed = JSON.parse(replaced);
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (parsed && parsed.keys && Array.isArray(parsed.keys)) {
          for (const key of parsed.keys) {
            if (!key.kid) {
              key.kid = "my-key-id";
            }
          }
        }
        return JSON.stringify(parsed);
      } catch (err) {}
    }
  }
  return raw;
}

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "convex",
      issuer: process.env.CONVEX_SITE_URL,
      jwks: process.env.JWKS
        ? `data:application/json;base64,${base64Encode(getCleanJwks(process.env.JWKS))}`
        : "",
      algorithm: "RS256",
    },
  ],
};

