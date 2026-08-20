<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stage = $_GET['stage_name'] ?? null;
    if ($stage) {
        $stmt = $db->prepare("SELECT * FROM grades WHERE stage_name = ? ORDER BY id ASC");
        $stmt->execute([$stage]);
        sendResponse($stmt->fetchAll());
    } else {
        $stmt = $db->query("SELECT * FROM grades ORDER BY id ASC");
        sendResponse($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $stage = trim($input['stage_name'] ?? '');
    $name = trim($input['name_ar'] ?? '');
    if (empty($stage) || empty($name)) sendResponse(['error' => 'المرحلة واسم الصف مطلوبان'], 400);

    $id = 'gr_' . uniqid();
    $stmt = $db->prepare("INSERT INTO grades (id, stage_name, name_ar) VALUES (?, ?, ?)");
    $stmt->execute([$id, $stage, $name]);

    sendResponse(['success' => true, 'id' => $id, 'name_ar' => $name, 'message' => 'تمت إضافة الصف/السنة الدراسية بنجاح']);
} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $old_name = trim($input['old_name'] ?? '');
    $new_name = trim($input['new_name'] ?? '');
    $stage_name = trim($input['stage_name'] ?? '');

    if (empty($new_name)) sendResponse(['error' => 'الاسم الجديد مطلوب'], 400);

    if (!empty($stage_name) && !empty($old_name)) {
        $stmt = $db->prepare("UPDATE grades SET name_ar = ? WHERE name_ar = ? AND stage_name = ?");
        $stmt->execute([$new_name, $old_name, $stage_name]);

        $stmtC = $db->prepare("UPDATE classes SET grade_name = ? WHERE grade_name = ? AND stage_name = ?");
        $stmtC->execute([$new_name, $old_name, $stage_name]);
    } else {
        $stmt = $db->prepare("UPDATE grades SET name_ar = ? WHERE name_ar = ?");
        $stmt->execute([$new_name, $old_name]);
    }

    sendResponse(['success' => true, 'message' => 'تم تعديل اسم الصف الدراسي بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $name = $_GET['name'] ?? null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM grades WHERE id = ?");
        $stmt->execute([$id]);
    } elseif ($name) {
        $stmt = $db->prepare("DELETE FROM grades WHERE name_ar = ?");
        $stmt->execute([$name]);
    }
    sendResponse(['success' => true, 'message' => 'تم حذف الصف الدراسي']);
}
