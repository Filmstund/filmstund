-- name: NewOrExistingUser :one
WITH neworexisting AS (
    INSERT INTO users
        (subject_id, first_name, last_name, nick, email, avatar)
        VALUES (@subject, @first_name, @last_name, @nick, @email, @avatar)
        ON CONFLICT (subject_id) DO
            UPDATE SET
                last_login = current_timestamp,
                last_modified_date = current_timestamp,
                avatar = @avatar,
                first_name = @first_name,
                email = @email
        RETURNING *
)
SELECT *
FROM neworexisting;

-- name: UserExistsBySubject :one
SELECT exists(SELECT 1 FROM users where subject_id = $1);

