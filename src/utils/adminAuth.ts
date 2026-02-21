const ADMIN_AUTH_KEY = "fivlia_admin_auth";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface AdminSession {
  token: string;
  expiresAt: number;
  name?: string;
  email?: string;
}

const parseSession = (raw: string | null): AdminSession | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.token || typeof parsed.expiresAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const getAdminSession = (): AdminSession | null => {
  return parseSession(localStorage.getItem(ADMIN_AUTH_KEY));
};

export const isAdminSessionValid = (session: AdminSession | null): boolean => {
  return !!(session?.token && session.expiresAt > Date.now());
};

export const hasValidAdminSession = (): boolean => {
  return isAdminSessionValid(getAdminSession());
};

export const saveAdminSession = (payload: {
  token: string;
  expiresAt?: number;
  name?: string;
  email?: string;
}): AdminSession => {
  const session: AdminSession = {
    token: payload.token,
    expiresAt: payload.expiresAt ?? Date.now() + ONE_DAY_MS,
    name: payload.name,
    email: payload.email,
  };

  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
  return session;
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(ADMIN_AUTH_KEY);
};

export const getAdminToken = (): string | null => {
  const session = getAdminSession();
  if (!session || !isAdminSessionValid(session)) {
    clearAdminSession();
    return null;
  }
  return session.token;
};
