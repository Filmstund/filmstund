-- name: ListCommandments :many
SELECT number, phrase
FROM commandment
ORDER BY number;

-- name: RandomCommandment :one
SELECT number, phrase
FROM commandment
ORDER BY random() limit 1;
