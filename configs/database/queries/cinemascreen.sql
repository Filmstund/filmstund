-- name: CinemaScreen :one
SELECT name
from cinema_screens
WHERE id = @id;

-- name: AddCinemaScreen :exec
insert into cinema_screens (id, name)
values (@id, @name)
on conflict DO NOTHING;