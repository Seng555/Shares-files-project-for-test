-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 64.176.83.177
-- Generation Time: May 24, 2024 at 09:00 AM
-- Server version: 8.0.36-0ubuntu0.22.04.1
-- PHP Version: 7.4.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sbaidev`
--

-- --------------------------------------------------------

--
-- Table structure for table `Files`
--

CREATE TABLE `Files` (
  `_id` int NOT NULL,
  `folder_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `path` varchar(200) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

--
-- Dumping data for table `Files`
--

INSERT INTO `Files` (`_id`, `folder_id`, `name`, `path`, `created_by`, `created_date`) VALUES
(30, 10, 'file1', 'folder1', 1, '2024-05-24 00:04:11'),
(31, 10, 'file from u3', 'folder1', 3, '2024-05-24 03:46:26'),
(32, 10, 'file1U3', 'folder1', 4, '2024-05-24 00:04:11'),
(33, 10, 'file1U2', 'folder1', 2, '2024-05-24 00:04:11'),
(34, 11, 'file1', 'folder1', 1, '2024-05-24 00:04:11');

-- --------------------------------------------------------

--
-- Table structure for table `Folders`
--

CREATE TABLE `Folders` (
  `_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `path` varchar(200) DEFAULT NULL,
  `parent_key` int DEFAULT NULL,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

--
-- Dumping data for table `Folders`
--

INSERT INTO `Folders` (`_id`, `name`, `path`, `parent_key`, `created_by`) VALUES
(10, 'folder1', 'folder1', NULL, 1),
(11, 'sub1', 'folder1/sub1', 10, 1),
(12, 'sub2', 'folder1/sub2', 10, 1),
(13, 'Folderforu3', 'Folderforu3', NULL, 1),
(14, 'FolderU3', 'FolderU3', NULL, 3);

-- --------------------------------------------------------

--
-- Table structure for table `Shares`
--

CREATE TABLE `Shares` (
  `_id` int NOT NULL,
  `data_id` int NOT NULL,
  `type` int NOT NULL,
  `created_by` int NOT NULL,
  `receive_id` int NOT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` int NOT NULL
) ;

--
-- Dumping data for table `Shares`
--

INSERT INTO `Shares` (`_id`, `data_id`, `type`, `created_by`, `receive_id`, `created_date`, `update_date`, `role`) VALUES
(3, 10, 0, 1, 3, '2024-05-24 06:06:08', '2024-05-24 04:15:28', 0),
(6, 14, 0, 3, 1, '2024-05-24 06:52:38', '2024-05-24 06:52:38', 0),
(8, 10, 0, 1, 2, '2024-05-24 07:08:10', '2024-05-24 07:08:10', 0),
(12, 30, 1, 1, 2, '2024-05-24 07:12:02', '2024-05-24 07:12:06', 1),
(16, 10, 0, 3, 2, '2024-05-24 11:24:08', '2024-05-24 11:24:08', 1),
(17, 10, 0, 3, 4, '2024-05-24 06:06:08', '2024-05-24 04:33:55', 1);

--
-- Triggers `Shares`
--
DELIMITER $$
CREATE TRIGGER `check_data_id_files` BEFORE UPDATE ON `Shares` FOR EACH ROW BEGIN
    IF NEW.type = 0 THEN
        IF NOT EXISTS (SELECT 1 FROM Folders WHERE _id = NEW.data_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid data_id for Folders';
        END IF;
    ELSEIF NEW.type = 1 THEN
        IF NOT EXISTS (SELECT 1 FROM Files WHERE _id = NEW.data_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid data_id for Files';
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `_id` int NOT NULL,
  `name` varchar(30) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`_id`, `name`, `email`) VALUES
(1, 'seng', 'eeyang5@gmail.com'),
(2, 'seng', 'eeyang51@gmail.com'),
(3, 'user2', 'user2@gmail.com'),
(4, 'user3', 'user3@gmail.com'),
(5, 'test', 'eeyang635r64@gmail.com');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Files`
--
ALTER TABLE `Files`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `folder_id` (`folder_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `Folders`
--
ALTER TABLE `Folders`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `parent_key` (`parent_key`);

--
-- Indexes for table `Shares`
--
ALTER TABLE `Shares`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `fk_receive_id` (`receive_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Files`
--
ALTER TABLE `Files`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `Folders`
--
ALTER TABLE `Folders`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `Shares`
--
ALTER TABLE `Shares`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Files`
--
ALTER TABLE `Files`
  ADD CONSTRAINT `Files_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `Folders` (`_id`),
  ADD CONSTRAINT `Files_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `Users` (`_id`);

--
-- Constraints for table `Folders`
--
ALTER TABLE `Folders`
  ADD CONSTRAINT `Folders_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `Users` (`_id`),
  ADD CONSTRAINT `Folders_ibfk_2` FOREIGN KEY (`parent_key`) REFERENCES `Folders` (`_id`);

--
-- Constraints for table `Shares`
--
ALTER TABLE `Shares`
  ADD CONSTRAINT `fk_receive_id` FOREIGN KEY (`receive_id`) REFERENCES `Users` (`_id`),
  ADD CONSTRAINT `Shares_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `Users` (`_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
