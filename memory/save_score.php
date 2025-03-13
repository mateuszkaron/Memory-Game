<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Ustawienia do debugowania
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Dane testowe
file_put_contents("debug.log", json_encode($_POST) . "\n", FILE_APPEND);

// Sprawdzenie typu żądania
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['username'], $data['score'], $data['moves'], $data['boardSize'])) {
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "memory";

        $conn = new mysqli($servername, $username, $password, $dbname);

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $username = $conn->real_escape_string($data['username']);
        $score = (int)$data['score'];
        $moves = (int)$data['moves'];
        $boardSize = $conn->real_escape_string($data['boardSize']);

        $sql = "INSERT INTO scores (username, score, moves, board_size) VALUES ('$username', $score, $moves, '$boardSize')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Score saved successfully!"]);
        } else {
            echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
        }

        $conn->close();
    } else {
        echo json_encode(["error" => "Invalid input"]);
    }
    exit;
}
?>
