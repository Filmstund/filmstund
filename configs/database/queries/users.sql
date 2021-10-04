-- name: CreateUser :one
INSERT INTO users
    (subject_id, first_name, last_name, nick, email, avatar)
VALUES (@subject, @first_name, @last_name, @nick, @email, @avatar)
ON CONFLICT (subject_id) DO UPDATE SET last_login         = current_timestamp,
                                       last_modified_date = current_timestamp
RETURNING *;

-- name: UserExistsBySubject :one
SELECT exists(SELECT 1 FROM users where subject_id = $1);

-- name: UpdateLoginTimes :one
UPDATE users
SET last_login         = current_timestamp,
    last_modified_date = current_timestamp
WHERE subject_id = @subject_id
returning *;

-- name: UpdateUser :one
UPDATE users
SET filmstaden_membership_id = COALESCE(NULLIF(TRIM(@filmstaden_membership_id), ''), filmstaden_membership_id),
    phone                    = COALESCE(NULLIF(TRIM(@phone_number), ''), phone),
    first_name               = COALESCE(NULLIF(TRIM(@first_name), ''), first_name),
    last_name                = COALESCE(NULLIF(TRIM(@last_name), ''), last_name),
    nick                     = COALESCE(NULLIF(TRIM(@nick), ''), nick),
    last_modified_date       = current_timestamp
WHERE subject_id = @subject_id
RETURNING *;

-- name: RandomizeCalendarFeed :one
UPDATE users
SET calendar_feed_id = uuid_generate_v4()
WHERE subject_id = @subject_id
RETURNING *;

-- name: DisableCalendarFeed :one
UPDATE users
SET calendar_feed_id = NULL
WHERE subject_id = @subject_id
RETURNING *;
