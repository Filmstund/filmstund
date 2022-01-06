-- name: MyTickets :many
SELECT *
FROM tickets t
WHERE t.showing_id = @showing_id
  AND t.assigned_to_user = @user_id;