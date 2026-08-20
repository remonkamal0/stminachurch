<?php
require_once __DIR__ . '/db.php';
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM finance_transactions ORDER BY tx_date DESC");
    $txs = $stmt->fetchAll();
    
    $income = (float)$db->query("SELECT COALESCE(SUM(amount), 0) FROM finance_transactions WHERE type = 'income'")->fetchColumn();
    $expense = (float)$db->query("SELECT COALESCE(SUM(amount), 0) FROM finance_transactions WHERE type = 'expense'")->fetchColumn();
    $balance = $income - $expense;

    sendResponse([
        'balance' => $balance,
        'total_income' => $income,
        'total_expense' => $expense,
        'transactions' => $txs
    ]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $id = 'fn_' . uniqid();
    $stmt = $db->prepare("INSERT INTO finance_transactions (id, type, category, amount, description, recorded_by, tx_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $input['type'] ?? 'income',
        $input['category'] ?? 'تبرعات واشتراكات',
        $input['amount'] ?? 0,
        $input['description'] ?? '',
        $input['recorded_by'] ?? 'أمين الصندوق',
        $input['tx_date'] ?? date('Y-m-d')
    ]);
    sendResponse(['success' => true, 'id' => $id, 'message' => 'تم تسجيل المعاملة المالية في الخزينة']);
}
