-- name: PreviouslyUsedLocations :many
SELECT location
FROM showings
WHERE location != ''
GROUP BY location
ORDER BY count(location) DESC;