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
  AND archived = false;

-- name: AllMovies :many
SELECT *
FROM movies
WHERE archived = @archived;

-- name: MoviesByFilmstadenID :many
select id, filmstaden_id
FROM movies
WHERE filmstaden_id IN (@filmstaden_ids);