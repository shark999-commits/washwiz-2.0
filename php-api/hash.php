<?php
// TEMPORARY PASSWORD RESET SCRIPT
// EDIT $newPassword BELOW, then visit http://localhost/washwiz/php-api/hash.php
// DELETE THIS FILE IMMEDIATELY AFTER RUNNING

$newPassword = 'admin123';

// Block non-localhost requests
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '';
$allowedIps = ['127.0.0.1', '::1'];

if (!in_array($clientIp, $allowedIps, true)) {
    http_response_code(403);
    die('Access denied. This script can only be run from localhost.');
}

header('Content-Type: text/plain');

try {
    // Use the same database connection as db.php
    $host = 'localhost';
    $db = 'washwhiz';
    $user = 'root';
    $pass = '';

    $pdo = new PDO("mysql:host={$host};dbname={$db};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "=== WashWhiz Admin Password Reset ===\n\n";

    // Generate hash
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    echo "New password hash generated.\n";
    echo "Hash length: " . strlen($hash) . " bytes\n\n";

    // Update the admin account
    $stmt = $pdo->prepare('UPDATE staff SET password_hash = ? WHERE email = ?');
    $stmt->execute([$hash, 'admin@washwhiz.com']);
    $rowsUpdated = $stmt->rowCount();

    echo "Rows updated: $rowsUpdated\n";

    if ($rowsUpdated > 0) {
        // Verify by re-fetching and testing
        $verifyStmt = $pdo->prepare('SELECT password_hash FROM staff WHERE email = ?');
        $verifyStmt->execute(['admin@washwhiz.com']);
        $row = $verifyStmt->fetch();

        if ($row && password_verify($newPassword, $row['password_hash'])) {
            echo "Verification: PASS\n\n";
            echo "Admin password reset successful.\n";
            echo "Login email: admin@washwhiz.com\n";
            echo "Login password: (as set in hash.php at line 6)\n\n";
        } else {
            echo "Verification: FAIL\n";
            echo "Password verification failed. The hash may not be valid.\n";
        }
    } else {
        echo "No rows updated. The admin account may not exist.\n";
    }

    echo "\n*** DELETE hash.php NOW ***\n";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
