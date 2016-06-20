class MovieSerializer < ActiveModel::Serializer
  attributes :title, :title_id, :description, :runtime, :poster, :premiere_date, :sf_id
  # Themoviedb extra attributes
  attributes :imdb_id, :tagline, :title_orig, :genres, :overview, :alt_poster, :backdrop
end
