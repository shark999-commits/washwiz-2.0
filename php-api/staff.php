<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = readRequestBody();

if ($method === 'GET') {
    $sql = 'SELECT id, name, staff_id, email, role, created_at FROM staff ORDER BY id DESC';
    $stmt = $pdo->query($sql);
    jsonResponse('success', 'Staff retrieved', $stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $action = $data['action'] ?? 'login';

    if ($action === 'login') {
        $identifier = trim((string) ($data['identifier'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($identifier === '' || $password === '') {
            jsonResponse('error', 'Staff identifier and password are required', null, 400);
            exit;
        }

        $sql = 'SELECT * FROM staff WHERE staff_id = :identifier OR email = :identifier LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['identifier' => $identifier]);
        $staff = $stmt->fetch();

        if (!$staff || !password_verify($password, $staff['password_hash'])) {
            jsonResponse('error', 'Invalid staff credentials', null, 401);
            exit;
        }

        unset($staff['password_hash']);
        jsonResponse('success', 'Staff login successful', ['staff' => $staff]);
        exit;
    }

    $name = trim($data['name'] ?? '');
    $staffId = trim($data['staff_id'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';

    if ($name === '' || $staffId === '' || $email === '' || $password === '') {
        jsonResponse('error', 'All staff fields are required', null, 400);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO staff (name, staff_id, email, password_hash) VALUES (:name, :staff_id, :email, :password_hash)');
    $stmt->execute([
        'name' => $name,
        'staff_id' => $staffId,
        'email' => $email,
        'password_hash' => $hash,
    ]);

    jsonResponse('success', 'Staff member created', null, 201);
    exit;
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Staff ID is required', null, 400);
        exit;
    }

    $name = trim($data['name'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $sql = 'UPDATE staff SET name = :name, email = :email';
    $params = ['id' => $id, 'name' => $name, 'email' => $email];

    if (!empty($data['password'])) {
        $sql .= ', password_hash = :password_hash';
        $params['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    $sql .= ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    jsonResponse('success', 'Staff updated', null, 200);
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Staff ID is required', null, 400);
        exit;
    }

    $pdo->prepare('DELETE FROM staff WHERE id = :id')->execute(['id' => $id]);
    jsonResponse('success', 'Staff deleted', null, 200);
    exit;
}

jsonResponse('error', 'Invalid request', null, 405);
