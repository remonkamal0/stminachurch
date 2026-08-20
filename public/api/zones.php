<?php
require_once __DIR__ . '/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM zones ORDER BY name ASC");
    sendResponse($stmt->fetchAll());
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $name = trim($input['name'] ?? '');
    
    // Check delete via POST
    if (($input['action'] ?? '') === 'delete') {
        $nameToDelete = $input['name'] ?? '';
        if ($nameToDelete) {
            $stmt = $db->prepare("DELETE FROM zones WHERE name = ?");
            $stmt->execute([$nameToDelete]);
            sendResponse(['success' => true, 'message' => 'تم حذف المنطقة بنجاح']);
        }
    }

    if (empty($name)) {
        sendResponse(['error' => 'اسم المنطقة مطلوب'], 400);
    }

    $id = 'zone_' . uniqid();
    try {
        $stmt = $db->prepare("INSERT INTO zones (id, name) VALUES (?, ?)");
        $stmt->execute([$id, $name]);
        sendResponse(['success' => true, 'id' => $id, 'name' => $name, 'message' => 'تمت إضافة المنطقة بنجاح']);
    } catch (PDOException $e) {
        $stmt = $db->prepare("SELECT * FROM zones WHERE name = ?");
        $stmt->execute([$name]);
        $existing = $stmt->fetch();
        sendResponse(['success' => true, 'id' => $existing['id'] ?? $id, 'name' => $name]);
    }
} elseif ($method === 'DELETE') {
    $name = $_GET['name'] ?? null;
    $id = $_GET['id'] ?? null;
    if ($name) {
        $stmt = $db->prepare("DELETE FROM zones WHERE name = ?");
        $stmt->execute([$name]);
        sendResponse(['success' => true, 'message' => 'تم حذف المنطقة']);
    } elseif ($id) {
        $stmt = $db->prepare("DELETE FROM zones WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['success' => true, 'message' => 'تم حذف المنطقة']);
    }
}
