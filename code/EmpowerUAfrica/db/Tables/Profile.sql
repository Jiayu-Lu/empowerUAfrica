CREATE TABLE IF NOT EXISTS `Profile` (
    `username` VARCHAR(31) NOT NULL UNIQUE,
    `name` VARCHAR(255) DEFAULT '',
    `gender` INT DEFAULT 0,
    `birthdate` DATE DEFAULT '1970-01-01',
    `phone_number` VARCHAR(31) DEFAULT '',
    `industry` VARCHAR(255) DEFAULT '',
    `pfp_type` INT DEFAULT 0,
    `description` TEXT,
    `website` VARCHAR(255) DEFAULT '',
    PRIMARY KEY(`username`),
    FOREIGN KEY (`username`) REFERENCES `Accounts` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;