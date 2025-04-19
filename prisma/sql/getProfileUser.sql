-- SELECT a.*,
--     json_build_object(
--         b.id,
--         'id',
--         b.value,
--         'value',
--         b.description,
--         'description'
--     ) AS role
-- FROM auth_user a
--     LEFT JOIN role b ON a.role_id = b.id
-- WHERE a.id = $1::bigint
SELECT *
FROM auth_user