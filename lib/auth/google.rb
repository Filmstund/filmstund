module Auth
  class Google
    include HTTParty
    base_uri 'https://www.googleapis.com/oauth2/v3/'
    def self.authenticate!(user_id, token)
      user = get("tokeninfo?id_token=#{token}")

      user
    end
  end
end