class MoviesController < ApplicationController
  before_action :set_movie, only: [:show, :update]

  # GET /movies
  def index
    @movies = Movie.all_sf
    render json: @movies
  end

  # GET /movies/toplist
  def toplist
    @movies = Movie.toplist
    render json: @movies
  end

  # GET /movies/upcoming
  def upcoming
    @movies = Movie.upcoming
    render json: @movies
  end

  # GET /movies/:sf_id
  def show
    render json: @movie
  end

  # PATCH/PUT /movies/1
  def update
    if @movie.update(user_params)
      if movie_params.has_key? :imdb_id
        @movie.update_from_imdb_id
      end
      render json: @movie
    else
      render json: @movie.errors, status: :unprocessable_entity
    end
  end


  private
    # Use callbacks to share common setup or constraints between actions.
    def set_movie
      @movie = Movie.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def movie_params
      params.require(:movie).permit(:imdb_id)
    end
end
