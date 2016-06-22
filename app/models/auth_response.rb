class AuthResponse
  attr_accessor :created_at, :email, :nick, :token

  def initialize(user, token)
    self.created_at = user.created_at
    self.email = user.email
    self.nick = user.nick
    self.token = token
  end
end