<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT name_ar, MIN(id) as id, MIN(sort_order) as sort_order FROM stages GROUP BY name_ar ORDER BY sort_order ASC, id ASC");
    sendResponse($stmt->fetchAll());
} elseif ($method === 'POST') {
    $input = getJsonInput();

    // Check if reordering action
    if (isset($input['action']) && $input['action'] === 'reorder' && isset($input['stages']) && is_array($input['stages'])) {
        $stmt = $db->prepare("UPDATE stages SET sort_order = ? WHERE name_ar = ? OR id = ?");
        foreach ($input['stages'] as $index => $item) {
            $name = is_array($item) ? ($item['name_ar'] ?? '') : $item;
            $id = is_array($item) ? ($item['id'] ?? '') : '';
            $stmt->execute([$index + 1, $name, $id]);
        }
        sendResponse(['success' => true, 'message' => 'تم حفظ الترتيب الجديد في قاعدة البيانات']);
    }

    $name = trim($input['name_ar'] ?? '');
    if (empty($name)) sendResponse(['error' => 'اسم المرحلة مطلوب'], 400);

    $maxOrder = (int)$db->query("SELECT COALESCE(MAX(sort_order), 0) FROM stages")->fetchColumn();
    $id = 'stg_' . uniqid();
    $stmt = $db->prepare("INSERT INTO stages (id, name_ar, sort_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name_ar = VALUES(name_ar)");
    $stmt->execute([$id, $name, $maxOrder + 1]);

    sendResponse(['success' => true, 'id' => $id, 'name_ar' => $name, 'message' => 'تمت إضافة المرحلة بنجاح']);
} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $old_name = trim($input['old_name'] ?? '');
    $new_name = trim($input['new_name'] ?? '');
    $id = trim($input['id'] ?? '');

    if (empty($new_name)) sendResponse(['error' => 'الاسم الجديد مطلوب'], 400);

    if (!empty($id)) {
        $stmt = $db->prepare("UPDATE stages SET name_ar = ? WHERE id = ?");
        $stmt->execute([$new_name, $id]);
    }
    if (!empty($old_name)) {
        $stmt = $db->prepare("UPDATE stages SET name_ar = ? WHERE name_ar = ?");
        $stmt->execute([$new_name, $old_name]);

        // Cascading update on grades and classes
        $stmtG = $db->prepare("UPDATE grades SET stage_name = ? WHERE stage_name = ?");
        $stmtG->execute([$new_name, $old_name]);

        $stmtC = $db->prepare("UPDATE classes SET stage_name = ? WHERE stage_name = ?");
        $stmtC->execute([$new_name, $old_name]);
    }

    sendResponse(['success' => true, 'message' => 'تم تعديل اسم المرحلة بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $name = $_GET['name'] ?? null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM stages WHERE id = ?");
        $stmt->execute([$id]);
    } elseif ($name) {
        $stmt = $db->prepare("DELETE FROM stages WHERE name_ar = ?");
        $stmt->execute([$name]);
    }
    sendResponse(['success' => true, 'message' => 'تم حذف المرحلة']);
}
