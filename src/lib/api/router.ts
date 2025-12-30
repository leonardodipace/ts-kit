export const convertPathToBunFormat = (path: string): string => {
  return path.replace(/\{(\w+)\}/g, ":$1");
};

export const extractParamNames = (path: string): string[] => {
  const matches = path.matchAll(/\{(\w+)\}/g);
  return Array.from(matches, (m) => m[1]).filter(
    (name): name is string => name !== undefined,
  );
};

export const parseQueryString = (url: URL) => {
  const query: Record<string, string | string[]> = {};

  for (const [key, value] of url.searchParams.entries()) {
    const existing = query[key];

    if (existing === undefined) {
      query[key] = value;
      continue;
    }

    if (Array.isArray(existing)) {
      existing.push(value);
      continue;
    }

    query[key] = [existing, value];
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
    const [key, value] = pair.split("=").map((s) => s.trim());
    if (key && value) {
      cookies[key] = value;
    }
  }

  return cookies;
};
