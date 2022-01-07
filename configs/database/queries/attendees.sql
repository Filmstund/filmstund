-- name: AddAttendee :exec
insert into attendees (user_id, showing_id, attendee_type, has_paid, amount_owed, gift_certificate_used)
values (@user_id, @showing_id, @attendee_type, @has_paid, @amount_owed, @gift_certificate_used);

-- name: ListAttendees :many
SELECT user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       gift_certificate_used,
       u.filmstaden_membership_id
FROM attendees a
         left join users u on u.id = a.user_id
         left outer join showings s on s.id = a.showing_id
WHERE a.showing_id = @showing_id;

-- name: AttendeePaymentDetails :one
SELECT user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       s.pay_to_user,
       payto.phone::varchar as pay_to_phone,
       m.title::varchar     as movie_title
FROM attendees a
         left outer join showings s on s.id = a.showing_id
         left join movies m on m.id = s.movie_id
         left join users payto on payto.id = s.pay_to_user
WHERE a.showing_id = @showing_id
  AND a.user_id = @user_id;
