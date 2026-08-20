<?php
require_once __DIR__ . '/db.php';
$db = getDB();

$studentsCount = (int)$db->query("SELECT COUNT(*) FROM students")->fetchColumn();
$servantsCount = (int)$db->query("SELECT COUNT(*) FROM servants")->fetchColumn();
$classesCount = (int)$db->query("SELECT COUNT(*) FROM classes")->fetchColumn();
$followupsCount = (int)$db->query("SELECT COUNT(*) FROM followup_records")->fetchColumn();
$pointsSum = (int)$db->query("SELECT COALESCE(SUM(total_points), 0) FROM students")->fetchColumn();
$todayAttendance = (int)$db->query("SELECT COUNT(*) FROM attendance WHERE meeting_date = CURDATE() AND status = 'present'")->fetchColumn();

// Recent students
$recentStudents = $db->query("SELECT id, full_name, class_name, stage_name, created_at FROM students ORDER BY created_at DESC LIMIT 5")->fetchAll();

sendResponse([
    'total_students' => $studentsCount,
    'total_servants' => $servantsCount,
    'total_classes' => $classesCount,
    'total_followups' => $followupsCount,
    'total_points' => $pointsSum,
    'today_attendance' => $todayAttendance,
    'recent_students' => $recentStudents
]);
