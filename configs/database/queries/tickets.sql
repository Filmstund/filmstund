-- name: MyTickets :many
SELECT *
FROM tickets t
WHERE t.showing_id = @showing_id
  AND t.assigned_to_user = @user_id;

-- name: ShowingTicketsBought :one
select tickets_bought, price
from showings
where id = @showing_id;
