class BioordController < ApplicationController
  before_action :set_bioord, only: [:show, :update, :destroy]

  # GET /bioord
  def index
    @bioord = Bioord.all

    render json: @bioord
  end

  # GET /bioord/1
  def show
    render json: @bioord
  end

  # POST /bioord
  def create
    @bioord = Bioord.new(bioord_params)

    if @bioord.save
      render json: @bioord, status: :created, location: @bioord
    else
      render json: @bioord.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /bioord/1
  def update
    if @bioord.update(bioord_params)
      render json: @bioord
    else
      render json: @bioord.errors, status: :unprocessable_entity
    end
  end

  # DELETE /bioord/1
  def destroy
    @bioord.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_bioord
      @bioord = Bioord.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def bioord_params
      params.require(:bioord).permit(:number, :phrase)
    end
end
