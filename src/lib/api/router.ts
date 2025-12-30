export const convertPathToBunFormat = (path: string) => {
  return path.replace(/\{(\w+)\}/g, ":$1");
};

export const parseQueryString = (url: URL) => {
  const query: Record<string, string | string[]> = {};

  for (const [key, value] of url.searchParams.entries()) {
    const existing = query[key];

    if (!existing) {
      query[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      query[key] = [existing, value];
    }
  }

  return query;
};

export const parseCookies = (cookieHeader: string | null) => {
  if (!cookieHeader) {
    return {};
  }

  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(";");

  for (const pair of pairs) {
    const [key, value] = pair.split("=");

    if (key?.trim() && value?.trim()) {
      cookies[key.trim()] = value.trim();
    }
  }

  return cookies;
};
