-- name: AddAttendee :exec
insert into attendees (user_id, showing_id, attendee_type, has_paid, amount_owed, gift_certificate_used)
values (@user_id, @showing_id, @attendee_type, @has_paid, @amount_owed, @gift_certificate_used);

-- name: ListAttendees :many
SELECT a.user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       gift_certificate_used,
       u.filmstaden_membership_id,
       gc.number      as gift_certificate_number,
       gc.expire_time as gift_certificate_expire_time
FROM attendees a
         left join users u on u.id = a.user_id
         left outer join showings s on s.id = a.showing_id
         left outer join gift_certificate gc on gc.user_id = a.user_id and gc.number = a.gift_certificate_used
WHERE a.showing_id = @showing_id
  AND s.admin = @admin_id;

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

-- name: UpdateAttendeePayment :exec
update attendees
set has_paid    = @has_paid,
    amount_owed = @amount_owed
where user_id = @user_id
  AND showing_id = @showing_id;

-- name: Attendee :one
SELECT a.user_id,
       showing_id,
       has_paid,
       amount_owed,
       attendee_type,
       gift_certificate_used,
       u.filmstaden_membership_id,
       gc.number      as gift_certificate_number,
       gc.expire_time as gift_certificate_expire_time
FROM attendees a
         left join users u on u.id = a.user_id
         left outer join showings s on s.id = a.showing_id
         left outer join gift_certificate gc on gc.user_id = a.user_id and gc.number = a.gift_certificate_used
WHERE a.showing_id = @showing_id
  AND a.user_id = @user_id;
