export const getToken = (): string | null =>
  window.localStorage.getItem("idToken");
export const hasToken = (): boolean => !!getToken();
export const getGoogleId = (): string | null =>
  window.localStorage.getItem("googleId");
export const getExpiresAt = (): number | null => {
  const value = window.localStorage.getItem("expiresAt");
  if (!value) {
    return null;
  }
  return parseInt(value, 10);
};

interface GoogleAuthResponse {
  id_token: string;
  user_id: string;
  expires_at: string;
}

export const setUserInfo = (response: GoogleAuthResponse) => {
  const { id_token, user_id, expires_at } = response;

  window.localStorage.setItem("idToken", id_token);
  window.localStorage.setItem("googleId", user_id);
  window.localStorage.setItem("expiresAt", expires_at);
};

export const clearSession = () => {
  window.localStorage.clear();
};
