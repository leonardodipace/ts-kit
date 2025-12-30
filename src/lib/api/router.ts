export const convertPathToBunFormat = (path: string) => {
  return path.replace(/\{(\w+)\}/g, ":$1");
};

export const parseQueryString = (url: URL) => {
  const query: Record<string, string | string[]> = {};

  for (const [key, value] of url.searchParams.entries()) {
    const existing = query[key];

    if (Array.isArray(existing)) {
      existing.push(value);
    } else if (existing) {
      query[key] = [existing, value];
    } else {
      query[key] = value;
    }
  }

  return query;
};

export const parseCookies = (cookieHeader: string | null) => {
  if (!cookieHeader) {
    return {};
  }

  const cookies: Record<string, string> = {};

  for (const pair of cookieHeader.split(";")) {
    const [key, value] = pair.split("=");
    const trimmedKey = key?.trim();
    const trimmedValue = value?.trim();

    if (trimmedKey && trimmedValue) {
      cookies[trimmedKey] = trimmedValue;
    }
  }

  return cookies;
};
