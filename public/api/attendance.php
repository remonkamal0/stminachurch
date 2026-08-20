<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $date = $_GET['date'] ?? null;
    $student_id = $_GET['student_id'] ?? null;
    $class_id = $_GET['class_id'] ?? null;

    if ($student_id) {
        $stmt = $db->prepare("SELECT * FROM attendance WHERE student_id = ? ORDER BY meeting_date DESC");
        $stmt->execute([$student_id]);
        sendResponse($stmt->fetchAll());
    } else {
        $targetDate = $date ?: date('Y-m-d');
        $query = "SELECT a.*, s.full_name, s.class_name, s.stage_name 
                  FROM attendance a 
                  JOIN students s ON a.student_id = s.id 
                  WHERE a.meeting_date = ?";
        $params = [$targetDate];

        if ($class_id) {
            $query .= " AND s.class_name = ?";
            $params[] = $class_id;
        }

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        sendResponse($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();

    // Check if batch records or single record
    $records = isset($input['records']) && is_array($input['records']) ? $input['records'] : [$input];
    $savedCount = 0;

    $stmt = $db->prepare("
        INSERT INTO attendance (id, student_id, meeting_date, status, attended_mass, confessed) 
        VALUES (?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            status = VALUES(status), 
            attended_mass = VALUES(attended_mass), 
            confessed = VALUES(confessed)
    ");

    foreach ($records as $r) {
        $student_id = $r['student_id'] ?? null;
        if (!$student_id) continue;

        $date = $r['meeting_date'] ?? $r['date'] ?? date('Y-m-d');
        $status = $r['status'] ?? 'present';
        $mass = !empty($r['attended_mass']) ? 1 : 0;
        $confessed = !empty($r['confessed']) ? 1 : 0;
        $id = $r['id'] ?? ('att_' . md5($student_id . $date));

        $stmt->execute([$id, $student_id, $date, $status, $mass, $confessed]);
        $savedCount++;
    }

    sendResponse(['success' => true, 'count' => $savedCount, 'message' => 'تم تسجيل وحفظ الحضور بنجاح في قاعدة البيانات']);
}
