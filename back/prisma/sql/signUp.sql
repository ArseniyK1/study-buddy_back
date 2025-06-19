-- @param {String} $1:email
-- @param {Int}    $2:current_user_id
-- @param {String} $3:password
-- @param {String} $4:first_name
-- @param {String} $5:last_name
-- @param {String} $6:middle_name?
-- @param {Int} $7:role_id
-- @param {String} $8:phone
WITH existsUser AS (
    SELECT a.id
    FROM "user" a
    WHERE a.email = $1::text
),
currentUser AS (
    SELECT b.*,
        json_build_object(c.id, 'role_id', c.value, 'role_name') AS role
    FROM "user" b
        LEFT JOIN role c ON b.role_id = c.id
    WHERE b.id = $2::bigint
)
INSERT INTO "user" (
        email,
        password,
        first_name,
        last_name,
        middle_name,
        role_id,
        phone,
        banned
    )
VALUES (
        $1::text,
        $3::text,
        $4::text,
        $5::text,
        NULLIF($6::text, ''),
        $7::bigint,
        $8::text,
        false
    )