-- SQL Script to inspect registered users in the database
\echo '========================================================================================'
\echo '                                 DATABASE USERS REPORT                                  '
\echo '========================================================================================'

SELECT 
    id, 
    name, 
    email, 
    language_pref, 
    created_at 
FROM users 
ORDER BY created_at DESC;

\echo '----------------------------------------------------------------------------------------'
SELECT COUNT(*) AS total_users FROM users;
\echo '========================================================================================'
