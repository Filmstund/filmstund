class TimeSlotsController < ApplicationController
  before_action :set_time_slot, only: [:show, :update, :destroy]

  # GET /time_slots
  def index
    @time_slots = TimeSlot.where showing_id: params[:showing_id]

    render json: @time_slots
  end

  # GET /time_slots/1
  def show
    render json: @time_slot
  end

  # POST /time_slots
  def create
    @time_slot = TimeSlot.new(time_slot_params)

    if @time_slot.save
      render json: @time_slot, status: :created, location: @time_slot
    else
      render json: @time_slot.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /time_slots/1
  def update
    if @time_slot.update(time_slot_params)
      render json: @time_slot
    else
      render json: @time_slot.errors, status: :unprocessable_entity
    end
  end

  # GET /time_slots/votes
  def votes
    @time_slots = @current_user.time_slots.where(showing_id: params[:showing_id])

    render json: @time_slots
  end

  # POST /time_slots/votes
  def add_vote
    @current_user = current_user
    @showing = Showing.find params[:showing_id]
    unless @showing.open?
      render json: { error: "Showing is not accepting votes at this time (showing status is not open)" }, status: :precondition_failed and return
    end

    new_time_slots = TimeSlot.where sf_slot_id: params[:sf_slot_ids]

    @current_user.set_time_slots_for_showing @showing, new_time_slots

    if @current_user.save
      render json: TimeSlot.where(showing_id: params[:showing_id])
    else
      render json: @current_user.errors, status: :unprocessable_entity
    end
  end

  # DELETE /time_slots/1
  def destroy
    @time_slot.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_time_slot
      @time_slot = TimeSlot.find_by!(id: params[:id], showing_id: params[:showing_id])
    end

    # Only allow a trusted parameter "white list" through.
    def time_slot_params
      params.require(:time_slot).permit(:start_time, :showing_id, :auditorium_name, :auditorium_id, :theatre, :theatre_account, :is_vip, :is_3d, :sf_slot_id)
    end
end
