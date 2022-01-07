-- name: AddAttendee :exec
insert into attendees (user_id, showing_id, attendee_type, has_paid, amount_owed, gift_certificate_used)
values (@user_id, @showing_id, @attendee_type, @has_paid, @amount_owed, @gift_certificate_used);