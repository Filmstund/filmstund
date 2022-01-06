-- name: PreviouslyUsedLocations :many
select location
from showings
group by location
order by count(location) DESC;