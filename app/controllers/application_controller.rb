class ApplicationController < ActionController::API
  include ActionController::Serialization
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include ActionController::HttpAuthentication::Token

  def current_user
    @current_user
  end

  private
    def authenticate
      authenticate_or_request_with_http_token do |token, options|
        @current_user = ApiToken.find_by!(token: token).user
      end
    end
end
