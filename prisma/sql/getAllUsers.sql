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