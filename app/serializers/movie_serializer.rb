class MovieSerializer < ActiveModel::Serializer
  attributes :title, :description, :runtime, :poster, :premiere_date, :sf_id
  # Themoviedb extra attributes
  attributes :imdb_id, :tagline, :genres
end
