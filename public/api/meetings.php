<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stage = $_GET['stage_name'] ?? null;
    $class_id = $_GET['class_id'] ?? null;

    // Fetch distinct attendance meetings from attendance table + scheduled meetings
    $query = "
        SELECT 
            COALESCE(m.id, CONCAT('att_meet_', a.meeting_date, '_', IFNULL(c.id, 'all'))) AS id,
            COALESCE(m.title, CONCAT('اجتماع ', IFNULL(c.name_ar, IFNULL(s.class_name, 'عام')))) AS title,
            COALESCE(m.meeting_date, a.meeting_date) AS date,
            COALESCE(m.meeting_date, a.meeting_date) AS meeting_date,
            '04:00 م' AS time,
            COALESCE(m.stage_name, s.stage_name, 'ابتدائي') AS stage_name,
            COALESCE(c.name_ar, s.class_name, 'عام') AS class_name,
            COALESCE(m.class_id, c.id, s.class_id) AS class_id,
            COALESCE(m.notes, 'اجتماع مدارس الأحد الأسبوعي') AS notes,
            'weekly' AS type,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_count,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent_count
        FROM attendance a
        LEFT JOIN students s ON a.student_id = s.id
        LEFT JOIN classes c ON (c.id = s.class_id OR c.name_ar = s.class_name)
        LEFT JOIN meetings m ON (m.meeting_date = a.meeting_date AND (m.class_id = c.id OR m.stage_name = s.stage_name))
        GROUP BY COALESCE(m.meeting_date, a.meeting_date), COALESCE(m.stage_name, s.stage_name), COALESCE(c.name_ar, s.class_name), COALESCE(m.class_id, c.id)
        ORDER BY date DESC
    ";

    $stmt = $db->query($query);
    $records = $stmt->fetchAll();

    // If attendance is empty, fallback to regular meetings table
    if (empty($records)) {
        $stmt2 = $db->query("SELECT m.*, m.meeting_date as date FROM meetings m ORDER BY m.meeting_date DESC");
        $records = $stmt2->fetchAll();
    }

    sendResponse($records);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    
    // Batch or single meeting
    $meetings = isset($input['meetings']) && is_array($input['meetings']) ? $input['meetings'] : [$input];
    $inserted = 0;

    $stmt = $db->prepare("
        INSERT INTO meetings (id, title, meeting_date, stage_name, class_id, notes) 
        VALUES (?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            title = VALUES(title), 
            stage_name = VALUES(stage_name),
            class_id = VALUES(class_id),
            notes = VALUES(notes)
    ");

    foreach ($meetings as $m) {
        $title = trim($m['title'] ?? $m['label'] ?? 'اجتماع مدارس الأحد');
        $date = trim($m['date'] ?? $m['meeting_date'] ?? date('Y-m-d'));
        $stage = trim($m['stage_name'] ?? $m['stage'] ?? 'عام');
        $class_id = trim($m['class_id'] ?? '');
        $notes = trim($m['notes'] ?? '');
        $id = $m['id'] ?? ('meet_' . md5($date . $stage . $class_id . $title));

        $stmt->execute([$id, $title, $date, $stage, $class_id, $notes]);
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
