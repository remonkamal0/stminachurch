<?php
require_once __DIR__ . '/db.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM students WHERE id = ?");
        $stmt->execute([$id]);
        $student = $stmt->fetch();
        if ($student) {
            sendResponse($student);
        } else {
            sendResponse(['error' => 'المخدوم غير موجود'], 404);
        }
    } else {
        $stmt = $db->query("SELECT * FROM students ORDER BY full_name ASC");
        $students = $stmt->fetchAll();
        sendResponse($students);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    if (empty($input['full_name'])) {
        sendResponse(['error' => 'اسم المخدوم مطلوب'], 400);
    }

    $id = $input['id'] ?? ('std_' . uniqid());
    
    $stmt = $db->prepare("
        INSERT INTO students (
            id, full_name, gender, deacon_rank, birth_date, school,
            class_name, class_id, stage_name, phone_student, phone_father,
            father_job, mother_name, phone_mother, mother_job, area_zone,
            street_address, gps_location, avatar_url, confession_father_name,
            confession_last_date, talents, notes, health_notes, total_points, is_servant, servant_id
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
        ) ON DUPLICATE KEY UPDATE
            full_name = VALUES(full_name),
            gender = VALUES(gender),
            deacon_rank = VALUES(deacon_rank),
            birth_date = VALUES(birth_date),
            school = VALUES(school),
            class_name = VALUES(class_name),
            class_id = VALUES(class_id),
            stage_name = VALUES(stage_name),
            phone_student = VALUES(phone_student),
            phone_father = VALUES(phone_father),
            father_job = VALUES(father_job),
            mother_name = VALUES(mother_name),
            phone_mother = VALUES(phone_mother),
            mother_job = VALUES(mother_job),
            area_zone = VALUES(area_zone),
            street_address = VALUES(street_address),
            gps_location = VALUES(gps_location),
            avatar_url = VALUES(avatar_url),
            confession_father_name = VALUES(confession_father_name),
            confession_last_date = VALUES(confession_last_date),
            talents = VALUES(talents),
            notes = VALUES(notes),
            health_notes = VALUES(health_notes),
            total_points = VALUES(total_points)
    ");

    $stmt->execute([
        $id,
        $input['full_name'],
        $input['gender'] ?? 'بنين',
        $input['deacon_rank'] ?? 'none',
        $input['birth_date'] ?? null,
        $input['school'] ?? null,
        $input['class_name'] ?? 'فصل عام',
        $input['class_id'] ?? null,
        $input['stage_name'] ?? 'ابتدائي',
        $input['phone_student'] ?? null,
        $input['phone_father'] ?? null,
        $input['father_job'] ?? null,
        $input['mother_name'] ?? null,
        $input['phone_mother'] ?? null,
        $input['mother_job'] ?? null,
        $input['area_zone'] ?? 'محطة الرمل',
        $input['street_address'] ?? null,
        $input['gps_location'] ?? null,
        $input['avatar_url'] ?? null,
        $input['confession_father_name'] ?? ($input['confession_father'] ?? null),
        $input['confession_last_date'] ?? null,
        $input['talents'] ?? null,
        $input['notes'] ?? null,
        $input['health_notes'] ?? null,
        $input['total_points'] ?? 0,
        $input['is_servant'] ?? 0,
        $input['servant_id'] ?? null
    ]);

    sendResponse(['success' => true, 'id' => $id, 'message' => 'تم حفظ المخدوم في قاعدة البيانات بنجاح']);
} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    if (!$id) sendResponse(['error' => 'Student ID required'], 400);

    $stmt = $db->prepare("
        UPDATE students SET 
            full_name = ?, gender = ?, deacon_rank = ?, birth_date = ?, school = ?,
            class_name = ?, class_id = ?, stage_name = ?, phone_student = ?, phone_father = ?,
            father_job = ?, mother_name = ?, phone_mother = ?, mother_job = ?, area_zone = ?,
            street_address = ?, gps_location = ?, avatar_url = ?, confession_father_name = ?,
            confession_last_date = ?, talents = ?, notes = ?, health_notes = ?, total_points = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $input['full_name'],
        $input['gender'] ?? 'بنين',
        $input['deacon_rank'] ?? 'none',
        $input['birth_date'] ?? null,
        $input['school'] ?? null,
        $input['class_name'] ?? 'فصل عام',
        $input['class_id'] ?? null,
        $input['stage_name'] ?? 'ابتدائي',
        $input['phone_student'] ?? null,
        $input['phone_father'] ?? null,
        $input['father_job'] ?? null,
        $input['mother_name'] ?? null,
        $input['phone_mother'] ?? null,
        $input['mother_job'] ?? null,
        $input['area_zone'] ?? 'محطة الرمل',
        $input['street_address'] ?? null,
        $input['gps_location'] ?? null,
        $input['avatar_url'] ?? null,
        $input['confession_father_name'] ?? ($input['confession_father'] ?? null),
        $input['confession_last_date'] ?? null,
        $input['talents'] ?? null,
        $input['notes'] ?? null,
        $input['health_notes'] ?? null,
        $input['total_points'] ?? 0,
        $id
    ]);

    sendResponse(['success' => true, 'message' => 'تم تحديث بيانات المخدوم بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM students WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['success' => true, 'message' => 'تم حذف المخدوم']);
    }
}
