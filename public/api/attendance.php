<?php
require_once __DIR__ . '/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_id = $_GET['student_id'] ?? null;
    $date = $_GET['date'] ?? null;
    $class_id = $_GET['class_id'] ?? null;

    if ($student_id) {
        $stmt = $db->prepare("
            SELECT a.*, s.full_name 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            WHERE a.student_id = ? 
            ORDER BY a.meeting_date DESC
        ");
        $stmt->execute([$student_id]);
        sendResponse($stmt->fetchAll());
    } elseif ($date) {
        $stmt = $db->prepare("
            SELECT a.*, s.full_name, s.class_name, s.stage_name 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            WHERE a.meeting_date = ? 
            ORDER BY s.full_name ASC
        ");
        $stmt->execute([$date]);
        sendResponse($stmt->fetchAll());
    } else {
        $stmt = $db->query("
            SELECT a.*, s.full_name, s.class_name, s.stage_name 
            FROM attendance a 
            JOIN students s ON a.student_id = s.id 
            ORDER BY a.meeting_date DESC 
            LIMIT 100
        ");
        sendResponse($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    
    // Batch or Single
    if (isset($input['records']) && is_array($input['records'])) {
        $date = $input['meeting_date'] ?? date('Y-m-d');
        $stmt = $db->prepare("
            INSERT INTO attendance (id, student_id, meeting_date, status, notes) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
        ");
        
        foreach ($input['records'] as $rec) {
            if (!empty($rec['student_id'])) {
                $id = 'att_' . uniqid();
                $status = $rec['status'] ?? 'present';
                $notes = $rec['notes'] ?? null;
                $stmt->execute([$id, $rec['student_id'], $date, $status, $notes]);
            }
        }
        sendResponse(['success' => true, 'message' => 'تم حفظ كشف الحضور بالكامل في قاعدة البيانات بنجاح']);
    } else {
        $student_id = $input['student_id'] ?? null;
        $status = $input['status'] ?? 'present';
        $date = $input['meeting_date'] ?? date('Y-m-d');
        $notes = $input['notes'] ?? null;

        if (!$student_id) sendResponse(['error' => 'Student ID required'], 400);

        $id = 'att_' . uniqid();
        $stmt = $db->prepare("
            INSERT INTO attendance (id, student_id, meeting_date, status, notes) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
        ");
        $stmt->execute([$id, $student_id, $date, $status, $notes]);

        sendResponse(['success' => true, 'message' => 'تم تسجيل الحضور في قاعدة البيانات']);
    }
}
