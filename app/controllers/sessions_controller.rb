class SessionsController < ApplicationController

  PROVIDERS = {
    'facebook' => Auth::Facebook,
    'google' => Auth::Google
  }

  def create
    provider = params[:provider]
    user_id = params[:user_id]
    token = params[:token]

    @user = PROVIDERS[provider].authenticate! user_id, token

    render json: @user
  end

  def destroy
    redirect_to root_url, :notice => 'Signed out!'
  end

  def failure
    redirect_to root_url, :alert => "Authentication error: #{params[:message].humanize}"
  end
end