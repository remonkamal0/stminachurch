-- ====================================================================
-- STMINA CHURCH MANAGEMENT SYSTEM - COMPLETE SQL DATABASE DUMP
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, cPanel, phpMyAdmin
-- ====================================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for `stages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stages` (
  `id` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stage_name` (`name_ar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `stages` (`id`, `name_ar`, `sort_order`) VALUES
('stg_1', 'حضانة', 1),
('stg_2', 'ابتدائي', 2),
('stg_3', 'إعدادي', 3),
('stg_4', 'ثانوي', 4),
('stg_5', 'جامعيين وخريجين', 5),
('stg_6', 'إعداد خدام', 6),
('stg_7', 'خدمة الكشافة والمرشدات', 7),
('stg_8', 'خدمة الكورال والترانيم', 8),
('stg_9', 'خدمة أخوة الرب', 9),
('stg_10', 'خدمة المسنين والمرضى', 10),
('stg_11', 'خدمة الصم وضعاف السمع', 11),
('stg_12', 'خدمة المغتربين', 12),
('stg_13', 'لجنة النظام والاستقبال', 13),
('stg_14', 'خدمة وسائل الإيضاح والميديا', 14)
ON DUPLICATE KEY UPDATE `name_ar`=VALUES(`name_ar`);

-- --------------------------------------------------------
-- Table structure for `grades`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `grades` (
  `id` varchar(50) NOT NULL,
  `stage_name` varchar(255) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stage_grade` (`stage_name`,`name_ar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `grades` (`id`, `stage_name`, `name_ar`, `sort_order`) VALUES
('grd_1', 'ابتدائي', 'الصف الأول الابتدائي', 1),
('grd_2', 'ابتدائي', 'الصف الثاني الابتدائي', 2),
('grd_3', 'ابتدائي', 'الصف الثالث الابتدائي', 3),
('grd_4', 'ابتدائي', 'الصف الرابع الابتدائي', 4),
('grd_5', 'ابتدائي', 'الصف الخامس الابتدائي', 5),
('grd_6', 'ابتدائي', 'الصف السادس الابتدائي', 6)
ON DUPLICATE KEY UPDATE `name_ar`=VALUES(`name_ar`);

-- --------------------------------------------------------
-- Table structure for `classes`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `stage_name` varchar(255) NOT NULL,
  `grade_name` varchar(255) DEFAULT 'الصف الأول',
  `gender` enum('بنين','بنات','مشترك') DEFAULT 'مشترك',
  `patron_saint` varchar(255) DEFAULT NULL,
  `room_number` varchar(100) DEFAULT 'قاعة الخدمات',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `priests`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `priests` (
  `id` varchar(50) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `church_name` varchar(255) DEFAULT 'كنيسة الشهيد العظيم مارمينا',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_priest_name` (`name_ar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `priests` (`id`, `name_ar`, `phone`, `church_name`) VALUES
('pr_1', 'القمص تادرس يعقوب ملطي', '01221111111', 'كنيسة الشهيد مارجرجس سبورتنج'),
('pr_2', 'القمص بيشوي كامل', '01222222222', 'كنيسة الشهيد مارجرجس سبورتنج'),
('pr_3', 'أبونا تادرس', '01233333333', 'كنيسة الشهيد مارمينا'),
('pr_4', 'أبونا بيشوي', '01244444444', 'كنيسة الشهيد مارمينا'),
('pr_5', 'أبونا يوحنا', '01255555555', 'كنيسة الشهيد مارمينا')
ON DUPLICATE KEY UPDATE `phone`=VALUES(`phone`);

-- --------------------------------------------------------
-- Table structure for `role_permissions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_key` varchar(50) NOT NULL,
  `permissions_json` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `servants`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `servants` (
  `id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `deacon_rank` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `confession_father` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'servant',
  `role_label` varchar(100) DEFAULT 'خادم فصل',
  `stage_name` varchar(255) DEFAULT 'عام',
  `class_name` varchar(255) DEFAULT 'عام',
  `service_assignments` text DEFAULT NULL,
  `is_also_student` tinyint(1) DEFAULT 0,
  `student_stage_name` varchar(255) DEFAULT NULL,
  `student_class_name` varchar(255) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `street_address` text DEFAULT NULL,
  `area_zone` varchar(255) DEFAULT NULL,
  `gps_location` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_servant_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `servants` (`id`, `full_name`, `username`, `email`, `password`, `role`, `role_label`, `stage_name`, `class_name`, `is_active`) VALUES
('srv_admin', 'أمين عام الخدمة (مسؤول النظام)', 'admin', 'admin@church.org', '$2y$10$wN9Qj6q2yYk3k9o8O7f.teu2u6q7q8o9O0p1q2r3s4t5u6v7w8x9y', 'service_admin', 'أمين عام الخدمة', 'عام', 'كل الفصول', 1)
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- --------------------------------------------------------
-- Table structure for `students`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `gender` enum('بنين','بنات') NOT NULL,
  `deacon_rank` varchar(100) DEFAULT 'none',
  `birth_date` date NOT NULL,
  `school` varchar(255) DEFAULT NULL,
  `class_name` varchar(255) NOT NULL,
  `class_id` varchar(50) DEFAULT NULL,
  `stage_name` varchar(255) NOT NULL,
  `phone_student` varchar(50) DEFAULT NULL,
  `phone_father` varchar(50) DEFAULT NULL,
  `father_job` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `phone_mother` varchar(50) DEFAULT NULL,
  `mother_job` varchar(255) DEFAULT NULL,
  `area_zone` varchar(255) DEFAULT NULL,
  `street_address` text DEFAULT NULL,
  `gps_location` text DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `confession_father_name` varchar(255) DEFAULT NULL,
  `confession_last_date` date DEFAULT NULL,
  `talents` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `health_notes` text DEFAULT NULL,
  `total_points` int(11) DEFAULT 0,
  `is_servant` tinyint(1) DEFAULT 0,
  `servant_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `attendance`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` varchar(50) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','excused') NOT NULL,
  `service_type` varchar(100) DEFAULT 'مدارس الأحد',
  `points_earned` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attendance` (`student_id`,`date`,`service_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `followups`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `followups` (
  `id` varchar(50) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `servant_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `type` enum('call','visit','social_media','church_meeting') NOT NULL,
  `status` enum('completed','no_answer','postponed','needs_father_visit') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
