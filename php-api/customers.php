<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$data = readRequestBody();

if ($method === 'GET') {
    $sql = 'SELECT id, name, phone, email, created_at FROM customers ORDER BY id DESC';
    $stmt = $pdo->query($sql);
    $customers = $stmt->fetchAll();
    jsonResponse('success', 'Customers retrieved', $customers);
    exit;
}

if ($method === 'POST') {
    $action = $data['action'] ?? 'register';

    if ($action === 'register') {
        $name = trim($data['name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if ($name === '' || $phone === '' || $email === '' || $password === '') {
            jsonResponse('error', 'All fields are required', null, 400);
            exit;
        }

        $existing = $pdo->prepare('SELECT id FROM customers WHERE email = :email LIMIT 1');
        $existing->execute(['email' => $email]);

        if ($existing->fetch()) {
            jsonResponse('error', 'Email already registered', null, 409);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO customers (name, phone, email, password_hash) VALUES (:name, :phone, :email, :password_hash)');
        $stmt->execute([
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'password_hash' => $hash,
        ]);

        $customerId = $pdo->lastInsertId();
        $customer = $pdo->prepare('SELECT id, name, phone, email, created_at FROM customers WHERE id = :id');
        $customer->execute(['id' => $customerId]);

        jsonResponse('success', 'Customer registered successfully', [
            'customer' => $customer->fetch(),
        ]);
        exit;
    }

    if ($action === 'login') {
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if ($email === '' || $password === '') {
            jsonResponse('error', 'Email and password are required', null, 400);
            exit;
        }

        $stmt = $pdo->prepare('SELECT * FROM customers WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $customer = $stmt->fetch();

        if (!$customer || !password_verify($password, $customer['password_hash'])) {
            jsonResponse('error', 'Invalid email or password', null, 401);
            exit;
        }

        unset($customer['password_hash']);
        jsonResponse('success', 'Customer login successful', [
            'customer' => $customer,
        ]);
        exit;
    }
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Customer ID is required', null, 400);
        exit;
    }

    $name = trim($data['name'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));

    if ($name === '' || $phone === '' || $email === '') {
        jsonResponse('error', 'Name, phone, and email are required', null, 400);
        exit;
    }

    if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) {
        jsonResponse('error', 'Please enter a valid email address', null, 400);
        exit;
    }

    $existingCustomer = $pdo->prepare('SELECT id, password_hash FROM customers WHERE id = :id LIMIT 1');
    $existingCustomer->execute(['id' => $id]);
    $currentCustomer = $existingCustomer->fetch();

    if (!$currentCustomer) {
        jsonResponse('error', 'Customer not found', null, 404);
        exit;
    }

    $duplicate = $pdo->prepare('SELECT id FROM customers WHERE email = :email AND id != :id LIMIT 1');
    $duplicate->execute(['email' => $email, 'id' => $id]);

    if ($duplicate->fetch()) {
        jsonResponse('error', 'Email is already in use by another customer', null, 409);
        exit;
    }

    $sql = 'UPDATE customers SET name = :name, phone = :phone, email = :email';
    $params = ['id' => $id, 'name' => $name, 'phone' => $phone, 'email' => $email];

    if (array_key_exists('password', $data) || array_key_exists('current_password', $data)) {
        $newPassword = isset($data['password']) ? (string) $data['password'] : '';
        $currentPassword = isset($data['current_password']) ? (string) $data['current_password'] : '';

        if (strlen($newPassword) < 8) {
            jsonResponse('error', 'New password must be at least 8 characters long', null, 400);
            exit;
        }

        if (!password_verify($currentPassword, $currentCustomer['password_hash'])) {
            jsonResponse('error', 'Current password is incorrect', null, 401);
            exit;
        }

        $sql .= ', password_hash = :password_hash';
        $params['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
    }

    $sql .= ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $updated = $pdo->prepare('SELECT id, name, phone, email, created_at FROM customers WHERE id = :id LIMIT 1');
    $updated->execute(['id' => $id]);
    $customer = $updated->fetch();

    jsonResponse('success', 'Profile updated', ['customer' => $customer]);
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        jsonResponse('error', 'Customer ID is required', null, 400);
        exit;
    }

    $pdo->prepare('DELETE FROM customers WHERE id = :id')->execute(['id' => $id]);
    jsonResponse('success', 'Customer deleted', null, 200);
    exit;
}

jsonResponse('error', 'Invalid request', null, 405);
