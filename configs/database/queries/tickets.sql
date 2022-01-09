-- name: MyTickets :many
SELECT *
FROM tickets t
WHERE t.showing_id = @showing_id
  AND t.assigned_to_user = @user_id;

-- name: TicketSeatings :many
SELECT t.id, t.seat_row, t.seat_number
FROM tickets t
WHERE t.showing_id = @showing_id
order by t.seat_row;

-- name: ShowingTicketsBought :one
select tickets_bought, price
from showings
where id = @showing_id;

-- name: AddTicket :exec
insert into tickets (id, showing_id, assigned_to_user, profile_id, barcode, customer_type, customer_type_definition,
                     cinema, cinema_city, screen, seat_row, seat_number, date, time, movie_name, movie_rating)
values (@id, @showing_id, @assigned_to_user, @profile_id, @barcode, @customer_type, @customer_type_definition, @cinema,
        @cinema_city, @screen, @seat_row, @seat_number, @date, @time, @movie_name, @movie_rating);

-- name: AttendeesIncludingTickets :many
select a.showing_id, a.user_id, t.id as ticket_id, u.filmstaden_membership_id
from attendees a
         left outer join tickets t on a.showing_id = t.showing_id AND t.assigned_to_user = a.user_id
         left join users u on a.user_id = u.id
where a.showing_id = @showing_id
order by random();