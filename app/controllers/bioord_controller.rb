class BioordController < ApplicationController
  # GET /random_bioord
  def random
    @bioord = Bioord.offset(rand(Bioord.count)).first
    render json: {bioord: @bioord}
  end
end
