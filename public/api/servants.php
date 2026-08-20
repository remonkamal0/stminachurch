<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT id, full_name, username, email, phone, gender, deacon_rank, birth_date, confession_father, role, role_label, stage_name, class_name, service_assignments, is_also_student, student_stage_name, student_class_name, student_id, is_active, created_at FROM servants ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if (!empty($row['service_assignments'])) {
            $decoded = json_decode($row['service_assignments'], true);
            $row['service_assignments'] = is_array($decoded) ? $decoded : [];
        } else {
            $row['service_assignments'] = [];
        }
    }
    sendResponse($rows);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $name = trim($input['full_name'] ?? '');
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? ($username ? ($username . '@church.org') : ''));
    $plainPassword = trim($input['password'] ?? '123456');

    if (empty($name)) {
        sendResponse(['error' => 'اسم الخادم مطلوب'], 400);
    }
    if (empty($email)) {
        $email = 'srv_' . uniqid() . '@church.org';
    }

    $id = 'srv_' . uniqid();
    $passHash = password_hash($plainPassword, PASSWORD_BCRYPT);
    $isAlsoStudent = !empty($input['is_also_student']) ? 1 : 0;
    $studentStage = trim($input['student_stage_name'] ?? '');
    $studentClass = trim($input['student_class_name'] ?? '');
    $studentId = null;

    // Multiple service assignments
    $assignments = $input['service_assignments'] ?? [];
    if (!is_array($assignments) || count($assignments) === 0) {
        $assignments = [[
            'stage_name' => $input['stage_name'] ?? 'ابتدائي',
            'class_name' => $input['class_name'] ?? 'فصل عام',
            'role_label' => $input['role_label'] ?? 'خادم فصل'
        ]];
    }
    $assignmentsJson = json_encode($assignments, JSON_UNESCAPED_UNICODE);

    $primaryStage = $assignments[0]['stage_name'] ?? ($input['stage_name'] ?? 'عام');
    $primaryClass = $assignments[0]['class_name'] ?? ($input['class_name'] ?? 'عام');
    $primaryRoleLabel = $assignments[0]['role_label'] ?? ($input['role_label'] ?? 'خادم');

    // If dual-role: also insert student into students table
    if ($isAlsoStudent) {
        $studentId = 'std_srv_' . uniqid();
        $stmtStd = $db->prepare("
            INSERT INTO students (id, full_name, gender, deacon_rank, birth_date, school, class_name, stage_name, phone_student, confession_father_name, is_servant, servant_id, total_points)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0)
        ");
        $stmtStd->execute([
            $studentId,
            $name,
            ($input['gender'] ?? 'male') === 'female' ? 'بنات' : 'بنين',
            $input['deacon_rank'] ?? 'none',
            $input['birth_date'] ?? date('Y-m-d'),
            'خادم ومخدوم',
            $studentClass ?: 'اجتماع الشباب والخريجين',
            $studentStage ?: 'جامعيين وخريجين',
            $input['phone'] ?? null,
            $input['confession_father'] ?? null,
            $id
        ]);
    }

    $role = $input['role'] ?? 'servant';

    $stmt = $db->prepare("
        INSERT INTO servants (id, full_name, username, email, password, phone, gender, deacon_rank, birth_date, confession_father, role, role_label, stage_name, class_name, service_assignments, is_also_student, student_stage_name, student_class_name, student_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $id,
        $name,
        $username,
        $email,
        $passHash,
        $input['phone'] ?? null,
        $input['gender'] ?? 'male',
        $input['deacon_rank'] ?? null,
        $input['birth_date'] ?? null,
        $input['confession_father'] ?? null,
        $role,
        $primaryRoleLabel,
        $primaryStage,
        $primaryClass,
        $assignmentsJson,
        $isAlsoStudent,
        $studentStage,
        $studentClass,
        $studentId
    ]);

    sendResponse([
        'success' => true,
        'id' => $id,
        'student_id' => $studentId,
        'message' => 'تم تسجيل وحفظ بيانات الخادم وتعيين خدماته المتعددة بنجاح'
    ]);
} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? '');
    if (empty($id)) sendResponse(['error' => 'Servant ID required'], 400);

    $name = trim($input['full_name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $username = trim($input['username'] ?? '');
    $role = trim($input['role'] ?? 'servant');
    $roleLabel = trim($input['role_label'] ?? 'خادم فصل');
    $deaconRank = trim($input['deacon_rank'] ?? '');
    $confessionFather = trim($input['confession_father'] ?? '');
    $isAlsoStudent = !empty($input['is_also_student']) ? 1 : 0;
    $studentStage = trim($input['student_stage_name'] ?? '');
    $studentClass = trim($input['student_class_name'] ?? '');

    $assignments = $input['service_assignments'] ?? [];
    if (is_array($assignments) && count($assignments) > 0) {
        $assignmentsJson = json_encode($assignments, JSON_UNESCAPED_UNICODE);
        $primaryStage = $assignments[0]['stage_name'] ?? 'عام';
        $primaryClass = $assignments[0]['class_name'] ?? 'عام';
        $primaryRoleLabel = $assignments[0]['role_label'] ?? $roleLabel;
    } else {
        $assignmentsJson = null;
        $primaryStage = trim($input['stage_name'] ?? 'عام');
        $primaryClass = trim($input['class_name'] ?? 'عام');
        $primaryRoleLabel = $roleLabel;
    }

    // If password provided, update hash
    if (!empty($input['password'])) {
        $passHash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $db->prepare("
            UPDATE servants SET full_name = ?, phone = ?, username = ?, role = ?, role_label = ?, deacon_rank = ?, confession_father = ?, stage_name = ?, class_name = ?, service_assignments = ?, is_also_student = ?, student_stage_name = ?, student_class_name = ?, password = ? WHERE id = ?
        ");
        $stmt->execute([$name, $phone, $username, $role, $primaryRoleLabel, $deaconRank, $confessionFather, $primaryStage, $primaryClass, $assignmentsJson, $isAlsoStudent, $studentStage, $studentClass, $passHash, $id]);
    } else {
        $stmt = $db->prepare("
            UPDATE servants SET full_name = ?, phone = ?, username = ?, role = ?, role_label = ?, deacon_rank = ?, confession_father = ?, stage_name = ?, class_name = ?, service_assignments = ?, is_also_student = ?, student_stage_name = ?, student_class_name = ? WHERE id = ?
        ");
        $stmt->execute([$name, $phone, $username, $role, $primaryRoleLabel, $deaconRank, $confessionFather, $primaryStage, $primaryClass, $assignmentsJson, $isAlsoStudent, $studentStage, $studentClass, $id]);
    }

    // Sync dual-role student record if exists
    if ($isAlsoStudent) {
        $stmtStdCheck = $db->prepare("SELECT id FROM students WHERE servant_id = ?");
        $stmtStdCheck->execute([$id]);
        $existingStdId = $stmtStdCheck->fetchColumn();

        if ($existingStdId) {
            $stmtUpdStd = $db->prepare("UPDATE students SET full_name = ?, phone_student = ?, stage_name = ?, class_name = ?, confession_father_name = ? WHERE servant_id = ?");
            $stmtUpdStd->execute([$name, $phone, $studentStage, $studentClass, $confessionFather, $id]);
        } else {
            $newStdId = 'std_srv_' . uniqid();
            $stmtInsStd = $db->prepare("INSERT INTO students (id, full_name, gender, school, class_name, stage_name, phone_student, confession_father_name, is_servant, servant_id, total_points) VALUES (?, ?, 'بنين', 'خادم ومخدوم', ?, ?, ?, ?, 1, ?, 0)");
            $stmtInsStd->execute([$newStdId, $name, $studentClass ?: 'اجتماع الشباب', $studentStage ?: 'جامعيين وخريجين', $phone, $confessionFather, $id]);
            $db->prepare("UPDATE servants SET student_id = ? WHERE id = ?")->execute([$newStdId, $id]);
        }
    } else {
        $db->prepare("DELETE FROM students WHERE servant_id = ?")->execute([$id]);
    }

    sendResponse(['success' => true, 'message' => 'تم تعديل وتحديث بيانات الخادم بنجاح']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmtStd = $db->prepare("DELETE FROM students WHERE servant_id = ?");
        $stmtStd->execute([$id]);

        $stmt = $db->prepare("DELETE FROM servants WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['success' => true, 'message' => 'تم حذف الخادم']);
    }
}
