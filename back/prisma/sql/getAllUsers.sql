-- @param {String} $1:search - search query for name
-- @param {Boolean} $2:is_banned - filter by banned status (null for any)
-- @param {Boolean} $3:has_telegram - filter by telegram presence (null for any)
-- @param {Int} $4:role_id - filter by role (null for any)
-- @param {Int} $5:offset - offset
-- @param {Int} $6:limit - limit
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
        OR a.email ~* $1::text
    )
    AND (
        $2::boolean IS FALSE
        OR a.banned = $2::boolean
    )
    AND (
        $3::boolean IS FALSE
        OR (
            CASE
                WHEN $3::boolean = true THEN a.telegram_id IS NOT NULL
                ELSE a.telegram_id IS NULL
            END
        )
    )
    AND (
        $4::int = 0
        OR a.role_id = $4::int
    ) OFFSET NULLIF($5::int, 0)
LIMIT NULLIF($6::int, 0)