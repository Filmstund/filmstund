export const getToken = () => window.localStorage.getItem("idToken");
export const hasToken = () => !!getToken();

export const setUserInfo = user => {
  const { tokenId, googleId, tokenObj: { expires_at } } = user;
  window.localStorage.setItem("idToken", tokenId);
  window.localStorage.setItem("googleId", googleId);
  window.localStorage.setItem("expiresAt", expires_at);
};

export const clearSession = () => {
  window.localStorage.clear();
};
