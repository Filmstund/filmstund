class ApplicationController < ActionController::API
  include ActionController::Serialization
  include ActionController::HttpAuthentication::Token::ControllerMethods
  include ActionController::HttpAuthentication::Token
  before_action :authenticate

  def current_user
    @current_user
  end

  private
    def authenticate
      # TODO: render as json
      authenticate_or_request_with_http_token do |token, options|
        if token.nil?
          head :unauthorized
        end
        begin
          @current_user = ApiToken.find_by!(token: token).user
        rescue
          head :forbidden
        end
      end
    end
end
