<?php
require_once __DIR__ . '/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_id = $_GET['student_id'] ?? null;
    if ($student_id) {
        $stmt = $db->prepare("SELECT f.*, s.full_name FROM followup_records f JOIN students s ON f.student_id = s.id WHERE f.student_id = ? ORDER BY f.visit_date DESC");
        $stmt->execute([$student_id]);
        sendResponse($stmt->fetchAll());
    } else {
        $stmt = $db->query("SELECT f.*, s.full_name, s.area_zone FROM followup_records f JOIN students s ON f.student_id = s.id ORDER BY f.visit_date DESC LIMIT 50");
        sendResponse($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $student_id = $input['student_id'] ?? null;
    if (!$student_id) sendResponse(['error' => 'Student ID required'], 400);

    $id = 'fol_' . uniqid();
    $stmt = $db->prepare("INSERT INTO followup_records (id, student_id, servant_id, visit_type, notes, visit_date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $student_id,
        $input['servant_id'] ?? null,
        $input['visit_type'] ?? 'home_visit',
        $input['notes'] ?? 'تم الافتقاد بنجاح',
        $input['visit_date'] ?? date('Y-m-d')
    ]);

    sendResponse(['success' => true, 'message' => 'تم توثيق الزيارة في قاعدة البيانات']);
}
