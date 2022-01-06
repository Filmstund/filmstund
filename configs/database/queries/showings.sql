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