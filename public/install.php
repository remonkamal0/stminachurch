<?php
/**
 * STMINA Church Management System - cPanel & Web Installer Wizard
 */
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbPort = trim($_POST['db_port'] ?? '3306');
    $dbName = trim($_POST['db_name'] ?? 'stmina_ssms');
    $dbUser = trim($_POST['db_user'] ?? 'root');
    $dbPass = trim($_POST['db_pass'] ?? '');

    try {
        // Test connection
        $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};charset=utf8mb4", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

        // Write api/db_config.php
        $configContent = "<?php
return [
    'host' => '{$dbHost}',
    'port' => '{$dbPort}',
    'dbname' => '{$dbName}',
    'user' => '{$dbUser}',
    'pass' => '{$dbPass}'
];
";
        
        $apiDir = __DIR__ . '/api';
        if (!is_dir($apiDir)) mkdir($apiDir, 0755, true);
        file_put_contents($apiDir . '/db_config.php', $configContent);

        // Include db.php to trigger self-healing schema creation
        require_once $apiDir . '/db.php';
        getDB();

        $message = "تم الاتصال بقاعدة البيانات وبناء كافة الجداول بنجاح 100%! يمكنك الآن فتح النظام مباشرة.";
    } catch (Exception $e) {
        $error = "فشل الاتصال بقاعدة البيانات: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>معالج تثبيت نظام كنيسة مارمينا | STMINA Web Installer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Cairo', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        <div class="text-center space-y-2">
            <div class="h-16 w-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto text-3xl font-extrabold border border-blue-500/30">
                ⛪
            </div>
            <h1 class="text-2xl font-black text-white">تثبيت نظام كنيسة مارمينا</h1>
            <p class="text-xs text-slate-400">معالج الإعداد التلقائي لقاعدة بيانات MySQL والاستضافة (cPanel / Server)</p>
        </div>

        <?php if ($message): ?>
            <div class="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs leading-relaxed space-y-3">
                <p class="font-bold"><?= htmlspecialchars($message) ?></p>
                <a href="./" class="block text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow">
                    الدخول إلى النظام الآن 🚀
                </a>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="p-4 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-bold leading-relaxed">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <?php if (!$message): ?>
            <form method="POST" class="space-y-4 text-xs">
                <div class="space-y-1">
                    <label class="font-bold text-slate-300">خادم قاعدة البيانات (DB Host)</label>
                    <input type="text" name="db_host" value="localhost" required class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-white font-mono" dir="ltr">
                </div>

                <div class="space-y-1">
                    <label class="font-bold text-slate-300">اسم قاعدة البيانات (Database Name)</label>
                    <input type="text" name="db_name" value="stmina_ssms" required class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-white font-mono" dir="ltr">
                </div>

                <div class="space-y-1">
                    <label class="font-bold text-slate-300">اسم مستخدم قاعدة البيانات (DB User)</label>
                    <input type="text" name="db_user" value="root" required class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-white font-mono" dir="ltr">
                </div>

                <div class="space-y-1">
                    <label class="font-bold text-slate-300">كلمة مرور قاعدة البيانات (DB Password)</label>
                    <input type="password" name="db_pass" placeholder="اتركه فارغاً إذا لم تكن هناك كلمة مرور" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 text-white font-mono" dir="ltr">
                </div>

                <button type="submit" class="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                    <span>حفظ الإعدادات وبناء قاعدة البيانات تلقائياً 💾</span>
                </button>
            </form>
        <?php endif; ?>

        <div class="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            كنيسة الشهيد العظيم مارمينا • نظام الإدارة المتكامل الشامل
        </div>

    </div>
</body>
</html>
