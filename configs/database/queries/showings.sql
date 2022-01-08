-- name: PublicShowings :many
SELECT *
FROM showings s
WHERE s.date > @after_date
  AND s.private = false
ORDER BY date DESC;

-- name: ShowingsByMovie :many
SELECT *
FROM showings s
WHERE s.movie_id = @movie_id
  AND s.private = false
ORDER BY date DESC;

-- name: AdminOnShowing :one
SELECT exists(SELECT 1
              FROM showings s
              WHERE s.admin = @admin_user_id
                AND s.id = @showing_id);

-- name: PublicAttendees :many
SELECT user_id,
       showing_id,
       (u.first_name || ' ' || u.last_name)::text as name,
       u.first_name::text                         as first_name,
       u.last_name::text                          as last_name,
       u.nick,
       u.phone,
       u.avatar                                   as avatar_url
FROM attendees
         left join users u on u.id = attendees.user_id
where showing_id = @showing_id;

-- name: AddShowing :one
insert into showings (id, web_id, slug, date, time, movie_id, location,
                      cinema_screen_id, filmstaden_showing_id, admin, pay_to_user)
values (@id, @web_id, @slug, @date, @time, @movie_id, @location, @cinema_screen_id,
        @filmstaden_showing_id, @admin, @pay_to_user)
returning *;

-- name: ShowingByWebID :one
select *
from showings
WHERE web_id = @web_id;

-- name: ShowingByID :one
select *
from showings
WHERE id = @id;

-- name: DeleteShowing :execrows
delete
from showings
where id = @showing_id;

-- name: MarkShowingAsBought :exec
UPDATE showings s
SET tickets_bought = true,
    price          = @price,
    update_time    = current_timestamp
WHERE s.id = @showing_id
  AND s.tickets_bought = false
  AND s.admin = @admin_id;

-- name: PromoteNewUserToShowingAdmin :exec
UPDATE showings s
SET admin       = @new_admin_id,
    pay_to_user = @new_admin_id,
    update_time = current_timestamp
WHERE s.id = @showing_id
  AND s.admin = @admin_id
  AND s.tickets_bought = false;

-- name: UpdateShowing :exec
UPDATE showings s
SET price                 = @price,
    pay_to_user           = @pay_to_user,
    location              = @location,
    filmstaden_showing_id = @filmstaden_showing_id,
    cinema_screen_id      = @cinema_screen_id,
    date                  = @date,
    time                  = @time,
    update_time           = current_timestamp
WHERE s.id = @showing_id
  AND s.admin = @admin_id;