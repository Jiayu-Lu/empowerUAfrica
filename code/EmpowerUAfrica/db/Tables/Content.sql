CREATE TABLE IF NOT EXISTS `Content` (
    `id` INT NOT NULL UNIQUE,
    `username` VARCHAR(31) NOT NULL UNIQUE,
    `media` TEXT,
    `content` TEXT,
    `timestamp` datetime NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY (`username`) REFERENCES `Accounts` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;