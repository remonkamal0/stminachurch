<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM role_permissions");
    $rows = $stmt->fetchAll();
    $matrix = [];
    foreach ($rows as $row) {
        $matrix[$row['role_key']] = json_decode($row['permissions_json'], true) ?: [];
    }
    sendResponse($matrix);
} elseif ($method === 'POST' || $method === 'PUT') {
    $input = getJsonInput();
    if (!is_array($input)) {
        sendResponse(['error' => 'Invalid permissions payload'], 400);
    }

    $stmt = $db->prepare("INSERT INTO role_permissions (role_key, permissions_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE permissions_json = VALUES(permissions_json)");
    foreach ($input as $roleKey => $perms) {
        if (is_array($perms)) {
            $stmt->execute([$roleKey, json_encode($perms, JSON_UNESCAPED_UNICODE)]);
        }
    }
    sendResponse(['success' => true, 'message' => 'تم حفظ وتحديث مصفوفة الصلاحيات بنجاح']);
}
