<?php
require_once __DIR__ . '/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("
        SELECT c.*, 
               c.stage_name AS stage_name_ar,
               c.grade_name AS grade_name_ar,
               (
                   SELECT COUNT(*) 
                   FROM students std 
                   WHERE std.class_id = c.id 
                      OR std.class_name = c.name_ar
               ) AS students_count,
               (
                   SELECT COUNT(*) 
                   FROM servants srv 
                   WHERE srv.class_name = c.name_ar 
                      OR srv.class_name = c.id
                      OR srv.service_assignments LIKE CONCAT('%', c.name_ar, '%')
                      OR srv.service_assignments LIKE CONCAT('%', c.id, '%')
               ) AS servants_count
        FROM classes c
        ORDER BY c.created_at ASC
    ");
    $classes = $stmt->fetchAll();
    sendResponse($classes);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $name = trim($input['name_ar'] ?? '');

    if (empty($name)) {
        sendResponse(['error' => 'اسم الفصل مطلوب'], 400);
    }

    $id = 'c_' . uniqid();
    $stmt = $db->prepare("INSERT INTO classes (id, name_ar, stage_name, grade_name, gender, patron_saint, room_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $name,
        $input['stage_name'] ?? 'ابتدائي',
        $input['grade_name'] ?? 'الصف الأول',
        $input['gender'] ?? 'مشترك',
        $input['patron_saint'] ?? $name,
        $input['room_number'] ?? 'قاعة الخدمات'
    ]);

    sendResponse(['success' => true, 'id' => $id, 'message' => 'تم إنشاء وحفظ الفصل في قاعدة البيانات بنجاح']);
} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    if (!$id) sendResponse(['error' => 'Class ID required'], 400);

    $stmt = $db->prepare("UPDATE classes SET name_ar = ?, stage_name = ?, grade_name = ?, gender = ?, patron_saint = ?, room_number = ? WHERE id = ?");
    $stmt->execute([
        $input['name_ar'],
        $input['stage_name'] ?? 'ابتدائي',
        $input['grade_name'] ?? 'الصف الأول',
        $input['gender'] ?? 'مشترك',
        $input['patron_saint'] ?? $input['name_ar'],
        $input['room_number'] ?? 'قاعة الخدمات',
        $id
    ]);

    sendResponse(['success' => true, 'message' => 'تم تحديث بيانات الفصل بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getJsonInput();
        $id = $input['id'] ?? null;
    }
    if ($id) {
        $stmt = $db->prepare("DELETE FROM classes WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['success' => true, 'message' => 'تم حذف الفصل من قاعدة البيانات بنجاح']);
    } else {
        sendResponse(['error' => 'No ID provided for delete'], 400);
    }
}
