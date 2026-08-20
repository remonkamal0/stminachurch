<?php
/**
 * STMINA - Universal Database Connection & Self-Healing Engine
 * Compatible with XAMPP, cPanel, Plesk, Docker, and any standard PHP hosting.
 */

// Allow CORS & JSON Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // 1. Check for custom db_config.php (Created by cPanel web installer)
    $configFile = __DIR__ . '/db_config.php';
    if (file_exists($configFile)) {
        $config = require $configFile;
        $host = $config['host'] ?? 'localhost';
        $port = $config['port'] ?? '3306';
        $dbname = $config['dbname'] ?? 'stmina_ssms';
        $user = $config['user'] ?? 'root';
        $pass = $config['pass'] ?? '';
    } else {
        // Environment variables or standard defaults
        $host = getenv('DB_HOST') ?: 'localhost';
        $port = getenv('DB_PORT') ?: '3306';
        $dbname = getenv('DB_NAME') ?: 'stmina_ssms';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
    }

    try {
        // First connect to MySQL server to ensure DB exists
        $tempPdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

        // Now connect to the database
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);

        // Auto-initialize tables if not exists (Self-Healing on first run)
        ensureSchemaExists($pdo);

        return $pdo;
    } catch (PDOException $e) {
        sendResponse([
            'error' => 'Database connection failed',
            'details' => $e->getMessage(),
            'hint' => 'Please configure database credentials in api/db_config.php or run install.php'
        ], 500);
        exit;
    }
}

function ensureSchemaExists($pdo) {
    static $schemaChecked = false;
    if ($schemaChecked) return;

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS stages (
            id VARCHAR(50) PRIMARY KEY,
            name_ar VARCHAR(255) NOT NULL UNIQUE,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS grades (
            id VARCHAR(50) PRIMARY KEY,
            stage_name VARCHAR(255) NOT NULL,
            name_ar VARCHAR(255) NOT NULL,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uk_stage_grade (stage_name, name_ar)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS classes (
            id VARCHAR(50) PRIMARY KEY,
            name_ar VARCHAR(255) NOT NULL,
            stage_name VARCHAR(255) NOT NULL,
            grade_name VARCHAR(255) DEFAULT 'الصف الأول',
            gender ENUM('بنين', 'بنات', 'مشترك') DEFAULT 'مشترك',
            patron_saint VARCHAR(255) DEFAULT NULL,
            room_number VARCHAR(100) DEFAULT 'قاعة الخدمات',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS residential_zones (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS priests (
            id VARCHAR(50) PRIMARY KEY,
            name_ar VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(50),
            church_name VARCHAR(255) DEFAULT 'كنيسة الشهيد العظيم مارمينا',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS role_permissions (
            role_key VARCHAR(50) PRIMARY KEY,
            permissions_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS servants (
            id VARCHAR(50) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            username VARCHAR(100) UNIQUE,
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            gender ENUM('male', 'female') DEFAULT 'male',
            deacon_rank VARCHAR(100) DEFAULT NULL,
            birth_date DATE DEFAULT NULL,
            confession_father VARCHAR(255) DEFAULT NULL,
            role VARCHAR(50) DEFAULT 'servant',
            role_label VARCHAR(100) DEFAULT 'خادم فصل',
            stage_name VARCHAR(255) DEFAULT 'عام',
            class_name VARCHAR(255) DEFAULT 'عام',
            service_assignments TEXT DEFAULT NULL,
            is_also_student TINYINT(1) DEFAULT 0,
            student_stage_name VARCHAR(255) DEFAULT NULL,
            student_class_name VARCHAR(255) DEFAULT NULL,
            student_id VARCHAR(50) DEFAULT NULL,
            street_address TEXT DEFAULT NULL,
            area_zone VARCHAR(255) DEFAULT NULL,
            gps_location TEXT DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS students (
            id VARCHAR(50) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            gender ENUM('بنين', 'بنات') NOT NULL,
            deacon_rank VARCHAR(100) DEFAULT 'none',
            birth_date DATE NOT NULL,
            school VARCHAR(255) DEFAULT NULL,
            class_name VARCHAR(255) NOT NULL,
            class_id VARCHAR(50) DEFAULT NULL,
            stage_name VARCHAR(255) NOT NULL,
            phone_student VARCHAR(50) DEFAULT NULL,
            phone_father VARCHAR(50) DEFAULT NULL,
            father_job VARCHAR(255) DEFAULT NULL,
            mother_name VARCHAR(255) DEFAULT NULL,
            phone_mother VARCHAR(50) DEFAULT NULL,
            mother_job VARCHAR(255) DEFAULT NULL,
            area_zone VARCHAR(255) DEFAULT NULL,
            street_address TEXT DEFAULT NULL,
            gps_location TEXT DEFAULT NULL,
            avatar_url TEXT DEFAULT NULL,
            confession_father_name VARCHAR(255) DEFAULT NULL,
            confession_last_date DATE DEFAULT NULL,
            talents TEXT DEFAULT NULL,
            notes TEXT DEFAULT NULL,
            health_notes TEXT DEFAULT NULL,
            total_points INT DEFAULT 0,
            is_servant TINYINT(1) DEFAULT 0,
            servant_id VARCHAR(50) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS attendance (
            id VARCHAR(50) PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            status ENUM('present', 'absent', 'excused') NOT NULL,
            service_type VARCHAR(100) DEFAULT 'مدارس الأحد',
            points_earned INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uk_attendance (student_id, date, service_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS followups (
            id VARCHAR(50) PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            servant_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            type ENUM('call', 'visit', 'social_media', 'church_meeting') NOT NULL,
            status ENUM('completed', 'no_answer', 'postponed', 'needs_father_visit') NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS finance_funds (
            id VARCHAR(50) PRIMARY KEY,
            name_ar VARCHAR(255) NOT NULL,
            balance DECIMAL(12,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS finance_transactions (
            id VARCHAR(50) PRIMARY KEY,
            fund_id VARCHAR(50) DEFAULT 'main',
            type ENUM('income', 'expense') NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            description TEXT,
            recorded_by VARCHAR(255) DEFAULT 'أمين الصندوق',
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS quizzes (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            stage_name VARCHAR(255) NOT NULL,
            class_name VARCHAR(255) DEFAULT 'كل الفصول',
            questions_json TEXT NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Pre-seed Stages if table is empty
    $count = $pdo->query("SELECT COUNT(*) FROM stages")->fetchColumn();
    if ($count == 0) {
        $stages = [
            ['stg_1', 'حضانة', 1],
            ['stg_2', 'ابتدائي', 2],
            ['stg_3', 'إعدادي', 3],
            ['stg_4', 'ثانوي', 4],
            ['stg_5', 'جامعيين وخريجين', 5],
            ['stg_6', 'إعداد خدام', 6],
            ['stg_7', 'خدمة الكشافة والمرشدات', 7],
            ['stg_8', 'خدمة الكورال والترانيم', 8],
            ['stg_9', 'خدمة أخوة الرب', 9],
            ['stg_10', 'خدمة المسنين والمرضى', 10],
            ['stg_11', 'خدمة الصم وضعاف السمع', 11],
            ['stg_12', 'خدمة المغتربين', 12],
            ['stg_13', 'لجنة النظام والاستقبال', 13],
            ['stg_14', 'خدمة وسائل الإيضاح والميديا', 14]
        ];
        $st = $pdo->prepare("INSERT IGNORE INTO stages (id, name_ar, sort_order) VALUES (?, ?, ?)");
        foreach ($stages as $s) $st->execute($s);
    }

    // Pre-seed Super Admin Servant if empty
    $adminCount = $pdo->query("SELECT COUNT(*) FROM servants")->fetchColumn();
    if ($adminCount == 0) {
        $adminPass = password_hash('123456', PASSWORD_BCRYPT);
        $pdo->prepare("
            INSERT INTO servants (id, full_name, username, email, password, role, role_label, stage_name, class_name, is_active)
            VALUES ('srv_admin', 'أمين عام الخدمة (مسؤول النظام)', 'admin', 'admin@church.org', ?, 'service_admin', 'أمين عام الخدمة', 'عام', 'كل الفصول', 1)
        ")->execute([$adminPass]);
    }

    // Pre-seed Priests if empty
    $priestsCount = $pdo->query("SELECT COUNT(*) FROM priests")->fetchColumn();
    if ($priestsCount == 0) {
        $priests = [
            ['pr_1', 'القمص تادرس يعقوب ملطي', '01221111111', 'كنيسة الشهيد مارجرجس سبورتنج'],
            ['pr_2', 'القمص بيشوي كامل', '01222222222', 'كنيسة الشهيد مارجرجس سبورتنج'],
            ['pr_3', 'أبونا تادرس', '01233333333', 'كنيسة الشهيد مارمينا'],
            ['pr_4', 'أبونا بيشوي', '01244444444', 'كنيسة الشهيد مارمينا'],
            ['pr_5', 'أبونا يوحنا', '01255555555', 'كنيسة الشهيد مارمينا']
        ];
        $stPr = $pdo->prepare("INSERT IGNORE INTO priests (id, name_ar, phone, church_name) VALUES (?, ?, ?, ?)");
        foreach ($priests as $p) $stPr->execute($p);
    }

    $schemaChecked = true;
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}
