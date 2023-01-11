SELECT name,
    num_employees AS "numEmployees"
FROM companies
WHERE (name ILIKE 'Bauer-Gallagher')
    OR (num_employees >= NULL)
ORDER BY name;

WHERE (name ILIKE 'Bauer-Gallagher')
OR (num_employees <= 0)
OR (num_employees >= 0)