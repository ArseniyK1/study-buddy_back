-- @param {Int} $1:userId - user id
-- @param {String} $2:status - status
-- @param {String} $3:startDate - start date
-- @param {String} $4:endDate - end date
-- @param {Int} $5:offset - offset
-- @param {Int} $6:limit - limit
SELECT b.id,
    b.start_time as "startTime",
    b.end_time as "endTime",
    b.status,
    b.total_price as "totalPrice",
    b.user_id as "userId",
    b.place_id as "placeId",
    json_build_object(
        'id',
        p.id,
        'name',
        p.name,
        'zone',
        json_build_object(
            'id',
            z.id,
            'name',
            z.name
        )
    ) as place
FROM booking b
    LEFT JOIN place p ON b.place_id = p.id
    LEFT JOIN workspace_zone z ON p.zone_id = z.id
WHERE b.user_id = $1::bigint
    AND (
        $2::text IS NULL
        OR b.status = $2::text
    )
    AND (
        $3::text IS NULL
        OR b.start_time >= $3::timestamp
    )
    AND (
        $4::text IS NULL
        OR b.end_time <= $4::timestamp
    )
ORDER BY b.start_time,
    b.id DESC
LIMIT $6::bigint OFFSET $5::bigint;