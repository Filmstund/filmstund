export const transformFacebookAuthCallback = (params) => ({
  token: params.accessToken,
  user_id: params.userID,
  provider: 'facebook'
})

export const transformGoogleAuthCallback = (params) => ({
  token: params.Zi.id_token,
  user_id: params.w3.Eea,
  provider: 'google'
})