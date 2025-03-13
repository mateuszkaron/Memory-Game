<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "memory";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$boardSizes = ["3x4", "4x4", "4x5", "6x6"];
$topScores = [];

foreach ($boardSizes as $size) {
    $sql = "SELECT username, score, moves FROM scores WHERE board_size = '$size' ORDER BY score DESC, moves ASC LIMIT 3";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $scores = [];
        while ($row = $result->fetch_assoc()) {
            $scores[] = $row;
        }
        $topScores[] = ["board_size" => $size, "scores" => $scores];
    }
}

echo json_encode($topScores);

$conn->close();
?>
