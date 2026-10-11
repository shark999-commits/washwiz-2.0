<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = readRequestBody();

if ($method === 'GET') {
    $customerId = isset($_GET['customer_id']) ? (int) $_GET['customer_id'] : null;

    if ($customerId) {
        $stmt = $pdo->prepare('SELECT * FROM wash_presets WHERE customer_id = :customer_id OR customer_id IS NULL ORDER BY id DESC');
        $stmt->execute(['customer_id' => $customerId]);
        jsonResponse('success', 'Presets retrieved', $stmt->fetchAll());
        exit;
    }

    $stmt = $pdo->query('SELECT * FROM wash_presets ORDER BY id DESC');
    jsonResponse('success', 'Presets retrieved', $stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $customerId = isset($data['customer_id']) ? (int) $data['customer_id'] : null;
    $name = trim((string) ($data['name'] ?? ''));
    $category = trim((string) ($data['category'] ?? ''));
    $cycle = trim((string) ($data['cycle'] ?? ''));
    $temperature = trim((string) ($data['temperature'] ?? ''));
    $spinSpeed = trim((string) ($data['spin_speed'] ?? ''));
    $detergent = trim((string) ($data['detergent'] ?? ''));
    $softener = trim((string) ($data['softener'] ?? ''));
    $addons = $data['addons'] ?? [];
    $notes = trim((string) ($data['notes'] ?? ''));
    $pricePerKg = (float) ($data['price_per_kg'] ?? 0);

    if ($name === '' || $category === '' || $cycle === '' || $temperature === '' || $spinSpeed === '') {
        jsonResponse('error', 'Preset name, category, cycle, temperature, and spin speed are required', null, 400);
        exit;
    }

    if ($pricePerKg < 0) {
        jsonResponse('error', 'Price per kg cannot be negative', null, 400);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO wash_presets (customer_id, name, category, cycle, temperature, spin_speed, detergent, softener, addons, notes, price_per_kg) VALUES (:customer_id, :name, :category, :cycle, :temperature, :spin_speed, :detergent, :softener, :addons, :notes, :price_per_kg)');
    $stmt->execute([
        'customer_id' => $customerId,
        'name' => $name,
        'category' => $category,
        'cycle' => $cycle,
        'temperature' => $temperature,
        'spin_speed' => $spinSpeed,
        'detergent' => $detergent,
        'softener' => $softener,
        'addons' => json_encode($addons),
        'notes' => $notes,
        'price_per_kg' => $pricePerKg,
    ]);

    jsonResponse('success', 'Preset created', ['id' => $pdo->lastInsertId()], 201);
    exit;
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Preset ID is required', null, 400);
        exit;
    }

    $customerId = isset($data['customer_id']) ? (int) $data['customer_id'] : null;
    $name = trim((string) ($data['name'] ?? ''));
    $category = trim((string) ($data['category'] ?? ''));
    $cycle = trim((string) ($data['cycle'] ?? ''));
    $temperature = trim((string) ($data['temperature'] ?? ''));
    $spinSpeed = trim((string) ($data['spin_speed'] ?? ''));
    $detergent = trim((string) ($data['detergent'] ?? ''));
    $softener = trim((string) ($data['softener'] ?? ''));
    $addons = $data['addons'] ?? [];
    $notes = trim((string) ($data['notes'] ?? ''));
    $pricePerKg = (float) ($data['price_per_kg'] ?? 0);

    if ($name === '' || $category === '' || $cycle === '' || $temperature === '' || $spinSpeed === '') {
        jsonResponse('error', 'Preset name, category, cycle, temperature, and spin speed are required', null, 400);
        exit;
    }

    if ($pricePerKg < 0) {
        jsonResponse('error', 'Price per kg cannot be negative', null, 400);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE wash_presets SET customer_id = :customer_id, name = :name, category = :category, cycle = :cycle, temperature = :temperature, spin_speed = :spin_speed, detergent = :detergent, softener = :softener, addons = :addons, notes = :notes, price_per_kg = :price_per_kg WHERE id = :id');
    $stmt->execute([
        'customer_id' => $customerId,
        'name' => $name,
        'category' => $category,
        'cycle' => $cycle,
        'temperature' => $temperature,
        'spin_speed' => $spinSpeed,
        'detergent' => $detergent,
        'softener' => $softener,
        'addons' => json_encode($addons),
        'notes' => $notes,
        'price_per_kg' => $pricePerKg,
        'id' => $id,
    ]);

    jsonResponse('success', 'Preset updated', null, 200);
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Preset ID is required', null, 400);
        exit;
    }

    try {
        $pdo->prepare('DELETE FROM wash_presets WHERE id = :id')->execute(['id' => $id]);
        jsonResponse('success', 'Preset deleted', null, 200);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            jsonResponse('error', 'This preset is used by existing orders and cannot be deleted.', null, 409);
        } else {
            throw $e;
        }
    }
    exit;
}

jsonResponse('error', 'Invalid request', null, 405);
