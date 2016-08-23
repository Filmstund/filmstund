class UsersController < ApplicationController

  # GET /me
  def me
    render json: current_user, serializer: MeSerializer
  end

  # GET /users/1
  def show
    @user = User.find(params[:id])
    render json: @user
  end

  # PATCH/PUT /me
  def update
    @user = current_user

    if @user.update(user_params)
      render json: @user, serializer: MeSerializer
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # DELETE /me
  def destroy
    current_user.destroy
  end

  private
    # Only allow a trusted parameter "white list" through.
    def user_params
      params.require(:user).permit(:nick, :email, :phone_number, :bioklubbsnummer, :sf_membership_level, :pushover_key)
    end
end
