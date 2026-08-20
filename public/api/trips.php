<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM trips ORDER BY trip_date DESC");
    sendResponse($stmt->fetchAll());
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $title = trim($input['title'] ?? '');
    if (empty($title)) sendResponse(['error' => 'عنوان الرحلة مطلوب'], 400);
    $id = 'trp_' . uniqid();
    $stmt = $db->prepare("INSERT INTO trips (id, title, destination, trip_date, price, capacity, stage_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $title,
        $input['destination'] ?? 'دير مارمينا كينج مريوط',
        $input['trip_date'] ?? date('Y-m-d'),
        $input['price'] ?? 100,
        $input['capacity'] ?? 50,
        $input['stage_name'] ?? 'عام',
        $input['notes'] ?? ''
    ]);
    sendResponse(['success' => true, 'id' => $id, 'message' => 'تم حفظ الرحلة بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM trips WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['success' => true, 'message' => 'تم حذف الرحلة']);
    }
}
