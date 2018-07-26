export const getToken = () => window.localStorage.getItem("idToken");
export const hasToken = () => !!getToken();
export const getGoogleId = () => window.localStorage.getItem("googleId");
export const getExpiresAt = () =>
  parseInt(window.localStorage.getItem("expiresAt"), 10);

export const setUserInfo = response => {
  const { id_token, user_id, expires_at } = response;

  window.localStorage.setItem("idToken", id_token);
  window.localStorage.setItem("googleId", user_id);
  window.localStorage.setItem("expiresAt", expires_at);
};

export const clearSession = () => {
  window.localStorage.clear();
};
