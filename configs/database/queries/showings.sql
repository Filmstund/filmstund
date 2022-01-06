-- name: PublicShowings :many
SELECT *
FROM showings s
WHERE s.date > @after_date
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