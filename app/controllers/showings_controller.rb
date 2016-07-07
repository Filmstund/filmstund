class ShowingsController < ApplicationController
  before_action :set_showing, only: [:show, :update, :destroy, :between]

  # GET /showings
  def index
    @showings = Showing.all

    render json: @showings
  end

  # GET /showings/1
  def show
    render json: @showing
  end

  # POST /showings
  def create
    @showing = Showing.new(showing_params)

    if @showing.save
      render json: @showing, status: :created, location: @showing
    else
      render json: @showing.errors, status: :unprocessable_entity
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
      params.require(:showing).permit(:sf_id, :status, :time_slots)
    end
end
