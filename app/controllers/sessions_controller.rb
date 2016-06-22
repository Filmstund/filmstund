class SessionsController < ApplicationController

  PROVIDERS = {
    'facebook' => Auth::Facebook,
    'google' => Auth::Google
  }

  def create
    provider = params[:provider]
    user_id = params[:user_id]
    token = params[:token]

    begin
      unless user_id.present? && token.present?
        raise "Missing parameters"
      end
      user = PROVIDERS[provider].authenticate! user_id, token
    rescue Exception => e
      render json: { error: e }, status: :unauthorized and return
    end

    @user = User.find_by_email user[:email], nick: user[:name]

    token = @user.tokens.create! comment: request.user_agent
    @auth_response = AuthResponse.new @user, token.token
    render json: @auth_response
  end

  def destroy
    token = token_and_options(request).first
    ApiToken.where(token: token).delete_all
    render json: {}
  end
end