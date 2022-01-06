-- name: AdminOnShowing :one
SELECT exists(SELECT 1
              FROM showings s
              WHERE s.admin = @admin_user_id
                AND s.id = @showing_id);