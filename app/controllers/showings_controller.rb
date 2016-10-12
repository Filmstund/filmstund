class ShowingsController < ApplicationController
  before_action :set_showing, only: [:update, :destroy, :between, :complete, :attend, :unattend, :order, :done]

  # GET /showings
  def index
    @showings = Showing.includes(:owner, :movie, time_slots: [:users]).active

    render json: @showings
  end

  # GET /showings/1
  def show
    @showing = Showing.includes(:owner, :movie, time_slots: [:users]).find(params[:id])

    render json: @showing
  end

  # POST /showings
  def create
    @showing = current_user.showings.build(showing_params)
    @showing.status = 'open'

    unless @showing.save
      render json: @showing.errors, status: :unprocessable_entity and return
    end

    slot_ids = params[:sf_slot_ids]
    time_slots = slot_ids.map do |slot_id|
      slot = TimeSlot.new_from_sf_slot TimeSlot.get_slot_info(@showing.sf_id, slot_id)
      slot.showing = @showing
      slot
    end

    if time_slots.map { |slot| slot.save }.all?
      Push.showing_created(@showing)
      render json: @showing, status: :created, location: @showing
    else
      render json: (time_slots.map { |slot| slot.errors }), status: :unprocessable_entity
    end
  end

  # PATCH/PUT /showings/1
  def update
    if @showing.update(showing_params)
      render json: @showing
    else
      render json: @showing.errors, status: :unprocessable_entity
    end
  end

  # POST /showings/:id/complete
  def complete
    unless @showing.owner == current_user
      render nothing: true, status: :forbidden and return
    end
    @time_slot = TimeSlot.find(params[:slot_id])
    @showing.selected_time_slot = @time_slot
    @showing.status = "confirmed"

    if @showing.save
      Push.showing_confirmed(@showing)
      render json: @showing
    else
      render json: @showing.errors, status: :unprocessable_entity
    end
  end

  # Post /showing/:id/order
  def order
    unless @showing.status == "confirmed"
      render nothing: true, status: :unprocessable_entity and return
    end
    unless @showing.owner == current_user
      render nothing: true, status: :forbidden and return
    end

    @showing.status = "ordered"
    Push.showing_ordered(@showing)
    if @showing.save
      render json: @showing
    else
      render json: @showing.errors, status: :unprocessable_entity
    end

  end

  # Post /showing/:id/done
  def done
    unless @showing.status == "ordered"
      render nothing: true, status: :unprocessable_entity and return
    end
    unless @showing.owner == current_user
      render nothing: true, status: :forbidden and return
    end

    @showing.status = "done"
    if @showing.save
      render json: @showing
    else
      render json: @showing.errors, status: :unprocessable_entity
    end

  end

  # POST /showings/:id/attend
  def attend
    unless @showing.status == "confirmed"
      render json: { error: "Showing is not confirmed yet" }, status: :unprocessable_entity and return
    end
    @attendee = Attendee.find_or_create_by(user: current_user, showing: @showing)
    if @attendee.save
      render json: @showing.attendees
    else
      render json: @attendee.errors, status: :unprocessable_entity
    end
  end

  # POST /showings/:id/unattend
  def unattend
    unless @showing.status == "confirmed"
      render json: { error: "Showing is not confirmed yet" }, status: :unprocessable_entity and return
    end
    @attendee = Attendee.where(user: current_user, showing: @showing)
    @attendee.delete_all

    render json: @showing.attendees
  end

  # GET /showings/:id/between/:from/:to
  def between
    from = params[:from]
    to = params[:to]

    render json: TimeSlot.sf_slots_between(from, to, @showing)
  end

  # DELETE /showings/1
  def destroy
    @showing.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_showing
      @showing = Showing.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def showing_params
      params.require(:showing).permit(:sf_id, time_slot_ids: [])
    end
end
