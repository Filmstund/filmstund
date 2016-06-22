export const transformFacebookAuthCallback = (params) => ({
  token: params.accessToken,
  user_id: params.userID,
  provider: 'facebook'
})

export const transformGoogleAuthCallback = (params) => ({
  token: params.hg.id_token,
  user_id: params.wc.Ka,
  provider: 'google'
})