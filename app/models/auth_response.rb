class AuthResponse
  attr_accessor :user, :token

  def initialize(user, token)
    self.user = user
    self.token = token
  end
end