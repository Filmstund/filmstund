-- name: UpsertMovie :one
INSERT INTO movies
(id, filmstaden_id, slug, title, release_date, production_year, runtime, poster, genres)
VALUES (@id, @filmstaden_id, @slug, @title, @release_date, @production_year, @runtime, @poster, @genres)
ON CONFLICT (filmstaden_id) DO UPDATE SET update_time  = current_timestamp,
                                          poster       = @poster,
                                          release_date = @release_date
RETURNING *;

-- name: Movie :one
select *
FROM movies
WHERE id = @id
  AND archived = false
order by release_date desc;

-- name: AllMovies :many
SELECT *
FROM movies
WHERE archived = @archived
order by release_date;

-- name: OutdatedMovies :many
SELECT id,
       tmdb_id,
       title,
       production_year,
       EXTRACT('YEAR' FROM release_date)::int as release_year,
       popularity,
       popularity_update_time
FROM movies
WHERE archived = false
  AND popularity >= 0
  AND popularity_update_time < CURRENT_TIMESTAMP - INTERVAL '7 day'
ORDER BY random();

-- name: UpdateMoviePopularity :exec
UPDATE movies
SET popularity             = @popularity,
    popularity_update_time = CURRENT_TIMESTAMP,
    tmdb_id                = @tmdb_id,
    imdb_id                = @imdb_id,
    update_time            = CURRENT_TIMESTAMP
WHERE id = @movie_id;

-- name: DisableMoviePopularity :exec
UPDATE movies
set popularity             = -1,
    popularity_update_time = CURRENT_TIMESTAMP,
    update_time            = CURRENT_TIMESTAMP
WHERE id = @movie_id;

-- name: LookupFilmstadenID :one
SELECT filmstaden_id
FROM movies m
WHERE m.id = @movie_id;

-- name: LookupMovieTitle :one
SELECT title
FROM movies m
WHERE m.id = @movie_id;

-- name: LookupSlugAndFSID :one
SELECT slug, filmstaden_id
from movies
where id = @movie_id;