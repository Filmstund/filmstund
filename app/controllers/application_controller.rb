class ApplicationController < ActionController::API
  include ActionController::Serialization
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include ActionController::HttpAuthentication::Token
  before_action :authenticate, unless: "Rails.env.development?"

  def current_user
    @current_user
  end

protected
  def authenticate
    authenticate_token || render_unauthorized
  end

  def authenticate_token
    authenticate_with_http_token do |token, options|
      begin
        @current_user = ApiToken.find_by!(token: token).user
      rescue
        render json: {error: "Schoo, you're not allowed here!"}, status: :forbidden and return
      end
    end
  end

  def render_unauthorized(realm = "Application")
    self.headers["WWW-Authenticate"] = %(Token realm="#{realm.gsub(/"/, "")}")
    render json: {error: 'Come back when you have a token!'}, status: :unauthorized and return
  end
end
