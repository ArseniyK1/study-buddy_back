-- @param {String} $1:search - search query
-- @param {Int} $2:offset - offset
-- @param {Int} $3:limit - limit
SELECT a.*,
    json_build_object(
        'id',
        r.id,
        'value',
        r.value,
        'description',
        r.description
    ) AS role
FROM "user" a
    LEFT JOIN "role" AS r ON a."role_id" = r.id
WHERE (
        $1::text = ''
        OR a.first_name ~* $1::text
        OR a.last_name ~* $1::text
        OR a.middle_name ~* $1::text
    ) OFFSET $2
LIMIT $3