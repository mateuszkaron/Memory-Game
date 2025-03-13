CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL,
    score INT NOT NULL,
    moves INT NOT NULL,
    board_size VARCHAR(10) NOT NULL,
);
