<?php
require_once __DIR__ . '/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $student_id = $_GET['student_id'] ?? null;
    if ($student_id) {
        $stmt = $db->prepare("SELECT * FROM points_transactions WHERE student_id = ? ORDER BY created_at DESC");
        $stmt->execute([$student_id]);
        sendResponse($stmt->fetchAll());
    } else {
        $stmt = $db->query("SELECT p.*, s.full_name FROM points_transactions p JOIN students s ON p.student_id = s.id ORDER BY p.created_at DESC LIMIT 50");
        sendResponse($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $student_id = $input['student_id'] ?? null;
    $amount = intval($input['amount'] ?? 0);
    $reason = trim($input['reason'] ?? 'منح نقاط مكافأة');

    if (!$student_id) sendResponse(['error' => 'Student ID required'], 400);

    $id = 'pts_' . uniqid();
    $stmt = $db->prepare("INSERT INTO points_transactions (id, student_id, amount, reason, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$id, $student_id, $amount, $reason]);

    // Update total_points in students table
    $stmt2 = $db->prepare("UPDATE students SET total_points = GREATEST(0, total_points + ?) WHERE id = ?");
    $stmt2->execute([$amount, $student_id]);

    sendResponse(['success' => true, 'message' => 'تمت إضافة النقاط بنجاح']);
}
