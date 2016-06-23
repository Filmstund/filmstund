class TimeSlotsController < ApplicationController
  before_action :set_time_slot, only: [:show, :update, :destroy]

  # GET /time_slots
  def index
    @time_slots = TimeSlot.all

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

  # DELETE /time_slots/1
  def destroy
    @time_slot.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_time_slot
      @time_slot = TimeSlot.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def time_slot_params
      params.require(:time_slot).permit(:start_time, :showing_id, :auditorium_name, :auditorium_id, :theatre, :theatre_account, :is_vip, :is_3d, :sf_slot_id)
    end
end
