module Auth
  class Facebook
    require 'fb_graph2'

    FbGraph2.api_version = 'v2.6'

    def self.authenticate!(user_id, token)
      user = FbGraph2::User.me(token)

      user = user.fetch(fields: [:name, :email])

      if user.id != user_id
        raise "User id mismatch"
      end

      { email: user.email, name: user.name }
    end
  end
end