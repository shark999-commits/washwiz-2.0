<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

set_exception_handler(function (Throwable $e) {
    jsonResponse('error', $e->getMessage(), null, 500);
    exit;
});

$host = 'localhost';
$db = 'washwhiz';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host={$host};dbname={$db};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage(),
    ]);
    exit;
}

function jsonResponse($status, $message, $data = null, $httpCode = 200)
{
    http_response_code($httpCode);
    $payload = [
        'success' => $status === 'success',
        'status' => $status,
        'message' => $message,
    ];

    if ($data !== null) {
        $payload['data'] = $data;
    }

    echo json_encode($payload);
}

function readRequestBody()
{
    $input = file_get_contents('php://input');
    return $input !== false && $input !== '' ? json_decode($input, true) : [];
}

function requireAuth($pdo)
{
    if (!isset($_SERVER['HTTP_AUTHORIZATION']) || empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return null;
    }

    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    $stmt = $pdo->prepare('SELECT * FROM customers WHERE id = :id');
    $stmt->execute(['id' => $token]);
    return $stmt->fetch();
}
