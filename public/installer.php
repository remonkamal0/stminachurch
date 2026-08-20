<?php
/**
 * Church SSMS - Automated Database & Admin Installer for PHP / MySQL
 * Compatible with cPanel, Plesk, Localhost (XAMPP/WAMP/LAMP), and Apache/Nginx.
 */

header('Content-Type: text/html; charset=utf-8');

$step = isset($_GET['step']) ? intval($_GET['step']) : 1;
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['run_install'])) {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_port = trim($_POST['db_port'] ?? '3306');
    $db_name = trim($_POST['db_name'] ?? '');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');

    $church_name = trim($_POST['church_name'] ?? 'كنيسة الشهيد مارمينا');
    $admin_name = trim($_POST['admin_name'] ?? 'أمين الخدمة');
    $admin_email = trim($_POST['admin_email'] ?? 'admin@stmina.church');
    $admin_password = trim($_POST['admin_password'] ?? '123456');

    try {
        // Connect to MySQL server
        $pdo = new PDO("mysql:host={$db_host};port={$db_port};charset=utf8mb4", $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);

        // Create Database if not exists
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE `{$db_name}`;");

        // SQL Schema Tables
        $sql = "
        CREATE TABLE IF NOT EXISTS churches (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            diocese VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS servants (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE,
            password_hash VARCHAR(255),
            phone VARCHAR(50),
            role VARCHAR(50) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS stages (
            id VARCHAR(36) PRIMARY KEY,
            name_ar VARCHAR(100) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS classes (
            id VARCHAR(36) PRIMARY KEY,
            stage_id VARCHAR(36),
            name_ar VARCHAR(100) NOT NULL,
            servant_id VARCHAR(36)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS students (
            id VARCHAR(36) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            gender VARCHAR(20),
            birth_date DATE,
            phone_father VARCHAR(50),
            phone_mother VARCHAR(50),
            street_address TEXT,
            area_zone VARCHAR(100),
            gps_location TEXT,
            class_id VARCHAR(36),
            total_points INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS attendance (
            id VARCHAR(36) PRIMARY KEY,
            student_id VARCHAR(36),
            meeting_date DATE,
            status VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS curriculum_items (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            stage VARCHAR(50),
            class_name VARCHAR(100),
            servant_name VARCHAR(100),
            meeting_day VARCHAR(100),
            lesson_date DATE,
            week_number INT DEFAULT 1,
            bible_verse TEXT,
            bible_citation VARCHAR(100),
            references_text TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        CREATE TABLE IF NOT EXISTS hymns (
            id VARCHAR(36) PRIMARY KEY,
            name_ar VARCHAR(255) NOT NULL,
            name_en VARCHAR(255),
            coptic_text TEXT,
            phonetics TEXT,
            category VARCHAR(50),
            stage VARCHAR(50),
            reward_points INT DEFAULT 20
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ";

        $pdo->exec($sql);

        // Insert Church & Admin
        $church_id = 'ch-' . uniqid();
        $stmt = $pdo->prepare("INSERT INTO churches (id, name) VALUES (?, ?)");
        $stmt->execute([$church_id, $church_name]);

        $admin_id = 'srv-' . uniqid();
        $pass_hash = password_hash($admin_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO servants (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'superadmin')");
        $stmt->execute([$admin_id, $admin_name, $admin_email, $pass_hash]);

        $step = 3;
        $message = "تم إنشاء قاعدة البيانات ({$db_name}) وجميع الجداول وحساب الأدمن ({$admin_email}) بنجاح تام!";

    } catch (Exception $e) {
        $error = "خطأ في التثبيت: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>معالج تثبيت الداتابيز والأدمن • PHP & MySQL</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Cairo', sans-serif; }</style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div class="text-center space-y-1">
            <div class="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-lg">☦</div>
            <h1 class="text-xl font-extrabold text-white">معالج التثبيت الذاتي لقاعدة البيانات (PHP & MySQL)</h1>
            <p class="text-xs text-slate-400">إنشاء الجداول وحساب الأدمن تلقائياً على استضافة cPanel / PHP</p>
        </div>

        <?php if ($error): ?>
            <div class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold">
                ⚠️ <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <?php if ($step === 3): ?>
            <div class="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs space-y-3">
                <h3 class="font-extrabold text-sm text-emerald-400">🎉 <?php echo $message; ?></h3>
                <p>يمكنك الآن استخدام التطبيق فوراً وتسجيل الدخول ببيانات المدير التي أدخلتها.</p>
                <div class="pt-2">
                    <a href="/login" class="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition">الانتقال لتسجيل الدخول</a>
                </div>
            </div>
        <?php else: ?>
            <form method="POST" class="space-y-4 text-xs">
                <input type="hidden" name="run_install" value="1">

                <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <h3 class="font-bold text-blue-400 text-xs">1. بيانات الاتصال بقاعدة بيانات MySQL (من cPanel):</h3>
                    
                    <div class="grid grid-cols-3 gap-3">
                        <div class="col-span-2">
                            <label class="block text-slate-300 mb-1">خادم الداتابيز (DB Host):</label>
                            <input type="text" name="db_host" value="localhost" required class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">المنفذ:</label>
                            <input type="text" name="db_port" value="3306" class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono text-center">
                        </div>
                    </div>

                    <div>
                        <label class="block text-slate-300 mb-1">اسم قاعدة البيانات (Database Name):</label>
                        <input type="text" name="db_name" value="stmina_ssms" required class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-300 mb-1">اسم المستخدم (DB User):</label>
                            <input type="text" name="db_user" value="root" required class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">كلمة المرور (DB Password):</label>
                            <input type="password" name="db_pass" class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono">
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <h3 class="font-bold text-blue-400 text-xs">2. بيانات الكنيسة وحساب الأدمن:</h3>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-300 mb-1">اسم الكنيسة:</label>
                            <input type="text" name="church_name" value="كنيسة الشهيد العظيم مارمينا" class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-bold">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">اسم أمين الخدمة (الأدمن):</label>
                            <input type="text" name="admin_name" value="أمين الخدمة" class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-bold">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-300 mb-1">إيميل الأدمن:</label>
                            <input type="email" name="admin_email" value="admin@stmina.church" required class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">كلمة مرور الأدمن:</label>
                            <input type="password" name="admin_password" value="123456" required class="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white font-mono">
                        </div>
                    </div>
                </div>

                <button type="submit" class="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs transition shadow-lg cursor-pointer">
                    تثبيت وإنشاء الجداول وحساب الأدمن تلقائياً 🚀
                </button>
            </form>
        <?php endif; ?>

    </div>
</body>
</html>
