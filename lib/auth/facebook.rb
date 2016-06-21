module Auth
  class Facebook
    require 'fb_graph2'

    def self.authenticate!(user_id, token)
      user = FbGraph2::User.new('me').authenticate(token)
      user.fetch
    end
  end
end