module Auth
  class Google
    include HTTParty
    base_uri 'https://www.googleapis.com/oauth2/v3'

    def self.authenticate!(user_id, token)
      user_response = get("/tokeninfo?id_token=#{token}")

      if not user_response.success?
        raise "Unable to validate token"
      end

      user = user_response.parsed_response

      if user["sub"].nil? || user_id != user["sub"]
        raise "User id mismatch"
      end

      { email: user["email"], name: user["name"] }
    end
  end
end
