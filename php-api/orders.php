<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = readRequestBody();

if ($method === 'GET') {
    $customerId = isset($_GET['customer_id']) ? (int) $_GET['customer_id'] : null;

    if ($customerId) {
        $stmt = $pdo->prepare('SELECT o.*, c.name AS customer_name, c.phone, COALESCE(p.name, o.preset_name) AS preset_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN wash_presets p ON p.id = o.preset_id WHERE o.customer_id = :customer_id ORDER BY o.id DESC');
        $stmt->execute(['customer_id' => $customerId]);
        $orders = $stmt->fetchAll();
        foreach ($orders as &$order) {
            $historyStmt = $pdo->prepare('SELECT * FROM order_stage_history WHERE order_id = :order_id ORDER BY id ASC');
            $historyStmt->execute(['order_id' => $order['id']]);
            $order['stage_history'] = $historyStmt->fetchAll();
        }
        jsonResponse('success', 'Orders retrieved', $orders);
        exit;
    }

    $stmt = $pdo->query('SELECT o.*, c.name AS customer_name, c.phone, COALESCE(p.name, o.preset_name) AS preset_name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id LEFT JOIN wash_presets p ON p.id = o.preset_id ORDER BY o.id DESC');
    $orders = $stmt->fetchAll();
    foreach ($orders as &$order) {
        $historyStmt = $pdo->prepare('SELECT * FROM order_stage_history WHERE order_id = :order_id ORDER BY id ASC');
        $historyStmt->execute(['order_id' => $order['id']]);
        $order['stage_history'] = $historyStmt->fetchAll();
    }
    jsonResponse('success', 'Orders retrieved', $orders);
    exit;
}

if ($method === 'POST') {
    $customerId = isset($data['customer_id']) ? (int) $data['customer_id'] : 0;
    $staffId = isset($data['staff_id']) ? (int) $data['staff_id'] : null;
    $serviceType = trim((string) ($data['service_type'] ?? ''));
    $presetId = isset($data['preset_id']) ? (int) $data['preset_id'] : null;
    $presetName = trim((string) ($data['preset_name'] ?? ''));
    $weightKg = (float) ($data['weight_kg'] ?? 0);
    $itemsCount = (int) ($data['items_count'] ?? 0);
    $specialInstructions = trim((string) ($data['special_instructions'] ?? ''));
    $status = trim((string) ($data['status'] ?? 'received'));
    $totalAmount = (float) ($data['total_amount'] ?? 0);
    $estimatedReadyAt = $data['estimated_ready_at'] ?? null;

    if ($customerId <= 0 || $serviceType === '' || $presetName === '') {
        jsonResponse('error', 'Customer, service type, and preset are required', null, 400);
        exit;
    }

    if ($weightKg <= 0) {
        jsonResponse('error', 'Weight must be greater than 0', null, 400);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO orders (customer_id, staff_id, service_type, preset_id, preset_name, weight_kg, items_count, special_instructions, status, total_amount, estimated_ready_at) VALUES (:customer_id, :staff_id, :service_type, :preset_id, :preset_name, :weight_kg, :items_count, :special_instructions, :status, :total_amount, :estimated_ready_at)');
    $stmt->execute([
        'customer_id' => $customerId,
        'staff_id' => $staffId,
        'service_type' => $serviceType,
        'preset_id' => $presetId,
        'preset_name' => $presetName,
        'weight_kg' => $weightKg,
        'items_count' => $itemsCount,
        'special_instructions' => $specialInstructions,
        'status' => $status,
        'total_amount' => $totalAmount,
        'estimated_ready_at' => $estimatedReadyAt,
    ]);

    $orderId = $pdo->lastInsertId();
    $historyStmt = $pdo->prepare('INSERT INTO order_stage_history (order_id, stage, note) VALUES (:order_id, :stage, :note)');
    $historyStmt->execute([
        'order_id' => $orderId,
        'stage' => 'received',
        'note' => 'Order received and queued for processing',
    ]);

    jsonResponse('success', 'Order created', ['id' => $orderId], 201);
    exit;
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Order ID is required', null, 400);
        exit;
    }

    $status = trim((string) ($data['status'] ?? ''));
    $note = trim((string) ($data['note'] ?? 'Order status updated'));

    if ($status === '') {
        jsonResponse('error', 'Order status is required', null, 400);
        exit;
    }

    $validStatuses = ['received', 'sorting', 'washing', 'drying', 'folding', 'ready for pickup', 'completed'];
    if (!in_array($status, $validStatuses)) {
        jsonResponse('error', 'Invalid order status', null, 400);
        exit;
    }

    $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id')->execute(['status' => $status, 'id' => $id]);
    $pdo->prepare('INSERT INTO order_stage_history (order_id, stage, note) VALUES (:order_id, :stage, :note)')->execute([
        'order_id' => $id,
        'stage' => $status,
        'note' => $note,
    ]);

    jsonResponse('success', 'Order updated', null, 200);
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Order ID is required', null, 400);
        exit;
    }

    $pdo->prepare('DELETE FROM orders WHERE id = :id')->execute(['id' => $id]);
    jsonResponse('success', 'Order deleted', null, 200);
    exit;
}

jsonResponse('error', 'Invalid request', null, 405);
