-- name: AddSession :exec
INSERT INTO sessions (id, user_id, refresh_token, principal)
VALUES (@id, @user_id, @refresh_token, @principal);

-- name: GetSession :one
SELECT *
FROM sessions
WHERE id = @id;

-- name: DeleteSession :exec
DELETE
FROM sessions
WHERE id = @id;