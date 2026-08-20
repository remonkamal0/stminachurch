<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stage = $_GET['stage_name'] ?? null;
    $class_id = $_GET['class_id'] ?? null;

    $query = "SELECT m.*, 
              (SELECT COUNT(*) FROM attendance a WHERE a.meeting_date = m.meeting_date AND a.status = 'present') as present_count,
              (SELECT COUNT(*) FROM attendance a WHERE a.meeting_date = m.meeting_date AND a.status = 'absent') as absent_count
              FROM meetings m WHERE 1=1";
    $params = [];
    if ($stage) {
        $query .= " AND m.stage_name = ?";
        $params[] = $stage;
    }
    if ($class_id) {
        $query .= " AND m.class_id = ?";
        $params[] = $class_id;
    }
    $query .= " ORDER BY m.meeting_date DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    sendResponse($stmt->fetchAll());
} elseif ($method === 'POST') {
    $input = getJsonInput();
    
    // Batch or single meeting
    $meetings = isset($input['meetings']) && is_array($input['meetings']) ? $input['meetings'] : [$input];
    $inserted = 0;

    $stmt = $db->prepare("INSERT INTO meetings (id, title, meeting_date, stage_name, class_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), stage_name = VALUES(stage_name)");

    foreach ($meetings as $m) {
        $title = trim($m['title'] ?? $m['label'] ?? 'اجتماع مدارس الأحد');
        $date = trim($m['date'] ?? $m['meeting_date'] ?? date('Y-m-d'));
        $stage = trim($m['stage_name'] ?? $m['stage'] ?? 'عام');
        $class_id = trim($m['class_id'] ?? '');
        $id = $m['id'] ?? ('meet_' . md5($date . $stage . $class_id . $title));

        $stmt->execute([$id, $title, $date, $stage, $class_id]);
        $inserted++;
    }

    sendResponse(['success' => true, 'count' => $inserted, 'message' => 'تم حفظ الاجتماعات في قاعدة البيانات بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM meetings WHERE id = ?");
        $stmt->execute([$id]);
    }
    sendResponse(['success' => true, 'message' => 'تم حذف الاجتماع']);
}
