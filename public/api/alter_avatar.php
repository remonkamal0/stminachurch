<?php
require_once __DIR__ . '/db.php';
$db = getDB();
try {
    $db->exec("ALTER TABLE students MODIFY COLUMN avatar_url LONGTEXT");
    $db->exec("ALTER TABLE servants MODIFY COLUMN avatar_url LONGTEXT");
    echo "Successfully updated avatar_url columns to LONGTEXT!
";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "
";
}
