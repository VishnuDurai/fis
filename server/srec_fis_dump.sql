-- MySQL dump 10.13  Distrib 9.7.1, for macos26.4 (arm64)
--
-- Host: localhost    Database: srec_fis
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '18e345ee-8c32-11f1-bd86-323b9022fa80:1-5030';

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `staff_id` varchar(255) NOT NULL,
  `password` longtext,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES ('admin','admin123'),('NT2785','$2a$10$ltwveMvgz46dpsjaS864FuWBSMJF/AX2qMygH1IpjjpWcT/yUeW2C'),('TE2751','TE2751');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_dep`
--

DROP TABLE IF EXISTS `admin_dep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_dep` (
  `staff_id` varchar(255) NOT NULL,
  `Department` longtext,
  `password` longtext,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_dep`
--

LOCK TABLES `admin_dep` WRITE;
/*!40000 ALTER TABLE `admin_dep` DISABLE KEYS */;
INSERT INTO `admin_dep` VALUES ('TE2250','Information Technology','$2a$10$0pseqyEcYpHhwXsiomZl1OxwYDAM.5pfrmSNCeoToUvtVOYbzujHi'),('TE2273','Artificial Intelligence and Data Science','$2a$10$2wU5No0.iEWVnUUqrlACYObP0XPhKJYJiU7z/0T6ptgvHh/BdkqDW');
/*!40000 ALTER TABLE `admin_dep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appraisal_template`
--

DROP TABLE IF EXISTS `appraisal_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appraisal_template` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section_code` longtext,
  `section_title` longtext,
  `criteria_code` longtext,
  `criteria_title` longtext,
  `rubric_description` longtext,
  `mapping_type` longtext,
  `max_marks` double DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `updated_at` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appraisal_template`
--

LOCK TABLES `appraisal_template` WRITE;
/*!40000 ALTER TABLE `appraisal_template` DISABLE KEYS */;
INSERT INTO `appraisal_template` VALUES (1,'PART_A','PART A: Teaching Learning Process','A1','Use of Innovative ICT Tools','5 marks per innovative ICT tool integrated in course delivery','manual',10,1,'2026-07-29 06:21:32'),(2,'PART_A','PART A: Teaching Learning Process','A2','E-Content Development','5 marks per e-content / video lecture launched on YouTube/LMS','manual',10,2,'2026-07-29 06:21:32'),(3,'PART_A','PART A: Teaching Learning Process','A3','Development of New Experiments / Labs','5 marks per new lab experiment or virtual lab manual developed','manual',10,3,'2026-07-29 06:21:32'),(4,'PART_A','PART A: Teaching Learning Process','A4','Student Feedback Rating','5 marks for >=4.0 rating, 3 marks for 2.5-3.9 rating','manual',10,4,'2026-07-29 06:21:32'),(5,'PART_A','PART A: Teaching Learning Process','A5','End Semester Course Pass Percentage','10 marks for >=80% pass rate, 5 marks for 60-79% pass rate','manual',10,5,'2026-07-29 06:21:32'),(6,'PART_A','PART A: Teaching Learning Process','A6','Value Added Courses / Industry Workshops Organized','5 marks per value added course or industry workshop delivered','manual',5,6,'2026-07-29 06:21:32'),(7,'PART_A','PART A: Teaching Learning Process','A7','Mentoring Students in Hackathons & Competitions','5 marks for winning/finalist mentoring in national hackathons','manual',5,7,'2026-07-29 06:21:32'),(8,'PART_B','PART B: Professional Development Activities','B1','Professional Society Memberships','Automatic mapping: 2.5 marks per active professional society membership','auto',5,8,'2026-07-29 06:21:32'),(9,'PART_B','PART B: Professional Development Activities','B2','Resource Speaker / Session Chair','Automatic mapping: 5 marks per invited talk / resource person role','auto',10,9,'2026-07-29 06:21:32'),(10,'PART_B','PART B: Professional Development Activities','B3','External Academic / Professional Interactions','Automatic mapping: 2.5 marks per external interaction detail','auto',5,10,'2026-07-29 06:21:32'),(11,'PART_B','PART B: Professional Development Activities','B4','Professional Development Programs / FDPs / NPTEL','Automatic mapping: 5 marks per FDP / NPTEL certification completed','auto',10,11,'2026-07-29 06:21:32'),(12,'PART_B','PART B: Professional Development Activities','B5','Professional Certifications Earned','Automatic mapping: 2.5 marks per professional certification earned','auto',5,12,'2026-07-29 06:21:32'),(13,'PART_B','PART B: Professional Development Activities','B6','Industrial Training / Internship Completed','5 marks per industrial training or corporate fellowship completed','manual',5,13,'2026-07-29 06:21:32'),(14,'PART_C','PART C: Research & Consultancy','C1','Research Publications in Indexed Journals','Automatic mapping: 10 marks per Scopus/WoS publication, 5 per UGC','auto',20,14,'2026-07-29 06:21:32'),(15,'PART_C','PART C: Research & Consultancy','C2','Books & Book Chapters Published','Automatic mapping: 5 marks per book or book chapter published','auto',10,15,'2026-07-29 06:21:32'),(16,'PART_C','PART C: Research & Consultancy','C3','Research Proposals Submitted / Grants Sanctioned','Automatic mapping: 5 marks per proposal, 10 per sanctioned grant','auto',15,16,'2026-07-29 06:21:32'),(17,'PART_C','PART C: Research & Consultancy','C4','Patents & IPR Filed / Granted','Automatic mapping: 5 marks per patent filed, 10 per patent granted','auto',10,17,'2026-07-29 06:21:32'),(18,'PART_C','PART C: Research & Consultancy','C5','Seed Money & Internal Research Grants','Automatic mapping: 5 marks per internal seed money grant received','auto',5,18,'2026-07-29 06:21:32'),(19,'PART_D','PART D: Institutional Development & Contribution','D1','Departmental & Institutional Assigned Responsibilities','Automatic mapping: 5 marks per assigned institutional responsibility','auto',20,19,'2026-07-29 06:21:32'),(20,'PART_D','PART D: Institutional Development & Contribution','D2','Student Mentoring & Counseling Contributions','5 marks for active student counseling and mentee performance tracking','manual',10,20,'2026-07-29 06:21:32'),(21,'PART_D','PART D: Institutional Development & Contribution','D3','Contribution to NBA / NAAC / Autonomous Accreditations','5 marks for active module coordination in accreditations','manual',10,21,'2026-07-29 06:21:32');
/*!40000 ALTER TABLE `appraisal_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` longtext,
  `faculty_incharge_id` longtext,
  `created_at` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clubs`
--

LOCK TABLES `clubs` WRITE;
/*!40000 ALTER TABLE `clubs` DISABLE KEYS */;
INSERT INTO `clubs` VALUES (1,'CySIGMA','TE2440','2026-07-27 08:47:53'),(2,'English Literary Society','TE2347','2026-07-27 08:47:53'),(3,'Fine Arts Club','TE1102','2026-07-27 08:47:53'),(4,'Foss Club','TE2746','2026-07-27 08:47:53'),(5,'Code Catalyst Club','TE2815','2026-07-27 08:47:53'),(6,'Phoraratz Club','TE0014','2026-07-27 08:47:53'),(7,'Quiz Club','TE1308','2026-07-27 08:47:53'),(8,'Reading Movement Club','TE0039','2026-07-27 08:47:53'),(9,'Tamil Mandram Club','TE2862','2026-07-27 08:47:53'),(10,'Uyir Club','TE2457','2026-07-27 08:47:53'),(11,'Yi YUVA Club','TE0168','2026-07-27 08:47:53'),(12,'NCC','TE1151','2026-07-27 08:47:53'),(13,'Renewable Energy Club','TE2821','2026-07-27 08:47:53'),(14,'SDG Club','TE0337','2026-07-27 08:47:53');
/*!40000 ALTER TABLE `clubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` longtext,
  `acronym` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=333 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Information Technology','IT'),(2,'Mechanical Engineering','MECH'),(3,'Civil Engineering','CIVIL'),(6,'Electrical & Electronics Engineering','EEE'),(7,'Computer Science & Engineering','CSE'),(9,'Biomedical Engineering','BME'),(10,'English','ENG'),(12,'Maths','MATHS'),(13,'Physics','PHY'),(14,'Chemistry','CHEM'),(15,'Electronics and Instrumentation Engineering','EIE'),(16,'Robotics and Automation Engineering','R & A'),(17,'Artificial Intelligence and Data Science','AI & DS'),(18,'Master of Business Administration','MBA'),(19,'Aeronautical Engineering','AERO'),(20,'M.Tech Computer Science and Engineering','M.Tech CSE'),(21,'Placement Cell','Placement Cell'),(22,'Admin','ADMIN'),(24,'English (Tamil Discipline)','ENG (Tamil Discipline)'),(26,'Science and Humanities','G.E - S&H'),(35,'Electronics and Communication Engineering','ECE'),(40,'Physical Education','PHY EDU'),(308,'Office','off');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `designations`
--

DROP TABLE IF EXISTS `designations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` longtext,
  `sort_order` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `designations`
--

LOCK TABLES `designations` WRITE;
/*!40000 ALTER TABLE `designations` DISABLE KEYS */;
INSERT INTO `designations` VALUES (1,'Principal',1),(2,'Vice Principal',2),(3,'Prof & HOD',3),(4,'Prof & Dean -Administration',4),(5,'Prof & Dean-Academics',5),(6,'Prof - HEAD (I Year Programme)',6),(7,'Prof of Practice',8),(8,'Professor',7),(9,'Associate Professor',9),(10,'Assistant Professor (Sr.G)',11),(11,'Assistant Professor (Sel.G)',10),(12,'Assistant Professor',12),(13,'Placement Officer',13),(14,'Librarian',14),(15,'Asst Librarian',15),(16,'Physical Director',16),(17,'Assistant Physical Directress',17),(18,'Trainer',18),(20,'HR',19);
/*!40000 ALTER TABLE `designations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_page_data`
--

DROP TABLE IF EXISTS `dynamic_page_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dynamic_page_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_id` int NOT NULL,
  `staff_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `staff_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci,
  `file` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_page_data`
--

LOCK TABLES `dynamic_page_data` WRITE;
/*!40000 ALTER TABLE `dynamic_page_data` DISABLE KEYS */;
INSERT INTO `dynamic_page_data` VALUES (1,1,'admin','System Administrator','General','{\"f1\":\"Rural Digital Literacy Workshop\",\"f2\":\"NSS SREC\",\"f3\":\"150\",\"f4\":\"2026-07-25\"}',NULL,'2026-07-30 22:04:47');
/*!40000 ALTER TABLE `dynamic_page_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dynamic_pages`
--

DROP TABLE IF EXISTS `dynamic_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dynamic_pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'standalone',
  `portals` text COLLATE utf8mb4_unicode_ci,
  `fields` longtext COLLATE utf8mb4_unicode_ci,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'FileText',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_pages`
--

LOCK TABLES `dynamic_pages` WRITE;
/*!40000 ALTER TABLE `dynamic_pages` DISABLE KEYS */;
INSERT INTO `dynamic_pages` VALUES (1,'Extension & Outreach Activities','extension-outreach','activity','[\"admin\",\"dept_admin\",\"faculty\"]','[{\"id\":\"f1\",\"label\":\"Activity Title\",\"type\":\"text\",\"required\":true},{\"id\":\"f2\",\"label\":\"Organizing Body\",\"type\":\"text\",\"required\":true},{\"id\":\"f3\",\"label\":\"Beneficiaries Count\",\"type\":\"number\",\"required\":false},{\"id\":\"f4\",\"label\":\"Event Date\",\"type\":\"date\",\"required\":true}]','Award','2026-07-30 22:04:29');
/*!40000 ALTER TABLE `dynamic_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professional`
--

DROP TABLE IF EXISTS `professional`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professional` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pro_name` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professional`
--

LOCK TABLES `professional` WRITE;
/*!40000 ALTER TABLE `professional` DISABLE KEYS */;
INSERT INTO `professional` VALUES (1,'CSI (Computer Society of India)'),(2,'IEEE'),(3,'ACM'),(4,'ISTE (Indian Society for Technical Education)'),(5,'IETE');
/*!40000 ALTER TABLE `professional` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_aadhar`
--

DROP TABLE IF EXISTS `staff_aadhar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_aadhar` (
  `staff_id` varchar(255) NOT NULL,
  `staff_name` longtext,
  `path1` longtext,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_aadhar`
--

LOCK TABLES `staff_aadhar` WRITE;
/*!40000 ALTER TABLE `staff_aadhar` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_aadhar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_academics`
--

DROP TABLE IF EXISTS `staff_academics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_academics` (
  `staff_id` varchar(255) NOT NULL,
  `staff_name` longtext,
  `Date_of_joining` longtext,
  `Department` longtext,
  `Designation` longtext,
  `Qualification` longtext,
  `prev_exp_academic_years` int DEFAULT NULL,
  `prev_exp_academic_months` int DEFAULT NULL,
  `prev_exp_industry_years` int DEFAULT NULL,
  `prev_exp_industry_months` int DEFAULT NULL,
  `total_prev_exp_years` int DEFAULT NULL,
  `total_prev_exp_months` int DEFAULT NULL,
  `has_no_prev_exp` int DEFAULT NULL,
  `exp_srec_years` int DEFAULT NULL,
  `exp_srec_months` int DEFAULT NULL,
  `total_exp_years` int DEFAULT NULL,
  `total_exp_months` int DEFAULT NULL,
  `orcid_id` varchar(100) DEFAULT NULL,
  `scholar_id` varchar(100) DEFAULT NULL,
  `scopus_id` varchar(100) DEFAULT NULL,
  `wos_id` varchar(100) DEFAULT NULL,
  `h_index` int DEFAULT '0',
  `i10_index` int DEFAULT '0',
  `total_citations` int DEFAULT '0',
  `last_citation_sync` datetime DEFAULT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_academics`
--

LOCK TABLES `staff_academics` WRITE;
/*!40000 ALTER TABLE `staff_academics` DISABLE KEYS */;
INSERT INTO `staff_academics` VALUES ('NT2785','Mr. A. VIVEK',NULL,'Office','HR','',0,0,0,0,0,0,1,0,0,0,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0005','','2020-06-01','Information Technology','Associate Professor','Ph.D.',0,0,0,0,0,0,0,0,0,0,0,'','','','',0,0,0,NULL),('TE0006','','','Information Technology','Professor & HOD','',0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0011','Dr.M.RM.KRISHNAPPA','04-09-2000','PHY','Associate Professor',NULL,4,1,0,0,4,1,0,25,10,29,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0014','Dr.M.CHITRA','18-08-2008','PHY','Associate Professor',NULL,1,1,0,0,1,1,0,17,11,19,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0015','Dr.R.VASANTHAPRIYA','18-08-2008','PHY','Assistant Professor (Sel.G)',NULL,0,4,0,0,0,4,0,17,11,18,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0019','Dr.J.SHEEJA','24-08-2007','CHEM','Assistant Professor (Sel.G)',NULL,1,8,0,0,1,8,0,18,11,20,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0028','Dr.R.SANTHI','02-06-2000','MATHS','Associate Professor',NULL,1,3,0,0,1,3,0,26,1,27,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0029','Dr.R.KASTHURI','24-08-2007','MATHS','Associate Professor',NULL,2,3,0,0,2,3,0,18,11,21,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0030','Dr.S.RANGANAYAKI','24-08-2007','MATHS','Associate Professor',NULL,3,2,0,0,3,2,0,18,11,22,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0031','Dr.P.VASANTHI','24-08-2007','MATHS','Associate Professor',NULL,4,9,0,0,4,9,0,18,11,23,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0032','Mr.Y.J.GANESH','03-06-2008','MATHS','Assistant Professor (Sel.G)',NULL,2,9,0,0,2,9,0,18,1,20,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0035','Mr.P.JAYAPRAKASH','04-08-2008','MATHS','Assistant Professor (Sel.G)',NULL,0,11,0,0,0,11,0,17,11,18,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0039','Dr.P.SUGANYA','17-06-2009','ENG','Assistant Professor (Sel.G)',NULL,1,9,0,0,1,9,0,17,1,18,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0041','Dr.K.SUKKIRAMATHI','12-06-2009','MATHS','Assistant Professor (Sel.G)',NULL,1,0,0,0,1,0,0,17,1,18,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0044','Dr.D.NARMATHA','12-06-2009','MATHS','Assistant Professor (Sel.G)',NULL,0,5,0,0,0,5,0,17,1,17,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0045','Dr.D.INDHUMATHY','09-07-2009','MATHS','Assistant Professor (Sel.G)',NULL,0,9,0,0,0,9,0,17,0,17,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0102','Dr.E.SAROJINI','07-07-2000','CIVIL','Prof & HOD',NULL,0,10,0,0,0,10,0,26,0,26,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0120','Dr.N.SRIMATH','28-06-2002','MECH','Professor',NULL,2,7,0,0,2,7,0,24,0,26,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0125','Mr.M.S BALA SANTHOSH','24-12-2008','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,17,7,17,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0128','Dr.P.KARUPPUSWAMY','18-06-1997','MECH','Prof & HOD',NULL,0,0,1,4,1,4,0,29,1,30,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0129','Dr.C.BHAGYANATHAN','08-12-2008','MECH','Professor',NULL,0,0,2,3,2,3,0,17,7,19,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0168','Dr.C.J.THOMAS RENALD','03-01-2008','AERO','Professor',NULL,1,4,0,7,1,11,0,18,6,20,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0235','Dr.S.ALLIRANI','15-11-2006','EEE','Prof & HOD',NULL,10,2,0,6,10,8,0,19,8,30,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0236','Dr.R.SHANMUGASUNDARAM','01-06-2004','EIE','Prof & HOD',NULL,4,7,0,6,5,1,0,22,1,27,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0237','Dr.K.SEBASTHI RANI','04-06-2008','EEE','Associate Professor',NULL,2,10,0,0,2,10,0,18,1,20,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0240','Mr.V.GOPU','09-07-2007','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,6,0,6,0,19,0,19,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0244','Dr.P.SEBASTIAN  VINDRO JUDE','03-07-2006','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,20,0,20,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0245','Dr.K.BALAMURUGAN','02-07-2007','EEE','Associate Professor',NULL,0,0,0,0,0,0,1,19,0,19,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0337','Dr.G.GOPU','11-06-1997','ECE','Professor',NULL,0,0,0,6,0,6,0,29,1,29,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0340','Dr.B.SHARMILA','31-08-2007','EIE','Professor',NULL,2,0,0,4,2,4,0,18,10,21,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0341','Dr.V.RUKKUMANI','03-11-2005','EIE','Associate Professor',NULL,0,0,0,0,0,0,1,20,8,20,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0343','Dr.D.DEVASENA','04-07-2007','EIE','Associate Professor',NULL,0,0,0,0,0,0,1,19,0,19,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0347','Dr.V.RADHIKA','19-01-2009','BME','Associate Professor',NULL,2,6,0,0,2,6,0,17,6,20,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0390','Dr.M.JAGADEESWARI','03-02-1999','ECE','Prof & HOD',NULL,5,0,0,0,5,0,0,27,5,32,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0393','Dr.N.SATHISH KUMAR','02-12-1998','BME','Prof & HOD',NULL,0,0,0,0,0,0,1,27,7,27,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0396','Dr.S.P.VIMAL','16-10-2006','ECE','Associate Professor',NULL,2,8,0,0,2,8,0,19,9,22,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0397','Dr.B.R.SATHISHKUMAR','04-07-2005','ECE','Associate Professor',NULL,3,0,0,0,3,0,0,21,0,24,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0398','Dr.B.NATARAJ','01-02-2006','ECE','Associate Professor',NULL,1,5,0,0,1,5,0,20,5,21,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0450','Dr.A.GRACE SELVARANI','03-06-2002','M.Tech CSE','Prof & HOD',NULL,2,9,0,0,2,9,0,24,1,26,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0451','Dr.M.S.GEETHA DEVASENA','16-10-1997','CSE','Prof & HOD',NULL,0,0,0,0,0,0,1,28,9,28,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0452','Dr.B.MATHIVANAN','15-12-1999','CSE','Associate Professor',NULL,1,11,0,0,1,11,0,26,7,28,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0453','Dr.P.PERUMAL','11-05-1999','CSE','Professor',NULL,0,11,0,0,0,11,0,27,2,28,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0455','Dr.R.MADHUMATHI','13-04-2005','CSE','Associate Professor',NULL,2,8,0,0,2,8,0,21,3,23,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0456','Dr.R.KINGSY GRACE','01-06-2005','AI & DS','Professor',NULL,0,0,0,0,0,0,1,21,1,21,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0458','Dr.R.VIJAYAKUMAR','20-08-2007','M.Tech CSE','Associate Professor',NULL,0,0,0,0,0,0,1,18,11,18,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0462','Mr.S.SURESH KUMAR','02-07-2008','CSE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,18,0,18,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0501','Dr.J.SELVAKUMAR','09-06-2008','M.Tech CSE','Professor',NULL,5,6,0,0,5,6,0,18,1,23,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0504','Dr.V.KARPAGAM','15-07-1998','AI & DS','Prof & HOD',NULL,0,0,0,0,0,0,1,28,0,28,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0505','Dr.M.KALAIARASU','28-08-2000','IT','Professor',NULL,0,0,0,0,0,0,1,25,10,25,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0506','Dr.J.ANITHA','01-06-2002','AI & DS','Professor',NULL,0,0,0,9,0,9,0,24,1,24,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0511','Mrs.P.V.KAVITHA','16-06-2008','AI & DS','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,18,1,18,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0556','Dr.N.SURESH KUMAR','03-11-2005','AI & DS','Associate Professor',NULL,2,6,0,0,2,6,0,20,8,23,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE0755','Dr.S.NITHYANANDAN','24-04-2006','PHY EDU','Physical Director',NULL,1,5,0,0,1,5,0,20,3,21,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1102','Mrs.R.K.RAGAVAPRIYA','17-06-2009','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,17,1,17,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1151','Lt.Dr.M.RAMESH','17-06-2009','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,17,1,17,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1155','Dr.A. MURUGARAJAN','27-11-2000','R & A','Prof & HOD',NULL,0,0,0,0,0,0,1,25,8,25,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1157','Dr.R.SUDHAKAR','01-12-2009','R & A','Associate Professor',NULL,0,8,0,0,0,8,0,16,7,17,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1158','Dr.M.S.SURESHKUMAR','01-12-2009','R & A','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,16,7,16,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1162','Dr.K.DEEPA','01-06-2002','IT','Professor',NULL,1,0,0,9,1,9,0,24,1,25,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1163','Mr.R.PRABHU','05-02-2010','LIB','Asst Librarian',NULL,0,0,2,5,2,5,0,16,5,18,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1196','Dr.C.S.MANIKANDA BABU','02-06-2010','ECE','Associate Professor',NULL,5,7,1,5,7,0,0,16,1,23,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1203','Dr.S.BHAGGIARAJ','19-06-2009','IT','Associate Professor',NULL,1,11,0,0,1,11,0,17,1,19,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1204','Dr.J.ANGEL IDA CHELLAM','22-06-2009','IT','Associate Professor',NULL,0,0,0,0,0,0,1,17,1,17,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1206','Dr.N.SARANYA','17-07-2009','IT','Associate Professor',NULL,0,0,0,0,0,0,1,17,0,17,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1211','Dr.K.R.PRABHA','02-06-2010','ECE','Associate Professor',NULL,2,7,0,0,2,7,0,16,1,18,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1226','Mrs.S.EZHILIN FREEDA','14-06-2010','CSE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,16,1,16,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1232','Dr.B.BRAILSON MANSINGH','01-07-2010','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,16,0,16,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1237','Dr.S.KRISHNAPRABHA','01-07-2010','MBA','Associate Professor',NULL,5,3,0,6,5,9,0,16,0,21,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1241','Dr.M.KASISELVANATHAN','07-07-2010','ECE','Associate Professor',NULL,0,0,0,0,0,0,1,16,0,16,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1251','Dr.R.ANURADHA','11-06-2009','M.Tech CSE','Professor',NULL,3,3,0,8,3,11,0,17,1,21,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1271','Ms.A.SAGAYARANI','17-09-2010','MBA','Assistant Professor (Sel.G)',NULL,0,0,0,7,0,7,0,15,10,16,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1280','Dr.M.EZHILARASI','06-10-2010','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,9,15,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1292','Dr.V.SRINIVASAN','26-11-2010','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,8,15,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1297','Dr.S.SATHISH','06-12-2010','MECH','Assistant Professor (Sel.G)',NULL,0,6,0,0,0,6,0,15,7,16,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1301','Dr.R.RAJESH KUMAR','12-06-2009','MBA','Assistant Professor (Sel.G)',NULL,1,10,0,0,1,10,0,17,1,18,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1308','Dr.K. SAVITHA','05-01-2011','ENG','Assistant Professor (Sel.G)',NULL,1,9,0,0,1,9,0,15,6,17,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1312','Mr.R.CHANDRU','21-01-2011','ECE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,6,15,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1313','Dr.R.KRISHNAKUMAR','24-01-2011','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,6,15,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1402','Dr.Y.DHARSHAN','03-06-2011','EIE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,1,15,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1404','Dr.N.R.KARTHIK','06-06-2011','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,1,15,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1412','Mr.R.SIVAKUMAR','08-06-2011','AERO','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,15,1,15,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1419','Mrs.Y.ADLINE JANCY','16-06-2011','ECE','Assistant Professor (Sel.G)',NULL,2,9,0,0,2,9,0,15,1,17,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1424','Dr.M.CHINDAMANI','27-06-2011','EEE','Assistant Professor (Sel.G)',NULL,5,9,0,0,5,9,0,15,1,20,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1432','Mrs.S.S.SUGANTHA MALLIKA','25-07-2011','IT','Assistant Professor (Sel.G)',NULL,0,11,0,0,0,11,0,15,0,15,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1454','Mr.V.KRISHNA KUMAR','19-08-2011','CSE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,11,14,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1456','Dr.S.DEIVANAYAKI','24-08-2011','PHY','Associate Professor',NULL,8,7,0,0,8,7,0,14,11,23,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1461','Mr.C.DINESH','02-09-2011','AERO','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,10,14,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1463','Dr.S.LAKSHMI NARAYANAN','08-09-2011','ECE','Associate Professor',NULL,5,6,0,0,5,6,0,14,10,20,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE1554','Dr.L.DHIVIYALAKSHMI','15-07-2009','BME','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,17,0,17,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2013','Dr.P.MAHESWARI NAIK','07-06-2012','MATHS','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,1,14,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2015','Mrs.G.LAVANYA','07-06-2012','BME','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,1,14,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2027','Dr.M.ABIRAMI','07-06-2012','CHEM','Associate Professor',NULL,4,1,0,0,4,1,0,14,1,18,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2028','Dr.R.MARY METILDA','07-06-2012','MBA','Prof & HOD',NULL,10,8,1,6,12,2,0,14,1,26,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2031','Dr.B.MARIAPPAN','18-06-2012','ENG','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,1,14,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2038','Dr.K.VIMALA DEVI','22-06-2012','LIB','Librarian',NULL,0,0,0,0,0,0,1,14,1,14,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2053','Dr.G.RATHI','16-07-2012','CSE','Assistant Professor (Sel.G)',NULL,6,1,0,0,6,1,0,14,0,20,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2062','Dr.S.OMPRAKASAM','18-07-2012','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,0,14,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2108','Mrs.S.JANSI RANI','31-12-2012','IT','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,13,6,13,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2111','Dr.T.R.SATHISHKUMAR','18-01-2013','MECH','Assistant Professor (Sel.G)',NULL,8,4,0,0,8,4,0,13,6,21,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2125','Dr.P.MATHIYALAGAN','20-05-2013','CSE','Professor',NULL,8,0,0,0,8,0,0,13,2,21,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2132','Dr.T.ANITHA','03-06-2013','EIE','Assistant Professor (Sel.G)',NULL,0,11,0,0,0,11,0,13,1,14,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2139','Mr.R.MOHAN KUMAR','03-06-2013','EEE','Assistant Professor (Sel.G)',NULL,4,10,0,0,4,10,0,13,1,17,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2142','Mrs.P.SUGANTHA PRIYADHARSHINI','03-06-2013','CSE','Assistant Professor (Sel.G)',NULL,2,11,0,0,2,11,0,13,1,16,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2143','Mrs.C.PADMAVATHY','03-06-2013','CSE','Assistant Professor (Sel.G)',NULL,11,9,0,0,11,9,0,13,1,24,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2153','Dr.A.VADIVEL','06-06-2013','MECH','Assistant Professor (Sel.G)',NULL,3,0,0,4,3,4,0,13,1,16,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2193','Dr.R.RAVEEN','19-03-2014','MECH','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,12,4,12,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2201','Dr.J.YOGANANDH','02-06-2014','MECH','Associate Professor',NULL,2,7,0,0,2,7,0,12,1,14,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2213','Mrs.A.SHANMUGAPRIYA','11-06-2014','CSE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,12,1,12,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2229','Dr.B.PRANESH','30-07-2014','MECH','Assistant Professor (Sel.G)',NULL,5,0,0,0,5,0,0,11,11,16,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2243','Mr.P.SIVAKUMAR','03-11-2014','AERO','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,8,11,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2250','Mr.G.NARENDRAN','15-12-2014','IT','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,7,11,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2264','Dr.T.VELMURUGAN','01-06-2015','MECH','Associate Professor',NULL,6,7,2,6,9,1,0,11,1,20,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2273','Mr.R.S.VISHNUDURAI','01-06-2015','AI & DS','Assistant Professor (Sel.G)','M.E. (Computer Science and Engineering)',0,0,0,0,0,0,1,11,1,11,1,'https://orcid.org/0000-0001-7736-0360','https://scholar.google.com/citations?user=6F9hPaQAAAAJ&hl=en','https://www.scopus.com/authid/detail.uri?authorId=57469675400','',2,1,18,'2026-08-05 07:19:41'),('TE2275','Dr.K.RAJESHWARAN','01-06-2015','ECE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,1,11,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2278','Mr.V.PARTHIBAN','01-06-2015','CIVIL','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,1,11,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2279','Mr.D.RAMAKRISHNAN','01-06-2015','CIVIL','Assistant Professor (Sel.G)',NULL,0,9,0,0,0,9,0,11,1,11,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2286','Mr.B.KAMAL','11-06-2015','CIVIL','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,1,11,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2289','Mr.R.VELMURUGAN','19-06-2015','AERO','Assistant Professor (Sel.G)',NULL,2,0,0,0,2,0,0,11,1,13,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2290','Mr.V.SIVA','22-06-2015','AERO','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,1,11,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2291','Mr.T.ASHOKKUMAR','26-06-2015','AERO','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,11,1,11,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2298','Mrs.R.R.RUBIA GANDHI','11-08-2015','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,10,11,10,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2313','Mr.B.SENTHILKUMAR','02-11-2015','MECH','Assistant Professor (Sel.G)',NULL,5,3,0,6,5,9,0,10,8,16,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2323','Ms.D.SUDHA','01-04-2016','PHY','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,10,3,10,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2346','Mr.K.ROBIN JOHNY','01-08-2016','AERO','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,9,11,9,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2347','Mrs.M.HAMSALATHA','01-12-2016','ENG','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,9,7,9,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2348','Dr.H.VIDHYA','01-12-2016','EEE','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,9,7,9,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2352','Dr.N.GUNASEKAR','02-01-2017','MECH','Associate Professor',NULL,9,4,2,0,11,4,0,9,6,20,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2356','Mr.R.MOHAN','01-03-2017','Placement Cell','Trainer',NULL,0,0,0,0,0,0,1,9,4,9,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2366','Dr.R.RAGHU','01-06-2017','MECH','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,9,1,9,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2367','Dr.P.CHANDRAMOHAN','01-06-2017','AERO','Prof & HOD',NULL,17,0,2,1,19,1,0,9,1,28,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2372','Mrs.E.SHANTHINI','01-06-2017','ECE','Assistant Professor (Sel.G)',NULL,3,10,6,8,10,6,0,9,1,19,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2375','Mrs.P.DIVYAPRABHA','01-12-2021','G.E - S&H','Assistant Professor',NULL,0,0,0,0,0,0,1,4,7,4,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2424','Dr.J.SURESH','18-01-2019','CHEM','Assistant Professor (Sr.G)',NULL,1,8,0,0,1,8,0,7,6,9,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2427','Mr.M.SELVAGANESH','21-01-2019','ECE','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,7,6,7,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2434','Dr.V.K.ARTHI','18-02-2019','MBA','Assistant Professor (Sel.G)',NULL,7,6,0,0,7,6,0,7,5,14,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2440','Mr.G.RAM SUNDAR','29-05-2019','IT','Assistant Professor (Sel.G)',NULL,7,2,0,0,7,2,0,7,1,14,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2444','Dr.S.HEMA','29-05-2019','CIVIL','Professor',NULL,10,3,0,0,10,3,0,7,1,17,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2445','Mrs.K.SARANYA','29-05-2019','CIVIL','Assistant Professor (Sr.G)',NULL,4,4,0,0,4,4,0,7,1,11,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2446','Dr.S.KANCHANA','29-05-2019','CIVIL','Associate Professor',NULL,8,5,2,1,10,6,0,7,1,17,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2455','Dr.B.KALAIMATHI','29-05-2019','ECE','Assistant Professor (Sr.G)',NULL,3,1,0,0,3,1,0,7,1,10,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2457','Dr.N.GOPALAKRISHNAN','03-06-2019','MATHS','Assistant Professor (Sr.G)',NULL,2,10,0,0,2,10,0,7,1,9,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2460','Mr.N.DHARMAVITHURAANJAN','01-03-2022','Placement Cell','Trainer',NULL,0,0,0,0,0,0,1,4,4,4,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2463','Mrs.N.DIVYA','08-07-2019','EEE','Assistant Professor (Sel.G)',NULL,10,0,0,0,10,0,0,7,0,17,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2475','Dr.DEEPA B.PRABHU','13-11-2019','BME','Associate Professor',NULL,1,1,4,4,5,5,0,6,8,12,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2482','Mr.S.SARVESWARAN','11-12-2019','R & A','Assistant Professor (Sel.G)',NULL,2,9,1,1,3,10,0,6,7,10,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2496','Mrs.S.RAJALAKSHMI','02-12-2020','CIVIL','Assistant Professor (Sr.G)',NULL,4,5,0,0,4,5,0,5,7,10,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2499','Ms.T.NITHYA SHREE','07-12-2020','CSE','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,5,7,5,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2500','Mrs.S.KAYALVIZHI','07-12-2020','EIE','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,5,7,5,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2508','Dr.V.THARANIDHARAN','04-01-2021','MATHS','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,5,6,5,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2509','Dr.S.SOWMIYA','04-01-2021','MATHS','Assistant Professor',NULL,0,0,0,0,0,0,1,5,6,5,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2513','Mr.T.RAJASEKAR','07-01-2021','ECE','Assistant Professor (Sr.G)',NULL,4,1,0,0,4,1,0,5,6,9,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2519','Ms.R.RAJALAKSHMI','15-02-2021','IT','Assistant Professor',NULL,0,0,0,0,0,0,1,5,5,5,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2520','Dr.M.LOGAPRAKASH','17-02-2021','AI & DS','Assistant Professor (Sel.G)',NULL,9,6,0,0,9,6,0,5,5,14,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2523','Ms.M.PREETHI','01-03-2021','IT','Assistant Professor (Sr.G)',NULL,0,6,0,0,0,6,0,5,4,5,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2533','Dr.N.INDUMATHI','19-07-2021','MATHS','Assistant Professor',NULL,0,0,0,0,0,0,1,5,0,5,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2535','Dr.K.DHANA SHREE','19-07-2021','M.Tech CSE','Assistant Professor (Sr.G)',NULL,2,10,0,0,2,10,0,5,0,7,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2536','Mrs.C.SOWNTHARYA','19-07-2021','CSE','Assistant Professor',NULL,1,0,0,0,1,0,0,5,0,6,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2537','Mrs.N.DHEERTHI','19-07-2021','R & A','Assistant Professor (Sel.G)',NULL,5,4,0,0,5,4,0,5,0,10,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2538','Dr.G.HEMALATHA','19-07-2021','R & A','Assistant Professor (Sel.G)',NULL,6,1,2,1,8,2,0,5,0,13,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2539','Dr.VICHITRA SIVAJI','19-07-2021','ENG','Prof & HOD',NULL,19,9,0,0,19,9,0,5,0,24,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2540','Ms.S.ALAMELU ALIAS RAJASREE','22-07-2021','ECE','Assistant Professor (Sr.G)',NULL,0,0,0,0,0,0,1,5,0,5,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2548','Dr.A.KISHORE KUMAR','24-11-2021','R & A','Associate Professor',NULL,15,8,0,9,16,5,0,4,8,21,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2561','Mrs.K.RANJEETHAPRIYA','21-02-2022','CSE','Assistant Professor (Sr.G)',NULL,4,4,0,0,4,4,0,4,5,8,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2571','Dr.J.JAYASHREE','11-04-2022','CIVIL','Assistant Professor (Sel.G)',NULL,10,9,0,0,10,9,0,4,3,15,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2579','Dr.A.LEGGINS','06-05-2022','PHY','Assistant Professor (Sr.G)',NULL,2,9,0,0,2,9,0,4,2,6,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2580','Mr.A.PENIEL WINIFRED RAJ','02-06-2022','R & A','Assistant Professor',NULL,0,0,0,0,0,0,1,4,1,4,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2582','Mr.C.MATHAN','10-06-2022','EIE','Assistant Professor (Sr.G)',NULL,9,11,0,0,9,11,0,4,1,14,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2583','Mrs.G.ANUSHA','13-06-2022','CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,4,1,4,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2585','Mr.B.SRIDHAR','15-06-2022','EEE','Assistant Professor (Sel.G)',NULL,10,0,0,0,10,0,0,4,1,14,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2586','Dr.R.KARTHIKAMANI','17-06-2022','ECE','Assistant Professor (Sel.G)',NULL,7,11,0,0,7,11,0,4,1,12,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2590','Dr.A.VIJAY','20-06-2022','ECE','Assistant Professor (Sr.G)',NULL,10,7,0,0,10,7,0,4,1,14,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2591','Mr.I.ARAVINDAGURU','20-06-2022','EIE','Assistant Professor (Sr.G)',NULL,3,11,0,0,3,11,0,4,1,8,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2596','Mrs.R.S.RAMYA','01-07-2022','M.Tech CSE','Assistant Professor (Sel.G)',NULL,8,8,0,0,8,8,0,4,0,12,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2597','Mr.B.MARISEKAR','04-07-2022','EEE','Assistant Professor (Sr.G)',NULL,7,0,0,0,7,0,0,4,0,11,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2599','Dr.M.JAISHREE','09-07-2022','ECE','Assistant Professor (Sel.G)',NULL,9,11,0,0,9,11,0,4,0,13,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2601','Mrs.T.THENMOZHI','11-07-2022','IT','Assistant Professor (Sr.G)',NULL,2,4,0,0,2,4,0,4,0,6,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2602','Mr.S.VIGNESHWARAN','11-07-2022','BME','Assistant Professor (Sel.G)',NULL,6,10,0,0,6,10,0,4,0,10,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2606','Mrs.R.KIRUBA','01-08-2022','EIE','Assistant Professor (Sr.G)',NULL,4,10,0,0,4,10,0,3,11,8,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2607','Mr.P.MOHANRAJ','03-08-2022','ECE','Assistant Professor (Sr.G)',NULL,6,2,0,0,6,2,0,3,11,10,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2608','Dr.R.SARANYA','03-08-2022','BME','Assistant Professor (Sel.G)',NULL,7,5,0,10,8,3,0,3,11,12,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2609','Mrs.J.M.PRIYADHARSHENI','10-08-2022','R & A','Assistant Professor (Sr.G)',NULL,6,7,0,0,6,7,0,3,11,10,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2611','Mrs.M.SHANTHINI','17-08-2022','CSE','Assistant Professor (Sel.G)',NULL,6,0,0,0,6,0,0,3,11,9,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2612','Dr.S.HARIGANESH','22-08-2022','CHEM','Assistant Professor',NULL,0,0,0,0,0,0,1,3,11,3,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2632','Mrs.C.KAVITHA','05-12-2022','AI & DS','Assistant Professor',NULL,0,0,0,0,0,0,1,3,7,3,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2636','Mr.K.VIJAYAKUMAR','14-12-2022','ECE','Assistant Professor (Sr.G)',NULL,2,4,0,0,2,4,0,3,7,5,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2641','Mrs.B.JASMINE PRIYADHARSHINI','04-01-2023','ECE','Assistant Professor (Sr.G)',NULL,3,5,0,0,3,5,0,3,6,6,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2643','Mrs.M.KOWSALYA','19-01-2023','ECE','Assistant Professor (Sel.G)',NULL,8,2,0,0,8,2,0,3,6,11,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2650','Mrs.R.RAMPRIYA','09-02-2023','AI & DS','Assistant Professor',NULL,0,0,0,0,0,0,1,3,5,3,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2653','Mrs.N.NANDHINE SHREE','16-02-2023','CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,3,5,3,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2655','Mr.P.BALAJI','20-02-2023','EIE','Assistant Professor (Sr.G)',NULL,6,11,0,0,6,11,0,3,5,10,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2658','Mrs.P.MONISHA','01-03-2023','M.Tech CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,3,4,3,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2660','Mrs.M.SARANYA','06-03-2023','EIE','Assistant Professor (Sr.G)',NULL,4,2,0,0,4,2,0,3,4,7,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2667','Dr.N.ALAGU SUNDARI','03-05-2023','M.Tech CSE','Assistant Professor (Sel.G)',NULL,5,5,5,7,11,0,0,3,2,14,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2676','Mrs.A.REETHIKA','05-05-2023','ECE','Assistant Professor (Sr.G)',NULL,3,4,0,0,3,4,0,3,2,6,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2677','Mrs.A.RASHEEDHA','05-05-2023','BME','Assistant Professor (Sr.G)',NULL,3,9,1,1,4,10,0,3,2,8,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2678','Mrs.A.MAHALAKSHMI','08-05-2023','M.Tech CSE','Assistant Professor (Sel.G)',NULL,11,0,0,0,11,0,0,3,2,14,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2684','Mr.S.JEEVANANDHAM','23-06-2023','IT','Assistant Professor (Sel.G)',NULL,8,8,0,0,8,8,0,3,1,11,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2687','Dr.B.KANIMOZHI','03-08-2023','MATHS','Assistant Professor',NULL,2,1,0,0,2,1,0,2,11,5,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2688','Dr.M.BLESSY DOE','07-08-2023','MBA','Assistant Professor (Sr.G)',NULL,4,0,0,0,4,0,0,2,11,6,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2691','Mrs.K.PRASHANTHINI','19-09-2023','R & A','Assistant Professor (Sr.G)',NULL,8,1,0,0,8,1,0,2,10,10,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2693','Mrs.M.PRINCY','19-09-2023','IT','Assistant Professor',NULL,3,11,0,0,3,11,0,2,10,6,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2694','Dr.M.KOKILAMANI','25-09-2023','MATHS','Assistant Professor (Sr.G)',NULL,6,9,0,0,6,9,0,2,10,9,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2704','Mrs.K.SONA','18-12-2023','CSE','Assistant Professor (Sr.G)',NULL,7,4,0,0,7,4,0,2,7,9,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2705','Dr.P.VISHNUVARDHAN','03-01-2024','BME','Assistant Professor (Sr.G)',NULL,7,11,0,6,8,5,0,2,6,10,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2707','Mrs.V.ANUPRIYA','03-01-2024','ECE','Assistant Professor (Sel.G)',NULL,6,10,1,0,7,10,0,2,6,10,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2710','Mrs.H.NISHANTHI','24-01-2024','M.Tech CSE','Assistant Professor',NULL,1,0,0,0,1,0,0,2,6,3,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2716','Mr.S.SIVARAJ','22-02-2024','IT','Assistant Professor',NULL,1,8,3,7,5,3,0,2,5,7,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2717','Mrs.J.JEBA PRATHICKA','26-02-2024','M.Tech CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,2,5,2,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2725','Ms.K.SINDHU','13-05-2024','IT','Assistant Professor',NULL,0,0,0,0,0,0,1,2,2,2,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2726','Ms.A.SELVA PRIYA','13-05-2024','IT','Assistant Professor',NULL,0,0,0,0,0,0,1,2,2,2,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2737','Mr.M.VELMURUGAN','14-06-2024','CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,2,1,2,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2738','Mrs.M.AMUTHASURABI','21-06-2024','CSE','Assistant Professor',NULL,2,4,1,0,3,4,0,2,1,5,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2740','Mr.R.HARI PRAKASH','01-07-2024','IT','Assistant Professor',NULL,0,0,0,0,0,0,1,2,0,2,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2745','Ms.A.ISHWARYA','02-07-2024','CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,2,0,2,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2746','Mr.N.MANOJ','02-07-2024','CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,2,0,2,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2751','Dr.A.SOUNDARRAJAN','10-07-2024','ADMIN','Principal',NULL,25,0,0,0,25,0,0,2,0,27,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2752','Mrs.V.MUTHULAKSHMI','12-07-2024','IT','Assistant Professor',NULL,1,1,0,0,1,1,0,2,0,3,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2755','Mrs.S.KANMANI','18-07-2024','IT','Assistant Professor',NULL,0,0,0,0,0,0,1,2,0,2,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2765','Dr.P.SANGEETHA','22-08-2024','MBA','Assistant Professor (Sel.G)',NULL,17,1,0,0,17,1,0,1,11,19,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2766','Mrs.M.NAUSATH BANU','23-08-2024','ECE','Assistant Professor',NULL,0,0,0,0,0,0,1,1,11,1,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2771','Mr.K.B.LINGKASH','04-10-2024','AI & DS','Assistant Professor',NULL,0,0,0,0,0,0,1,1,9,1,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2781','Mrs.V.GOMATHI SANKARI','05-12-2024','AI & DS','Assistant Professor',NULL,1,8,0,0,1,8,0,1,7,3,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2799','Dr.G.LENIN KUMAR','24-02-2025','MBA','Associate Professor',NULL,17,6,2,1,19,7,0,1,5,21,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2814','Mrs.A.KAYALVIZHI','02-06-2025','AI & DS','Assistant Professor (Sr.G)',NULL,6,4,0,0,6,4,0,1,1,7,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2815','Dr.V.SAVEETHA','02-06-2025','CSE','Assistant Professor (Sel.G)',NULL,15,6,1,5,16,11,0,1,1,18,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2816','Dr.N.SUSILA','02-06-2025','IT','Prof & HOD',NULL,22,8,0,0,22,8,0,1,1,23,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2817','Mrs.D.DEVIPRIYA','02-06-2025','AI & DS','Assistant Professor',NULL,1,6,0,0,1,6,0,1,1,2,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2821','Dr.K.BALACHANDER','05-06-2025','EEE','Assistant Professor (Sel.G)',NULL,18,8,0,6,19,2,0,1,1,20,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2822','Dr.R.SARAVANAN','05-06-2025','MBA','Assistant Professor (Sr.G)',NULL,14,8,0,0,14,8,0,1,1,15,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2823','Mrs.M.DIVYA','09-06-2025','AI & DS','Assistant Professor',NULL,0,0,0,0,0,0,1,1,1,1,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2825','Dr.A.MAHALAKSHMI','11-06-2025','BME','Assistant Professor',NULL,0,0,0,0,0,0,1,1,1,1,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2828','Dr.T.MANOJPRAPHAKAR','11-06-2025','CSE','Assistant Professor',NULL,3,4,0,0,3,4,0,1,1,4,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2829','Dr.A.SAKTHIVEL','11-06-2025','EEE','Prof - HEAD (I Year Programme)',NULL,23,1,5,1,28,2,0,1,1,29,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2830','Dr.SHILPA JOY','16-06-2025','BME','Assistant Professor (Sr.G)',NULL,9,7,0,0,9,7,0,1,1,10,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2834','Mr.GAURAB MUDBHARI','16-06-2025','CSE','Assistant Professor',NULL,0,0,0,0,0,0,1,1,1,1,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2841','Mrs.K.CHAMUNDESWARI','07-07-2025','BME','Assistant Professor',NULL,6,7,0,0,6,7,0,1,0,7,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2847','Dr.R.MALATHI','16-07-2025','CIVIL','Assistant Professor (Sr.G)',NULL,13,11,0,0,13,11,0,1,0,14,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2849','Ms.A.DEEPTHI','01-07-2025','Placement Cell','Trainer',NULL,0,0,0,0,0,0,1,1,0,1,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2850','Mr.R.SARAVANA KUAMR','01-07-2025','M.Tech CSE','Prof of Practice',NULL,0,0,30,0,30,0,0,1,0,31,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2853','Ms.R.DEEKSHA','04-08-2025','R & A','Assistant Professor',NULL,2,6,0,0,2,6,0,0,11,3,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2854','Ms.R.S.KARTHIKA SHIVAANI','04-08-2025','BME','Assistant Professor',NULL,0,0,0,0,0,0,1,0,11,0,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2855','Dr.D.VIVEK','04-08-2025','CIVIL','Assistant Professor (Sr.G)',NULL,9,2,0,0,9,2,0,0,11,10,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2857','Mrs.S.PRASEETHA','08-08-2025','ECE','Assistant Professor',NULL,6,5,0,0,6,5,0,0,11,7,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2861','Mrs.N.NITHYA','18-08-2025','ECE','Assistant Professor',NULL,0,0,0,0,0,0,1,0,11,0,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2862','Dr.S.SAKTHIVEL','18-08-2025','ENG (Tamil Discipline)','Assistant Professor',NULL,0,0,0,0,0,0,1,0,11,0,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2876','Dr.G.RANJITHAM','04-12-2025','R & A','Assistant Professor (Sel.G)',NULL,16,1,0,0,16,1,0,0,7,16,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2878','Mr.G.YOGESH','10-12-2025','Placement Cell','Trainer',NULL,2,5,0,0,2,5,0,0,7,3,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2879','Ms.A.ADLINA MARIA','10-12-2025','Placement Cell','Trainer',NULL,0,5,0,0,0,5,0,0,7,1,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2880','Ms.H.SOWMYA','15-12-2025','CSE','Assistant Professor',NULL,4,6,0,0,4,6,0,0,7,5,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2883','Mr.D.NANEE','SRCAS : 21-02-2022  SREC : 01-01-2026','MBA','Assistant Professor',NULL,3,10,1,9,5,7,0,0,0,5,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2884','Dr.P.DEVENDRAN','05-01-2026','R & A','Assistant Professor (Sel.G)',NULL,12,4,1,0,13,4,0,0,6,13,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2888','Dr.M.SELLADURAI','02-02-2026','CHEM','Assistant Professor',NULL,12,7,1,3,13,10,0,0,5,14,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2891','Mrs.B.KEERTHANA','02-03-2026','AI & DS','Assistant Professor',NULL,1,0,4,3,5,3,0,0,4,5,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2894','Dr.M.SIVAJI','02-03-2026','MATHS','Associate Professor',NULL,24,4,0,0,24,4,0,0,4,24,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2904','Mrs.K.MYTHILY','01-04-2026','PHY EDU','Assistant Physical Directress',NULL,7,7,0,0,7,7,0,0,3,7,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2906','Dr.N.GEETHA','06-04-2026','CSE','Associate Professor',NULL,16,5,0,0,16,5,0,0,3,16,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2911','Mrs.R.ASWATHA','04-05-2026','ECE','Assistant Professor',NULL,6,0,0,0,6,0,0,0,2,6,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2914','Dr.N.MOOKHAMBIKA','04-05-2026','M.Tech CSE','Assistant Professor (Sel.G)',NULL,14,3,1,0,15,3,0,0,2,15,5,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2915','Mrs.M.SWATHIKA','05-05-2026','CSE','Assistant Professor',NULL,0,0,1,6,1,6,0,0,2,1,8,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2916','Dr.S.JAYAPRIYA','18-05-2026','CHEM','Assistant Professor (Sr.G)',NULL,6,8,0,0,6,8,0,0,2,6,10,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2927','Dr.S.MOHANAVEL','02-06-2026','MBA','Professor',NULL,26,10,0,0,26,10,0,0,1,26,11,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2930','Dr.H.MANGALAM','04-06-2026','ECE','Prof & Dean -Administration',NULL,36,1,0,0,36,1,0,0,1,36,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2931','Dr.J.P.DEEBASREE','04-06-2026','PHY','Assistant Professor',NULL,3,5,7,0,10,5,0,0,1,10,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2932','Dr.S.JAYANTHY','01-06-2026','ECE','Prof & Dean-Academics',NULL,0,5,28,0,28,5,0,0,1,28,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2933','Mrs.S.U.NIVEDAA','10-06-2026','CSE','Assistant Professor',NULL,0,0,4,2,4,2,0,0,1,4,3,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2934','Dr.N.SARANYA','15-06-2026','CIVIL','Assistant Professor (Sel.G)',NULL,10,8,0,5,11,1,0,0,1,11,2,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2935','Dr.G.SATHIYASEELAN','15-06-2026','MECH','Assistant Professor',NULL,2,11,0,9,3,8,0,0,1,3,9,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2936','Mrs.R.PRADEEPA','17-06-2026','IT','Assistant Professor (Sel.G)',NULL,10,0,0,0,10,0,0,0,1,10,1,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2938','Dr.NITHYA CHRISTOPHER','01-07-2026','EEE','Assistant Professor (Sr.G)',NULL,5,0,1,0,6,0,0,0,0,6,0,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE2940','Dr.R.ANJALI','01-07-2026','CSE','Assistant Professor (Sr.G)',NULL,5,0,0,6,5,6,0,0,0,5,6,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE5006','Dr.C.JOANNA PAULINE','12-10-2011','ENG','Assistant Professor (Sel.G)',NULL,3,7,0,0,3,7,0,14,9,18,4,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE5014','Dr.S.RANGEETHA','01-12-2011','ECE','Assistant Professor (Sel.G)',NULL,4,0,0,0,4,0,0,14,7,18,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE5022','Dr.C.PRAVEENKUMAR','22-12-2011','EEE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,7,14,7,NULL,NULL,NULL,NULL,0,0,0,NULL),('TE5030','Dr.M.NAGARAJAPANDIAN','01-02-2012','EIE','Assistant Professor (Sel.G)',NULL,0,0,0,0,0,0,1,14,5,14,5,NULL,NULL,NULL,NULL,0,0,0,NULL);
/*!40000 ALTER TABLE `staff_academics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_appraisal`
--

DROP TABLE IF EXISTS `staff_appraisal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_appraisal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `academic_year` longtext,
  `courses_taught` longtext,
  `pass_percentage` longtext,
  `student_feedback` longtext,
  `innovative_methods` longtext,
  `publications_count` int DEFAULT NULL,
  `books_count` int DEFAULT NULL,
  `patents_count` int DEFAULT NULL,
  `grants_amount` longtext,
  `fdp_attended` longtext,
  `events_organized` longtext,
  `self_appraisal_score` longtext,
  `goals_next_year` longtext,
  `status` longtext,
  `remarks` longtext,
  `submitted_at` longtext,
  `a1_ict_tools` longtext,
  `a2_econtent` longtext,
  `a3_lab_experiments` longtext,
  `a4_feedback_scores` longtext,
  `a5_pass_percentage` longtext,
  `a6_industry_partnerships` longtext,
  `a7_hackathons` longtext,
  `b4_curriculum_dev` longtext,
  `b7_industry_training` longtext,
  `c3_community_service` longtext,
  `part_a_score` longtext,
  `part_b_score` longtext,
  `part_c_score` longtext,
  `part_d_score` longtext,
  `total_fpi_score` longtext,
  `hod_part_a_score` longtext,
  `hod_part_b_score` longtext,
  `hod_part_c_score` longtext,
  `hod_part_d_score` longtext,
  `hod_total_score` longtext,
  `hod_remarks` longtext,
  `hod_approved_at` longtext,
  `final_approved_by` longtext,
  `final_approved_at` longtext,
  `final_part_a_score` text,
  `final_part_b_score` text,
  `final_part_c_score` text,
  `final_part_d_score` text,
  `final_total_score` text,
  `final_remarks` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_appraisal`
--

LOCK TABLES `staff_appraisal` WRITE;
/*!40000 ALTER TABLE `staff_appraisal` DISABLE KEYS */;
INSERT INTO `staff_appraisal` VALUES (1,'TE0005','2026-2027',NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,NULL,'160',NULL,'HOD Approved','Final executive approval granted with distinction.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'50','30','60','20','160','0','0','0','0','180','','2026-07-31 10:03:21','admin','2026-07-31 09:46:54','55','35','65','20','175','Final executive approval granted with distinction.');
/*!40000 ALTER TABLE `staff_appraisal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_award`
--

DROP TABLE IF EXISTS `staff_award`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_award` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `awardname` longtext,
  `awardby` longtext,
  `event` longtext,
  `awa_date` longtext,
  `file` longtext,
  `type` longtext,
  `size` double DEFAULT NULL,
  `date` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_award`
--

LOCK TABLES `staff_award` WRITE;
/*!40000 ALTER TABLE `staff_award` DISABLE KEYS */;
INSERT INTO `staff_award` VALUES (1,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(2,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(3,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(4,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(5,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(6,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(7,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(8,'TE0005','Dr.R.BRINDHA','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(9,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'31/07/2026'),(10,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(11,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(12,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(13,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(14,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(15,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(16,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(17,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(18,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(19,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(20,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(21,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'01/08/2026'),(22,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'03/08/2026'),(23,'TE0005','','TEST_AWARD: Outstanding Researcher Award 2026','AICTE',NULL,'2026-01-26',NULL,NULL,NULL,'03/08/2026');
/*!40000 ALTER TABLE `staff_award` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_book_published`
--

DROP TABLE IF EXISTS `staff_book_published`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_book_published` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `title` longtext,
  `coauthor` longtext,
  `publisher` longtext,
  `edition` longtext,
  `isbn` longtext,
  `file` longtext,
  `type` longtext,
  `size` double DEFAULT NULL,
  `date` longtext,
  `dateofpublication` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_book_published`
--

LOCK TABLES `staff_book_published` WRITE;
/*!40000 ALTER TABLE `staff_book_published` DISABLE KEYS */;
INSERT INTO `staff_book_published` VALUES (1,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(2,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(3,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(4,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(5,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(6,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(7,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(8,'TE0005','Dr.R.BRINDHA','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(9,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'31/07/2026','2026-04-10'),(10,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(11,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(12,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(13,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(14,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(15,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(16,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(17,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(18,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(19,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(20,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(21,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'01/08/2026','2026-04-10'),(22,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'03/08/2026','2026-04-10'),(23,'TE0005','','TEST_BOOK: Advanced Data Structures 2026',NULL,'Springer',NULL,'978-3-16-148410-0',NULL,NULL,NULL,'03/08/2026','2026-04-10');
/*!40000 ALTER TABLE `staff_book_published` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_certificate`
--

DROP TABLE IF EXISTS `staff_certificate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_certificate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `course_name` longtext,
  `mark` double DEFAULT NULL,
  `organisation` longtext,
  `data_of_exam` longtext,
  `file` longtext,
  `type1` longtext,
  `size` double DEFAULT NULL,
  `date` longtext,
  `duration_weeks` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_certificate`
--

LOCK TABLES `staff_certificate` WRITE;
/*!40000 ALTER TABLE `staff_certificate` DISABLE KEYS */;
INSERT INTO `staff_certificate` VALUES (1,'TE0005','Dr.R.BRINDHA','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(2,'TE0005','Dr.R.BRINDHA','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(3,'TE0005','Dr.R.BRINDHA','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(4,'TE0005','Dr.R.BRINDHA','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(5,'TE0005','Dr.R.BRINDHA','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(6,'TE0005','Dr.R.BRINDHA','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(7,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'31/07/2026','12 Weeks'),(8,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(9,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(10,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(11,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(12,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(13,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(14,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(15,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(16,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(17,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(18,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(19,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'01/08/2026','12 Weeks'),(20,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'03/08/2026','12 Weeks'),(21,'TE0005','','TEST_CERT: NPTEL Machine Learning Advanced',92,'NPTEL','2026-04-01',NULL,NULL,NULL,'03/08/2026','12 Weeks');
/*!40000 ALTER TABLE `staff_certificate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_club`
--

DROP TABLE IF EXISTS `staff_club`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_club` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `club` longtext,
  `type` longtext,
  `title` longtext,
  `from_date` longtext,
  `to_date` longtext,
  `organizer` longtext,
  `res_person` longtext,
  `ben_person` longtext,
  `sponsership` longtext,
  `granted` double DEFAULT NULL,
  `date` longtext,
  `file` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_club`
--

LOCK TABLES `staff_club` WRITE;
/*!40000 ALTER TABLE `staff_club` DISABLE KEYS */;
INSERT INTO `staff_club` VALUES (1,'TE0005','Coding Club',NULL,'TEST_CLUB: Coding Club SREC','2026-01-01','2026-12-31',NULL,NULL,NULL,NULL,NULL,'31/07/2026',NULL),(2,'TE0005','Coding Club',NULL,'TEST_CLUB: Coding Club SREC','2026-01-01','2026-12-31',NULL,NULL,NULL,NULL,NULL,'31/07/2026',NULL),(3,'TE0005','Coding Club',NULL,'TEST_CLUB: Coding Club SREC','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(4,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(5,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(6,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(7,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(8,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(9,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL),(10,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(11,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(12,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(13,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(14,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(15,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(16,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(17,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(18,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(19,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(20,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(21,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'01/08/2026',NULL),(22,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'03/08/2026',NULL),(23,'TE0005','Coding Club SREC','Technical Club','Faculty Incharge Role','2026-01-01','2026-12-31','SREC',NULL,NULL,NULL,NULL,'03/08/2026',NULL);
/*!40000 ALTER TABLE `staff_club` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_competitive`
--

DROP TABLE IF EXISTS `staff_competitive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_competitive` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `exam_name` longtext,
  `level` longtext,
  `score` double DEFAULT NULL,
  `date_of_certificate` longtext,
  `date` longtext,
  `file` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_competitive`
--

LOCK TABLES `staff_competitive` WRITE;
/*!40000 ALTER TABLE `staff_competitive` DISABLE KEYS */;
INSERT INTO `staff_competitive` VALUES (1,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science',NULL,780,NULL,'31/07/2026',NULL),(2,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(3,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(4,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(5,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(6,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(7,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(8,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(9,'TE0005','Dr.R.BRINDHA','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(10,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'31/07/2026',NULL),(11,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(12,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(13,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(14,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(15,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(16,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(17,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(18,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(19,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(20,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(21,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(22,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'01/08/2026',NULL),(23,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'03/08/2026',NULL),(24,'TE0005','','TEST_EXAM: GATE Computer Science','National',780,NULL,'03/08/2026',NULL);
/*!40000 ALTER TABLE `staff_competitive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_department_history`
--

DROP TABLE IF EXISTS `staff_department_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_department_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_dept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_dept` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transfer_date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_department_history`
--

LOCK TABLES `staff_department_history` WRITE;
/*!40000 ALTER TABLE `staff_department_history` DISABLE KEYS */;
INSERT INTO `staff_department_history` VALUES (1,'TEST_FAC_4818','Mechanical Engineering','Information Technology','2026-08-03','2026-08-03 07:43:34'),(2,'TEST_FAC_7326','Mechanical Engineering','Information Technology','2026-08-03','2026-08-03 07:44:47');
/*!40000 ALTER TABLE `staff_department_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_development`
--

DROP TABLE IF EXISTS `staff_development`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_development` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` longtext,
  `staff_name` longtext,
  `coname` longtext,
  `staff_id` longtext,
  `coid` longtext,
  `title` longtext,
  `from_date` longtext,
  `to_date` longtext,
  `year_aca` longtext,
  `status` longtext,
  `institution` longtext,
  `revenue` double DEFAULT NULL,
  `date` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_development`
--

LOCK TABLES `staff_development` WRITE;
/*!40000 ALTER TABLE `staff_development` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_development` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_edu`
--

DROP TABLE IF EXISTS `staff_edu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_edu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `category` longtext,
  `specialization` longtext,
  `institute` longtext,
  `board` longtext,
  `year` longtext,
  `percentage` double DEFAULT NULL,
  `file` longtext,
  `type` longtext,
  `size` double DEFAULT NULL,
  `degree` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_edu`
--

LOCK TABLES `staff_edu` WRITE;
/*!40000 ALTER TABLE `staff_edu` DISABLE KEYS */;
INSERT INTO `staff_edu` VALUES (1,'TE2273','SSLC','Maths, Physics, Chemistry','Ideal Matric Higher Secondary School','Matric','2007',80,'1784865373150-sslc.jpg','image/jpeg',124.24,'SSLC'),(2,'TE2273','Diploma','Computer Engineering','Sri Ramakrishna Polytechnic College','DOTE','2010',88.98,'1784865428852-diplamo-certificate.jpg','image/jpeg',194.82,'Diploma'),(3,'TE2273','UG','Computer Science and Engineering','Coimbatore Institute of Engineering and Technology','Anna University','2013',7.39,'1784865486136-degree-certificte.jpg','image/jpeg',179.96,'B.E.'),(4,'TE2273','PG','Computer Science and Engineering','Sri Ramakrishna Engineering College','Anna University','2015',7.7,'1784865537201-medegree.pdf','application/pdf',1654.85,'M.E.');
/*!40000 ALTER TABLE `staff_edu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_event_organized`
--

DROP TABLE IF EXISTS `staff_event_organized`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_event_organized` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `type` longtext,
  `title` longtext,
  `from_date` longtext,
  `to_date` longtext,
  `organizer` longtext,
  `res_person` longtext,
  `ben_person` longtext,
  `sponsership` longtext,
  `granted` double DEFAULT NULL,
  `date` longtext,
  `file` longtext,
  `role` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_event_organized`
--

LOCK TABLES `staff_event_organized` WRITE;
/*!40000 ALTER TABLE `staff_event_organized` DISABLE KEYS */;
INSERT INTO `staff_event_organized` VALUES (1,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026',NULL,NULL,'SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(2,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026',NULL,NULL,'SREC',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(3,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC Department of IT',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(4,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(5,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(6,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(7,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(8,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(9,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'31/07/2026',NULL,NULL),(10,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(11,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(12,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(13,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(14,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(15,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(16,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(17,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(18,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(19,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(20,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(21,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'01/08/2026',NULL,NULL),(22,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'03/08/2026',NULL,NULL),(23,'TE0005','Workshop','TEST_WORKSHOP: National Workshop on Cybersecurity 2026','2026-06-01','2026-06-03','SREC IT Dept',NULL,NULL,NULL,NULL,'03/08/2026',NULL,NULL);
/*!40000 ALTER TABLE `staff_event_organized` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_funding`
--

DROP TABLE IF EXISTS `staff_funding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_funding` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `copiname` longtext,
  `copiid` longtext,
  `title` longtext,
  `fa` longtext,
  `status` longtext,
  `date` longtext,
  `amount` double DEFAULT NULL,
  `referenceno` longtext,
  `file` longtext,
  `faculty_role` longtext,
  `grant_category` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_funding`
--

LOCK TABLES `staff_funding` WRITE;
/*!40000 ALTER TABLE `staff_funding` DISABLE KEYS */;
INSERT INTO `staff_funding` VALUES (1,'TE0005','Dr.R.BRINDHA',NULL,NULL,NULL,NULL,'Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(2,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(3,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(4,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(5,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(6,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(7,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(8,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(9,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(10,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','31/07/2026',1500000,NULL,NULL,NULL,NULL),(11,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(12,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(13,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(14,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(15,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(16,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(17,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(18,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(19,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(20,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(21,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(22,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','01/08/2026',1500000,NULL,NULL,NULL,NULL),(23,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','03/08/2026',1500000,NULL,NULL,NULL,NULL),(24,'TE0005','',NULL,NULL,'TEST_GRANT: Smart Agriculture IoT Framework 2026','DST-SERB','Ongoing','03/08/2026',1500000,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `staff_funding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_innovative`
--

DROP TABLE IF EXISTS `staff_innovative`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_innovative` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `project_title` longtext,
  `description` longtext,
  `from_date` longtext,
  `to_date` longtext,
  `status` longtext,
  `date` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_innovative`
--

LOCK TABLES `staff_innovative` WRITE;
/*!40000 ALTER TABLE `staff_innovative` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_innovative` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_interaction`
--

DROP TABLE IF EXISTS `staff_interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_interaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `type` longtext,
  `title` longtext,
  `from_date` longtext,
  `to_date` longtext,
  `organizer` longtext,
  `file` longtext,
  `type1` longtext,
  `size` double DEFAULT NULL,
  `date` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_interaction`
--

LOCK TABLES `staff_interaction` WRITE;
/*!40000 ALTER TABLE `staff_interaction` DISABLE KEYS */;
INSERT INTO `staff_interaction` VALUES (1,'TE2273','Mr.R.S.VISHNUDURAI','FDP','Advanced Deep Learning and Neural Network Architectures','2026-06-10','2026-06-15','IIT Madras & SREC CSE Department',NULL,NULL,NULL,'24/07/2026'),(2,'TE2273','Mr.R.S.VISHNUDURAI','Seminar','Test Seminar','2026-07-24','2026-07-25','Test Venue',NULL,NULL,NULL,'24/07/2026');
/*!40000 ALTER TABLE `staff_interaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_ipr`
--

DROP TABLE IF EXISTS `staff_ipr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_ipr` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `patent` longtext,
  `institution` longtext,
  `generation` longtext,
  `propose` longtext,
  `file` longtext,
  `type` longtext,
  `size` double DEFAULT NULL,
  `date` longtext,
  `patent_status` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_ipr`
--

LOCK TABLES `staff_ipr` WRITE;
/*!40000 ALTER TABLE `staff_ipr` DISABLE KEYS */;
INSERT INTO `staff_ipr` VALUES (1,'TE0005','Dr.R.BRINDHA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026',NULL),(2,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(3,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(4,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(5,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(6,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(7,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(8,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(9,'TE0005','Dr.R.BRINDHA','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(10,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026','Published'),(11,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(12,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(13,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(14,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(15,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(16,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(17,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(18,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(19,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(20,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(21,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(22,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'01/08/2026','Published'),(23,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'03/08/2026','Published'),(24,'TE0005','','TEST_PATENT: AI-Based Defect Detection System',NULL,NULL,NULL,NULL,NULL,NULL,'03/08/2026','Published');
/*!40000 ALTER TABLE `staff_ipr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_member`
--

DROP TABLE IF EXISTS `staff_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `membershipid` longtext,
  `organization` longtext,
  `membership_type` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_member`
--

LOCK TABLES `staff_member` WRITE;
/*!40000 ALTER TABLE `staff_member` DISABLE KEYS */;
INSERT INTO `staff_member` VALUES (2,'TE2273','Mr.R.S.VISHNUDURAI','123456','CSI (Computer Society of India)','Life Member');
/*!40000 ALTER TABLE `staff_member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_pan`
--

DROP TABLE IF EXISTS `staff_pan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_pan` (
  `staff_id` varchar(255) NOT NULL,
  `staff_name` longtext,
  `path1` longtext,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_pan`
--

LOCK TABLES `staff_pan` WRITE;
/*!40000 ALTER TABLE `staff_pan` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_pan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_personal`
--

DROP TABLE IF EXISTS `staff_personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_personal` (
  `staff_id` varchar(255) NOT NULL,
  `staff_name` longtext,
  `dob` longtext,
  `gender` longtext,
  `address` longtext,
  `mobile` longtext,
  `email` longtext,
  `pan` longtext,
  `aadhar` longtext,
  `type` longtext,
  `aicte_id` longtext,
  `anna_univ_id` longtext,
  `apaar_id` longtext,
  `pan_file` longtext,
  `aadhar_file` longtext,
  `appointment_order_file` longtext,
  `joining_report_file` longtext,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_personal`
--

LOCK TABLES `staff_personal` WRITE;
/*!40000 ALTER TABLE `staff_personal` DISABLE KEYS */;
INSERT INTO `staff_personal` VALUES ('NT2785','Mr. A. VIVEK',NULL,NULL,NULL,'','',NULL,NULL,'Regular',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0005','',NULL,NULL,'SREC Campus, Coimbatore','9876543210','',NULL,NULL,'Regular','','','',NULL,NULL,NULL,NULL),('TE0006','','','','','','','','','Regular','','','',NULL,NULL,NULL,NULL),('TE0011','Dr.M.RM.KRISHNAPPA',NULL,NULL,NULL,NULL,'ramaiahkrishnappa@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0014','Dr.M.CHITRA',NULL,NULL,NULL,NULL,'chitra.muthukumaravel@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0015','Dr.R.VASANTHAPRIYA',NULL,NULL,NULL,NULL,'vasanthapriya.rengarajan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0019','Dr.J.SHEEJA',NULL,NULL,NULL,NULL,'sheeja.jayachandran@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0028','Dr.R.SANTHI',NULL,NULL,NULL,NULL,'santhi.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0029','Dr.R.KASTHURI',NULL,NULL,NULL,NULL,'kasthuri.maths@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0030','Dr.S.RANGANAYAKI',NULL,NULL,NULL,NULL,'ranganayaki.maths@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0031','Dr.P.VASANTHI',NULL,NULL,NULL,NULL,'vasanthi.maths@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0032','Mr.Y.J.GANESH',NULL,NULL,NULL,NULL,'ganesh.joghee@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0035','Mr.P.JAYAPRAKASH',NULL,NULL,NULL,NULL,'jayaprakash.pappannan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0039','Dr.P.SUGANYA',NULL,NULL,NULL,NULL,'suganya.palanisamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0041','Dr.K.SUKKIRAMATHI',NULL,NULL,NULL,NULL,'sukkiramathi.subramani@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0044','Dr.D.NARMATHA',NULL,NULL,NULL,NULL,'narmatha.premanand@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0045','Dr.D.INDHUMATHY',NULL,NULL,NULL,NULL,'indhumathy.shanmugam@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0102','Dr.E.SAROJINI',NULL,NULL,NULL,NULL,'sarojini.eswaran@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0120','Dr.N.SRIMATH',NULL,NULL,NULL,NULL,'srimath@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0125','Mr.M.S BALA SANTHOSH',NULL,NULL,NULL,NULL,'msbalasanthosh@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0128','Dr.P.KARUPPUSWAMY',NULL,NULL,NULL,NULL,'pks@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0129','Dr.C.BHAGYANATHAN',NULL,NULL,NULL,NULL,'bhagyanathan.chandragandhi@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0168','Dr.C.J.THOMAS RENALD',NULL,NULL,NULL,NULL,'thomasrenald.joseph@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0235','Dr.S.ALLIRANI',NULL,NULL,NULL,NULL,'allirani.saminathan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0236','Dr.R.SHANMUGASUNDARAM',NULL,NULL,NULL,NULL,'rsseee@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0237','Dr.K.SEBASTHI RANI',NULL,NULL,NULL,NULL,'sebasthirani.kathalingam@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0240','Mr.V.GOPU',NULL,NULL,NULL,NULL,'gopu.venugopal@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0244','Dr.P.SEBASTIAN  VINDRO JUDE',NULL,NULL,NULL,NULL,'jude.panimayam@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0245','Dr.K.BALAMURUGAN',NULL,NULL,NULL,NULL,'balamurugan.kaliappan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0337','Dr.G.GOPU',NULL,NULL,NULL,NULL,'gopu.govindasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0340','Dr.B.SHARMILA',NULL,NULL,NULL,NULL,'sharmila.rajesh@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0341','Dr.V.RUKKUMANI',NULL,NULL,NULL,NULL,'rukkumani.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0343','Dr.D.DEVASENA',NULL,NULL,NULL,NULL,'devasena.mohan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0347','Dr.V.RADHIKA',NULL,NULL,NULL,NULL,'radhika.senthil@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0390','Dr.M.JAGADEESWARI',NULL,NULL,NULL,NULL,'jagadeeswari.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0393','Dr.N.SATHISH KUMAR',NULL,NULL,NULL,NULL,'sathishkumar.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0396','Dr.S.P.VIMAL',NULL,NULL,NULL,NULL,'vimal.sp@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0397','Dr.B.R.SATHISHKUMAR',NULL,NULL,NULL,NULL,'sathishkumar.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0398','Dr.B.NATARAJ',NULL,NULL,NULL,NULL,'nataraj.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0450','Dr.A.GRACE SELVARANI',NULL,NULL,NULL,NULL,'graceselvarani@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0451','Dr.M.S.GEETHA DEVASENA',NULL,NULL,NULL,NULL,'msgeetha@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0452','Dr.B.MATHIVANAN',NULL,NULL,NULL,NULL,'mathivanan.bala@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0453','Dr.P.PERUMAL',NULL,NULL,NULL,NULL,'perumalp@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0455','Dr.R.MADHUMATHI',NULL,NULL,NULL,NULL,'madhumathi.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0456','Dr.R.KINGSY GRACE',NULL,NULL,NULL,NULL,'kingsygrace.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0458','Dr.R.VIJAYAKUMAR',NULL,NULL,NULL,NULL,'vijayakumar.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0462','Mr.S.SURESH KUMAR',NULL,NULL,NULL,NULL,'sureshkumar.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0501','Dr.J.SELVAKUMAR',NULL,NULL,NULL,NULL,'selvakumar.jayakumar@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0504','Dr.V.KARPAGAM',NULL,NULL,NULL,NULL,'karpagam.vilvanathan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0505','Dr.M.KALAIARASU',NULL,NULL,NULL,NULL,'kalai.muthusamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0506','Dr.J.ANITHA',NULL,NULL,NULL,NULL,'anitha.j@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0511','Mrs.P.V.KAVITHA',NULL,NULL,NULL,NULL,'kavitha.krishna@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0556','Dr.N.SURESH KUMAR',NULL,NULL,NULL,NULL,'nsuresh2@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE0755','Dr.S.NITHYANANDAN',NULL,NULL,NULL,NULL,'nithyanandan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1102','Mrs.R.K.RAGAVAPRIYA',NULL,NULL,NULL,NULL,'ragavapriya.krishnasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1151','Lt.Dr.M.RAMESH',NULL,NULL,NULL,NULL,'ramesh.mari@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1155','Dr.A. MURUGARAJAN',NULL,NULL,NULL,NULL,'murugarajan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1157','Dr.R.SUDHAKAR',NULL,NULL,NULL,NULL,'sudhakar.ramasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1158','Dr.M.S.SURESHKUMAR',NULL,NULL,NULL,NULL,'sureshkumar.shanmugasundaram@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1162','Dr.K.DEEPA',NULL,NULL,NULL,NULL,'deepa.senthil@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1163','Mr.R.PRABHU',NULL,NULL,NULL,NULL,'prabhu.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1196','Dr.C.S.MANIKANDA BABU',NULL,NULL,NULL,NULL,'manikandababu.shelvaraju@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1203','Dr.S.BHAGGIARAJ',NULL,NULL,NULL,NULL,'ktsbhaggiaraj@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1204','Dr.J.ANGEL IDA CHELLAM',NULL,NULL,NULL,NULL,'angel.anbuseelan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1206','Dr.N.SARANYA',NULL,NULL,NULL,NULL,'saranya.pravin@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1211','Dr.K.R.PRABHA',NULL,NULL,NULL,NULL,'prabha.kr@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1226','Mrs.S.EZHILIN FREEDA',NULL,NULL,NULL,NULL,'ezhilinfreeda@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1232','Dr.B.BRAILSON MANSINGH',NULL,NULL,NULL,NULL,'brailson.mansingh@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1237','Dr.S.KRISHNAPRABHA',NULL,NULL,NULL,NULL,'krishnaprabha.siva@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1241','Dr.M.KASISELVANATHAN',NULL,NULL,NULL,NULL,'kasiselvanathan.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1251','Dr.R.ANURADHA',NULL,NULL,NULL,NULL,'anuradha.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1271','Ms.A.SAGAYARANI',NULL,NULL,NULL,NULL,'sagaya.appasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1280','Dr.M.EZHILARASI',NULL,NULL,NULL,NULL,'ezhilarasi.nagarajan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1292','Dr.V.SRINIVASAN',NULL,NULL,NULL,NULL,'srinivasan.venugopal@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1297','Dr.S.SATHISH',NULL,NULL,NULL,NULL,'sathish.selvaraj@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1301','Dr.R.RAJESH KUMAR',NULL,NULL,NULL,NULL,'rk@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1308','Dr.K. SAVITHA',NULL,NULL,NULL,NULL,'savitha.krishnamurthy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1312','Mr.R.CHANDRU',NULL,NULL,NULL,NULL,'chandru.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1313','Dr.R.KRISHNAKUMAR',NULL,NULL,NULL,NULL,'krishnakumar.ramasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1402','Dr.Y.DHARSHAN',NULL,NULL,NULL,NULL,'dharshan.y@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1404','Dr.N.R.KARTHIK',NULL,NULL,NULL,NULL,'karthik.rangasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1412','Mr.R.SIVAKUMAR',NULL,NULL,NULL,NULL,'sivakumar.ramakrishnan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1419','Mrs.Y.ADLINE JANCY',NULL,NULL,NULL,NULL,'adlinejancy.y@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1424','Dr.M.CHINDAMANI',NULL,NULL,NULL,NULL,'chindamani.meyyappan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1432','Mrs.S.S.SUGANTHA MALLIKA',NULL,NULL,NULL,NULL,'sugantha.samuel@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1454','Mr.V.KRISHNA KUMAR',NULL,NULL,NULL,NULL,'krishnakumar.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1456','Dr.S.DEIVANAYAKI',NULL,NULL,NULL,NULL,'deivanayaki.subbaiyan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1461','Mr.C.DINESH',NULL,NULL,NULL,NULL,'dinesh.chandran@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1463','Dr.S.LAKSHMI NARAYANAN',NULL,NULL,NULL,NULL,'lakshminarayanan.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE1554','Dr.L.DHIVIYALAKSHMI',NULL,NULL,NULL,NULL,'dhiviyalakshmi.lakshmipathy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2013','Dr.P.MAHESWARI NAIK',NULL,NULL,NULL,NULL,'maheswari.naik@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2015','Mrs.G.LAVANYA',NULL,NULL,NULL,NULL,'lavanya.gangadharan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2027','Dr.M.ABIRAMI',NULL,NULL,NULL,NULL,'abirami.maharajan@srec.ac.in.',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2028','Dr.R.MARY METILDA',NULL,NULL,NULL,NULL,'metilda@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2031','Dr.B.MARIAPPAN',NULL,NULL,NULL,NULL,'mariappan.balasubramaniam@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2038','Dr.K.VIMALA DEVI',NULL,NULL,NULL,NULL,'vimaladevi.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2053','Dr.G.RATHI',NULL,NULL,NULL,NULL,'rathig@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2062','Dr.S.OMPRAKASAM',NULL,NULL,NULL,NULL,'omprakasam@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2108','Mrs.S.JANSI RANI',NULL,NULL,NULL,NULL,'jansi.sankar@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2111','Dr.T.R.SATHISHKUMAR',NULL,NULL,NULL,NULL,'sathishkumar.ramalingam@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2125','Dr.P.MATHIYALAGAN',NULL,NULL,NULL,NULL,'mathiyalagan.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2132','Dr.T.ANITHA',NULL,NULL,NULL,NULL,'anithacie@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2139','Mr.R.MOHAN KUMAR',NULL,NULL,NULL,NULL,'mohankumar.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2142','Mrs.P.SUGANTHA PRIYADHARSHINI',NULL,NULL,NULL,NULL,'sugantha.ravee@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2143','Mrs.C.PADMAVATHY',NULL,NULL,NULL,NULL,'padma.dhansh@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2153','Dr.A.VADIVEL',NULL,NULL,NULL,NULL,'vadivel.ayyakkannu@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2193','Dr.R.RAVEEN',NULL,NULL,NULL,NULL,'raveen.rangasamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2201','Dr.J.YOGANANDH',NULL,NULL,NULL,NULL,'jyogan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2213','Mrs.A.SHANMUGAPRIYA',NULL,NULL,NULL,NULL,'shanmugapriya@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2229','Dr.B.PRANESH',NULL,NULL,NULL,NULL,'praneshbalan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2243','Mr.P.SIVAKUMAR',NULL,NULL,NULL,NULL,'sivakumar.parasuraman@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2250','Mr.G.NARENDRAN',NULL,NULL,NULL,NULL,'narendran.g@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2264','Dr.T.VELMURUGAN',NULL,NULL,NULL,NULL,'velmurugan.t@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2273','Mr.R.S.VISHNUDURAI','1992-02-13','Male','3/312-4, Living Waters, Hill View Nagar, NGGO Colony, Coimbatore-641022','9994299922','vishnudurai.rs@srec.ac.in','AQNPV3607K','629343628202','teaching','1-2676127765','2648721992','329677419304','TE2273_1785317273451-07pan.jpg','TE2273_1785317273458-vishnu-aadhar-new.png','TE2273_1785317273469-01appointment-order.pdf','TE2273_1785317273475-02joining-order.pdf'),('TE2275','Dr.K.RAJESHWARAN',NULL,NULL,NULL,NULL,'rajesh.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2278','Mr.V.PARTHIBAN',NULL,NULL,NULL,NULL,'parthiban.velusamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2279','Mr.D.RAMAKRISHNAN',NULL,NULL,NULL,NULL,'ramakrishnan.dhandapani@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2286','Mr.B.KAMAL',NULL,NULL,NULL,NULL,'kamal.balu@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2289','Mr.R.VELMURUGAN',NULL,NULL,NULL,NULL,'velmurugan.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2290','Mr.V.SIVA',NULL,NULL,NULL,NULL,'siva.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2291','Mr.T.ASHOKKUMAR',NULL,NULL,NULL,NULL,'ashokkumar.t@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2298','Mrs.R.R.RUBIA GANDHI',NULL,NULL,NULL,NULL,'rubiagandhi.rajagopalan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2313','Mr.B.SENTHILKUMAR',NULL,NULL,NULL,NULL,'senthilkumarb@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2323','Ms.D.SUDHA',NULL,NULL,NULL,NULL,'sudha.d@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2346','Mr.K.ROBIN JOHNY',NULL,NULL,NULL,NULL,'robinjohny.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2347','Mrs.M.HAMSALATHA',NULL,NULL,NULL,NULL,'hamsalatha.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2348','Dr.H.VIDHYA',NULL,NULL,NULL,NULL,'vidhya.karthik@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2352','Dr.N.GUNASEKAR',NULL,NULL,NULL,NULL,'n.gunasekar@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2356','Mr.R.MOHAN',NULL,NULL,NULL,NULL,'mohan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2366','Dr.R.RAGHU',NULL,NULL,NULL,NULL,'raghu.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2367','Dr.P.CHANDRAMOHAN',NULL,NULL,NULL,NULL,'chandramohan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2372','Mrs.E.SHANTHINI',NULL,NULL,NULL,NULL,'shanthini.e@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2375','Mrs.P.DIVYAPRABHA',NULL,NULL,NULL,NULL,'divyaprabha.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2424','Dr.J.SURESH',NULL,NULL,NULL,NULL,'suresh.j@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2427','Mr.M.SELVAGANESH',NULL,NULL,NULL,NULL,'selvaganesh.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2434','Dr.V.K.ARTHI',NULL,NULL,NULL,NULL,'arthivk@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2440','Mr.G.RAM SUNDAR',NULL,NULL,NULL,NULL,'ramsundar.gurumoorthy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2444','Dr.S.HEMA',NULL,NULL,NULL,NULL,'hema.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2445','Mrs.K.SARANYA',NULL,NULL,NULL,NULL,'saranya.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2446','Dr.S.KANCHANA',NULL,NULL,NULL,NULL,'kanchana.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2455','Dr.B.KALAIMATHI',NULL,NULL,NULL,NULL,'kalaimathi@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2457','Dr.N.GOPALAKRISHNAN',NULL,NULL,NULL,NULL,'gopalakrishnan.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2460','Mr.N.DHARMAVITHURAANJAN',NULL,NULL,NULL,NULL,'dharma.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2463','Mrs.N.DIVYA',NULL,NULL,NULL,NULL,'divya.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2475','Dr.DEEPA B.PRABHU',NULL,NULL,NULL,NULL,'deepa.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2482','Mr.S.SARVESWARAN',NULL,NULL,NULL,NULL,'sarveswaran.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2496','Mrs.S.RAJALAKSHMI',NULL,NULL,NULL,NULL,'rajalakshmi.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2499','Ms.T.NITHYA SHREE',NULL,NULL,NULL,NULL,'nithyashree.t@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2500','Mrs.S.KAYALVIZHI',NULL,NULL,NULL,NULL,'kayalvizhi.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2508','Dr.V.THARANIDHARAN',NULL,NULL,NULL,NULL,'tharanidharan.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2509','Dr.S.SOWMIYA',NULL,NULL,NULL,NULL,'sowmiya.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2513','Mr.T.RAJASEKAR',NULL,NULL,NULL,NULL,'rajasekar.t@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2519','Ms.R.RAJALAKSHMI',NULL,NULL,NULL,NULL,'rajalakshmi.ravisankar@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2520','Dr.M.LOGAPRAKASH',NULL,NULL,NULL,NULL,'logaprakash.muthuswamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2523','Ms.M.PREETHI',NULL,NULL,NULL,NULL,'preethi.muthukumar@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2533','Dr.N.INDUMATHI',NULL,NULL,NULL,NULL,'indumathi.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2535','Dr.K.DHANA SHREE',NULL,NULL,NULL,NULL,'dhanashree.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2536','Mrs.C.SOWNTHARYA',NULL,NULL,NULL,NULL,'sowntharya.c@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2537','Mrs.N.DHEERTHI',NULL,NULL,NULL,NULL,'dheerthi.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2538','Dr.G.HEMALATHA',NULL,NULL,NULL,NULL,'hemalatha.g@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2539','Dr.VICHITRA SIVAJI',NULL,NULL,NULL,NULL,'vichitra.sivaji@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2540','Ms.S.ALAMELU ALIAS RAJASREE',NULL,NULL,NULL,NULL,'alamelurajasree.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2548','Dr.A.KISHORE KUMAR',NULL,NULL,NULL,NULL,'kishorekumar.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2561','Mrs.K.RANJEETHAPRIYA',NULL,NULL,NULL,NULL,'ranjeethapriya.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2571','Dr.J.JAYASHREE',NULL,NULL,NULL,NULL,'jayashree.j@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2579','Dr.A.LEGGINS',NULL,NULL,NULL,NULL,'leggins@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2580','Mr.A.PENIEL WINIFRED RAJ',NULL,NULL,NULL,NULL,'penielwinifredraj@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2582','Mr.C.MATHAN',NULL,NULL,NULL,NULL,'mathan.c@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2583','Mrs.G.ANUSHA',NULL,NULL,NULL,NULL,'anushasanjay@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2585','Mr.B.SRIDHAR',NULL,NULL,NULL,NULL,'sridhar.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2586','Dr.R.KARTHIKAMANI',NULL,NULL,NULL,NULL,'karthikamani.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2590','Dr.A.VIJAY',NULL,NULL,NULL,NULL,'vijay.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2591','Mr.I.ARAVINDAGURU',NULL,NULL,NULL,NULL,'aravindaguru.i@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2596','Mrs.R.S.RAMYA',NULL,NULL,NULL,NULL,'ramya.rs@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2597','Mr.B.MARISEKAR',NULL,NULL,NULL,NULL,'marisekar.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2599','Dr.M.JAISHREE',NULL,NULL,NULL,NULL,'jaishree.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2601','Mrs.T.THENMOZHI',NULL,NULL,NULL,NULL,'thenmozhi.t@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2602','Mr.S.VIGNESHWARAN',NULL,NULL,NULL,NULL,'vigneshwaran.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2606','Mrs.R.KIRUBA',NULL,NULL,NULL,NULL,'kiruba.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2607','Mr.P.MOHANRAJ',NULL,NULL,NULL,NULL,'mohanraj.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2608','Dr.R.SARANYA',NULL,NULL,NULL,NULL,'saranya.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2609','Mrs.J.M.PRIYADHARSHENI',NULL,NULL,NULL,NULL,'priyadharsheni.j.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2611','Mrs.M.SHANTHINI',NULL,NULL,NULL,NULL,'shanthini.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2612','Dr.S.HARIGANESH',NULL,NULL,NULL,NULL,'hariganesh.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2632','Mrs.C.KAVITHA',NULL,NULL,NULL,NULL,'kavitha.c@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2636','Mr.K.VIJAYAKUMAR',NULL,NULL,NULL,NULL,'vijayakumar.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2641','Mrs.B.JASMINE PRIYADHARSHINI',NULL,NULL,NULL,NULL,'jasminepriyadharshini.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2643','Mrs.M.KOWSALYA',NULL,NULL,NULL,NULL,'kowsalya.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2650','Mrs.R.RAMPRIYA',NULL,NULL,NULL,NULL,'rampriya.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2653','Mrs.N.NANDHINE SHREE',NULL,NULL,NULL,NULL,'nandhineshree.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2655','Mr.P.BALAJI',NULL,NULL,NULL,NULL,'balaji.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2658','Mrs.P.MONISHA',NULL,NULL,NULL,NULL,'monisha.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2660','Mrs.M.SARANYA',NULL,NULL,NULL,NULL,'saranya.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2667','Dr.N.ALAGU SUNDARI',NULL,NULL,NULL,NULL,'alagusundari.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2676','Mrs.A.REETHIKA',NULL,NULL,NULL,NULL,'reethika.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2677','Mrs.A.RASHEEDHA',NULL,NULL,NULL,NULL,'rasheedha.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2678','Mrs.A.MAHALAKSHMI',NULL,NULL,NULL,NULL,'mahalakshmi.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2684','Mr.S.JEEVANANDHAM',NULL,NULL,NULL,NULL,'jeevanandham.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2687','Dr.B.KANIMOZHI',NULL,NULL,NULL,NULL,'kanimozhi.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2688','Dr.M.BLESSY DOE',NULL,NULL,NULL,NULL,'blessydoe@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2691','Mrs.K.PRASHANTHINI',NULL,NULL,NULL,NULL,'prashanthini.k@srec.a.c.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2693','Mrs.M.PRINCY',NULL,NULL,NULL,NULL,'princy.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2694','Dr.M.KOKILAMANI',NULL,NULL,NULL,NULL,'kokilamani.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2704','Mrs.K.SONA',NULL,NULL,NULL,NULL,'sona.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2705','Dr.P.VISHNUVARDHAN',NULL,NULL,NULL,NULL,'vishnuvardhan.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2707','Mrs.V.ANUPRIYA',NULL,NULL,NULL,NULL,'anupriya.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2710','Mrs.H.NISHANTHI',NULL,NULL,NULL,NULL,'nishanthi.h@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2716','Mr.S.SIVARAJ',NULL,NULL,NULL,NULL,'sivaraj.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2717','Mrs.J.JEBA PRATHICKA',NULL,NULL,NULL,NULL,'jebaprathicka.j@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2725','Ms.K.SINDHU',NULL,NULL,NULL,NULL,'sindhu.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2726','Ms.A.SELVA PRIYA',NULL,NULL,NULL,NULL,'selvapriya.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2737','Mr.M.VELMURUGAN',NULL,NULL,NULL,NULL,'velmurugan.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2738','Mrs.M.AMUTHASURABI',NULL,NULL,NULL,NULL,'amuthasurabi.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2740','Mr.R.HARI PRAKASH',NULL,NULL,NULL,NULL,'hariprakash.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2745','Ms.A.ISHWARYA',NULL,NULL,NULL,NULL,'ishwarya.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2746','Mr.N.MANOJ',NULL,NULL,NULL,NULL,'manoj.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2751','Dr.A.SOUNDARRAJAN',NULL,NULL,NULL,NULL,'principal@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2752','Mrs.V.MUTHULAKSHMI',NULL,NULL,NULL,NULL,'muthulakshmi.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2755','Mrs.S.KANMANI',NULL,NULL,NULL,NULL,'kanmani.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2765','Dr.P.SANGEETHA',NULL,NULL,NULL,NULL,'sangeetha.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2766','Mrs.M.NAUSATH BANU',NULL,NULL,NULL,NULL,'nausathbanu@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2771','Mr.K.B.LINGKASH',NULL,NULL,NULL,NULL,'lingkash.kb@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2781','Mrs.V.GOMATHI SANKARI',NULL,NULL,NULL,NULL,'gomathisankari.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2799','Dr.G.LENIN KUMAR',NULL,NULL,NULL,NULL,'leninkumar.g@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2814','Mrs.A.KAYALVIZHI',NULL,NULL,NULL,NULL,'kayalvizhi.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2815','Dr.V.SAVEETHA',NULL,NULL,NULL,NULL,'saveetha.v@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2816','Dr.N.SUSILA',NULL,NULL,NULL,NULL,'susila.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2817','Mrs.D.DEVIPRIYA',NULL,NULL,NULL,NULL,'devipriya.d@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2821','Dr.K.BALACHANDER',NULL,NULL,NULL,NULL,'balachander.kalappan@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2822','Dr.R.SARAVANAN',NULL,NULL,NULL,NULL,'saravanan.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2823','Mrs.M.DIVYA',NULL,NULL,NULL,NULL,'divya.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2825','Dr.A.MAHALAKSHMI',NULL,NULL,NULL,NULL,'mahalakshmia@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2828','Dr.T.MANOJPRAPHAKAR',NULL,NULL,NULL,NULL,'manojpraphakar@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2829','Dr.A.SAKTHIVEL',NULL,NULL,NULL,NULL,'sakthivelaruchamy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2830','Dr.SHILPA JOY',NULL,NULL,NULL,NULL,'shilpajoy@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2834','Mr.GAURAB MUDBHARI',NULL,NULL,NULL,NULL,'gaurabmudbhari@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2841','Mrs.K.CHAMUNDESWARI',NULL,NULL,NULL,NULL,'chamundeswari.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2847','Dr.R.MALATHI',NULL,NULL,NULL,NULL,'malathi.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2849','Ms.A.DEEPTHI',NULL,NULL,NULL,NULL,'deepthi.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2850','Mr.R.SARAVANA KUAMR',NULL,NULL,NULL,NULL,'saravanakumar.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2853','Ms.R.DEEKSHA',NULL,NULL,NULL,NULL,'deeksha.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2854','Ms.R.S.KARTHIKA SHIVAANI',NULL,NULL,NULL,NULL,'karthikashivaani@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2855','Dr.D.VIVEK',NULL,NULL,NULL,NULL,'vivek.d@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2857','Mrs.S.PRASEETHA',NULL,NULL,NULL,NULL,'praseetha.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2861','Mrs.N.NITHYA',NULL,NULL,NULL,NULL,'nithya.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2862','Dr.S.SAKTHIVEL',NULL,NULL,NULL,NULL,'sakthivel.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2876','Dr.G.RANJITHAM',NULL,NULL,NULL,NULL,'ranjitham.g@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2878','Mr.G.YOGESH',NULL,NULL,NULL,NULL,'yogesh.g@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2879','Ms.A.ADLINA MARIA',NULL,NULL,NULL,NULL,'adlinamaria.a@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2880','Ms.H.SOWMYA',NULL,NULL,NULL,NULL,'sowmya.h@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2883','Mr.D.NANEE',NULL,NULL,NULL,NULL,'nanee.d@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2884','Dr.P.DEVENDRAN',NULL,NULL,NULL,NULL,'devendran.p@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2888','Dr.M.SELLADURAI',NULL,NULL,NULL,NULL,'selldurai.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2891','Mrs.B.KEERTHANA',NULL,NULL,NULL,NULL,'keerthana.b@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2894','Dr.M.SIVAJI',NULL,NULL,NULL,NULL,'sivaji.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2904','Mrs.K.MYTHILY',NULL,NULL,NULL,NULL,'mythily.k@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2906','Dr.N.GEETHA',NULL,NULL,NULL,NULL,'geetha.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2911','Mrs.R.ASWATHA',NULL,NULL,NULL,NULL,'aswatha.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2914','Dr.N.MOOKHAMBIKA',NULL,NULL,NULL,NULL,'mookhambika.n@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2915','Mrs.M.SWATHIKA',NULL,NULL,NULL,NULL,'swathika.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2916','Dr.S.JAYAPRIYA',NULL,NULL,NULL,NULL,'jayapriya.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2927','Dr.S.MOHANAVEL',NULL,NULL,NULL,NULL,'mohanavel.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2930','Dr.H.MANGALAM',NULL,NULL,NULL,NULL,'mangalam.h@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2931','Dr.J.P.DEEBASREE',NULL,NULL,NULL,NULL,'deebasree.jp@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2932','Dr.S.JAYANTHY',NULL,NULL,NULL,NULL,'jayanthy.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2933','Mrs.S.U.NIVEDAA',NULL,NULL,NULL,NULL,'nivedaa.su@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2934','Dr.N.SARANYA',NULL,NULL,NULL,NULL,'saranyacivil@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2935','Dr.G.SATHIYASEELAN',NULL,NULL,NULL,NULL,'sathiyaseelan.g@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2936','Mrs.R.PRADEEPA',NULL,NULL,NULL,NULL,'pradeepa.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2938','Dr.NITHYA CHRISTOPHER',NULL,NULL,NULL,NULL,'nithyachristopher@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE2940','Dr.R.ANJALI',NULL,NULL,NULL,NULL,'anjali.r@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE5006','Dr.C.JOANNA PAULINE',NULL,NULL,NULL,NULL,'joan.chelladurai@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE5014','Dr.S.RANGEETHA',NULL,NULL,NULL,NULL,'rangeetha.s@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE5022','Dr.C.PRAVEENKUMAR',NULL,NULL,NULL,NULL,'praveenkumar.chandran@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('TE5030','Dr.M.NAGARAJAPANDIAN',NULL,NULL,NULL,NULL,'nagarajapandian.m@srec.ac.in',NULL,NULL,'teaching',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `staff_personal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_publication`
--

DROP TABLE IF EXISTS `staff_publication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_publication` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `type_pub` longtext,
  `type` longtext,
  `title` longtext,
  `journel` longtext,
  `date_con` longtext,
  `organizer` longtext,
  `doi` longtext,
  `isbn` longtext,
  `month_pub` longtext,
  `volume_pub` longtext,
  `pp` longtext,
  `index_pub` longtext,
  `web_of_science` longtext,
  `citations` int DEFAULT NULL,
  `hindex` int DEFAULT NULL,
  `impact` double DEFAULT NULL,
  `file` longtext,
  `type1` longtext,
  `size` double DEFAULT NULL,
  `issn_no` longtext,
  `issue_no` longtext,
  `co_authors` longtext,
  `author_position` varchar(100) DEFAULT NULL,
  `pub_status` varchar(100) DEFAULT NULL,
  `paper_url` varchar(500) DEFAULT NULL,
  `conf_venue` varchar(255) DEFAULT NULL,
  `conf_dates` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_publication`
--

LOCK TABLES `staff_publication` WRITE;
/*!40000 ALTER TABLE `staff_publication` DISABLE KEYS */;
INSERT INTO `staff_publication` VALUES (1,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus, WoS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus, WoS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus, WoS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus, WoS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus, WoS',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'TE0005','Dr.R.BRINDHA',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'Scopus',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'WoS, SCI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'WoS, SCI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,'WoS, SCI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'TE0005','',NULL,NULL,'TEST_PAPER: Deep Learning in Healthcare 2026','IEEE Trans Medical Imaging',NULL,NULL,'10.1109/TMI.2026.001',NULL,'May',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `staff_publication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_resource`
--

DROP TABLE IF EXISTS `staff_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_resource` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `type` longtext,
  `title` longtext,
  `actedas` longtext,
  `from_date` longtext,
  `to_date` longtext,
  `organizer` longtext,
  `ben` int DEFAULT NULL,
  `file` longtext,
  `type1` longtext,
  `size` double DEFAULT NULL,
  `date` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_resource`
--

LOCK TABLES `staff_resource` WRITE;
/*!40000 ALTER TABLE `staff_resource` DISABLE KEYS */;
INSERT INTO `staff_resource` VALUES (1,'TE2273','Mr.R.S.VISHNUDURAI','application/pdf','AI','Speaker','2026-07-22','2026-07-22','GCT',50,'1784821082588-15.pdf','application/pdf',1993.37,'23/07/2026'),(2,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'31/07/2026'),(3,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(4,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(5,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(6,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(7,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(8,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(9,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(10,'TE0005','Dr.R.BRINDHA',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(11,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'31/07/2026'),(12,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(13,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(14,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(15,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(16,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(17,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(18,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(19,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(20,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(21,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(22,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(23,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'01/08/2026'),(24,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'03/08/2026'),(25,'TE0005','',NULL,'TEST_LECTURE: Keynote on Cloud Native AI',NULL,'2026-05-15','2026-05-15','National AI Summit 2026',NULL,NULL,NULL,NULL,'03/08/2026');
/*!40000 ALTER TABLE `staff_resource` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_responsibilities`
--

DROP TABLE IF EXISTS `staff_responsibilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_responsibilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `assigned_by` longtext,
  `department` longtext,
  `academic_year` longtext,
  `responsibility` longtext,
  `assigned_at` longtext,
  `level` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_responsibilities`
--

LOCK TABLES `staff_responsibilities` WRITE;
/*!40000 ALTER TABLE `staff_responsibilities` DISABLE KEYS */;
INSERT INTO `staff_responsibilities` VALUES (2,'TE2273','Dr.V.KARPAGAM','AI & DS','2026-2027','Department Staff Placement Coordinator','2026-07-24 09:05:00','Department Level'),(3,'TE2273','System Administrator','N/A','2026-2027','Institutional Website Incharge','2026-07-24 09:18:39','Institutional Level'),(4,'TE2440','Principal / HR','IT','2026-2027','Faculty Incharge - CySIGMA','2026-07-27 09:05:18','Institutional Level'),(5,'TE2347','Principal / HR','ENG','2026-2027','Faculty Incharge - English Literary Society','2026-07-27 09:05:18','Institutional Level'),(6,'TE1102','Principal / HR','EEE','2026-2027','Faculty Incharge - Fine Arts Club','2026-07-27 09:05:18','Institutional Level'),(7,'TE2746','Principal / HR','CSE','2026-2027','Faculty Incharge - Foss Club','2026-07-27 09:05:18','Institutional Level'),(8,'TE2815','Principal / HR','CSE','2026-2027','Faculty Incharge - Code Catalyst Club','2026-07-27 09:05:18','Institutional Level'),(9,'TE0014','Principal / HR','PHY','2026-2027','Faculty Incharge - Phoraratz Club','2026-07-27 09:05:18','Institutional Level'),(10,'TE1308','Principal / HR','ENG','2026-2027','Faculty Incharge - Quiz Club','2026-07-27 09:05:18','Institutional Level'),(11,'TE0039','Principal / HR','ENG','2026-2027','Faculty Incharge - Reading Movement Club','2026-07-27 09:05:18','Institutional Level'),(12,'TE2862','Principal / HR','ENG (Tamil Discipline)','2026-2027','Faculty Incharge - Tamil Mandram Club','2026-07-27 09:05:18','Institutional Level'),(13,'TE2457','Principal / HR','MATHS','2026-2027','Faculty Incharge - Uyir Club','2026-07-27 09:05:18','Institutional Level'),(14,'TE0168','Principal / HR','AERO','2026-2027','Faculty Incharge - Yi YUVA Club','2026-07-27 09:05:18','Institutional Level'),(15,'TE1151','Principal / HR','MECH','2026-2027','Faculty Incharge - NCC','2026-07-27 09:05:18','Institutional Level'),(16,'TE2821','Principal / HR','EEE','2026-2027','Faculty Incharge - Renewable Energy Club','2026-07-27 09:05:18','Institutional Level'),(17,'TE0337','Principal / HR','ECE','2026-2027','Faculty Incharge - SDG Club','2026-07-27 09:05:18','Institutional Level'),(18,'TE2346','Principal / HR','AERO','2026-2027','Faculty Coordinator - Fine Arts Club','2026-07-27 09:05:18','Institutional Level'),(19,'TE0452','Principal / HR','CSE','2026-2027','Faculty Coordinator - SDG Club','2026-07-27 09:05:18','Institutional Level');
/*!40000 ALTER TABLE `staff_responsibilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_scholars`
--

DROP TABLE IF EXISTS `staff_scholars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_scholars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `res_id` longtext,
  `staff_name` longtext,
  `university` longtext,
  `sup_name` longtext,
  `desgination` longtext,
  `organisation` longtext,
  `status` longtext,
  `date` longtext,
  `file` longtext,
  `supervisor_type` longtext,
  `registration_year` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=875 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_scholars`
--

LOCK TABLES `staff_scholars` WRITE;
/*!40000 ALTER TABLE `staff_scholars` DISABLE KEYS */;
INSERT INTO `staff_scholars` VALUES (681,'EXT_SCHOLAR','17254697539','Ms. J. S. Shanithini','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','External Scholar (Mtech CSE)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(682,'TE2611','23234697279','Mrs. M. Shanthini','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2023'),(683,'TE1226','21244697413','Ms.S. Ezhilin Freeda','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Oct, 2021'),(684,'TE2142','21224697417','Ms. P. Sugantha Priyadharshini','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Oct, 2021'),(685,'EXT_SCHOLAR','21244697423','Ms. S. Birundha','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','External Scholar (Mtech CSE)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Oct, 2021'),(686,'TE2499','21224697179','Ms. T. Nithya Shree','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Sep , 2021'),(687,'TE2213','21274691278','Ms. A. Shanmugapriya','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Jan, 2021'),(688,'EXT_SCHOLAR','18244691173','Mrs. M. Sri Geetha','Anna University','Dr. A. Grace Selvarani','Ph.D Scholar','External Scholar (Mtech CSE)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec , 2017'),(689,'EXT_SCHOLAR','22253697132','Mrs. Lidiya Babu','Anna University','Dr. P. Mathiyalagan','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2022'),(690,'TE2825','24244691386','Mrs. A. Mahalakshmi','Anna University','Dr. P. Mathiyalagan','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Dec,2023'),(691,'EXT_SCHOLAR','25144691162','Mr. Suresh kumar P','Anna University','Dr. P. Mathiyalagan','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2025'),(692,'TE2053','19244697197','Dr. G. Rathi','Anna University','Dr. R. Anuradha','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2019'),(693,'EXT_SCHOLAR','21244697348','Ms. P. Divya','Anna University','Dr. R. Anuradha','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Sep , 2021'),(694,'EXT_SCHOLAR','21234691125','Ms. S. Prince Sahaya Brighty','Anna University','Dr. R. Anuradha','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2021'),(695,'EXT_SCHOLAR','21244691370','Ms. K. Priyadarsini','Anna University','Dr. R. Anuradha','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2021'),(696,'EXT_SCHOLAR','22284697125','Ms. S. Reshma Sultana','Anna University','Dr. R. Anuradha','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2022'),(697,'TE1454','21144691139','Mr. Krishna Kumar.V','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Jan, 2021'),(698,'EXT_SCHOLAR','17134691468','Mr. R. Rajan','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2016'),(699,'EXT_SCHOLAR','21154697205','Mr. R. Selvaraj','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Sep , 2021'),(700,'EXT_SCHOLAR','22144691237','Mr. T. Satheesh','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2022'),(701,'EXT_SCHOLAR','21134697337','Mr. M. Sathish','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Sep , 2021'),(702,'EXT_SCHOLAR','25254691332','Ms. Santhamani V','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2025'),(703,'EXT_SCHOLAR','25144691458','Mr. Moses K','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2025'),(704,'TE2273','24154691156','Mr. R. S. Vishnu Durai','Anna University','Dr.R.KINGSY GRACE','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Confirmed','2026-07-26 12:50:11','TE2273_1785422708262-24154691156_confirmation-order.pdf','Internal','2024-01'),(705,'EXT_SCHOLAR','24244691157','Mrs. M. Dhivyashree','Anna University','Dr.R.KINGSY GRACE','External Scholar','External Scholar (Computer Science Engineering)','Provisionally Confirmed','2026-07-26 12:50:11',NULL,'External','2024-01'),(706,'TE2704','24244691283','Mrs. K. Sona','Anna University','Dr. R. Kingsy Grace','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Dec,2023'),(707,'EXT_SCHOLAR','23244697478','Ms. S. Reshni','Anna University','Dr. R. Kingsy Grace','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Aug, 2023'),(708,'TE2536','24244697150','Ms. C. Sowntharya','Anna University','Dr. R. Kingsy Grace','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','June, 2024'),(709,'EXT_SCHOLAR','24244697268','Ms. P. Kiruthika','Anna University','Dr. R. Kingsy Grace','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2024'),(710,'EXT_SCHOLAR','24174691397','Mr. A. Soundararajan','Anna University','Dr. R. Madumathi','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(711,'EXT_SCHOLAR','24244691180','Ms. K. Uma Maheswari','Anna University','Dr. R. Madumathi','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(712,'EXT_SCHOLAR','24124697417','Mr. A. Dinesh Kumar','Anna University','Dr. R. Madumathi','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2024'),(713,'EXT_SCHOLAR','252546913884','Ms. P.Jothi','Anna University','Dr. M. S. Geetha Devasena','Ph.D Scholar','External Scholar (Computer Science Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(714,'EXT_SCHOLAR','25244697360','Ms.J.Jamila','Anna University','Dr. R. Madumathi','Ph.D Scholar','External Scholar (Mtech CSE)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(715,'EXT_SCHOLAR','25244697375','Ms.Vinothini','Anna University','Dr. R. Madumathi','Ph.D Scholar','External Scholar (Mtech CSE)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(716,'EXT_SCHOLAR','25244697361','Ms.Darshika Kelvin','Anna University','Dr. R. Anuradha','Ph.D Scholar','External Scholar (Mtech CSE)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(717,'TE2583','25244697232','Ms.G.Anusha','Anna University','Dr. R. Anuradha','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2025'),(718,'TE2250','26144691453','Mr.G.Narendran','Anna University','Dr. R. Anuradha','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Jan, 2026'),(719,'EXT_SCHOLAR','19142697230','Mr.R.Dhanasekaran','Anna University','Dr. P. Karuppuswamy','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2019'),(720,'EXT_SCHOLAR','17142697123','Mr.P.Saravanakumar','Anna University','Dr. P. Karuppuswamy','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(721,'EXT_SCHOLAR','20142691120','Mr. A. T. Navinprasad','Anna University','Dr. J. Yoganandh','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2020'),(722,'TE1461','23122697164','Mr. C. Dinesh','Anna University','Dr. J. Yoganandh','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2023'),(723,'EXT_SCHOLAR','21142691129','Mr.S.Satish','Anna University','Dr. N. Gunasekar','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2021'),(724,'EXT_SCHOLAR','21142691208','Mr.J.Jayakar','Anna University','Dr. N. Gunasekar','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2021'),(725,'TE2346','19152697126','Mr.K.Robinjohny','Anna University','Dr. C. Bhagyanathan','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Aug, 2019'),(726,'EXT_SCHOLAR','22132697157','Mr.P.Srinath','Anna University','Dr. C. Bhagyanathan','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2022'),(727,'TE2289','24142697226','Mr. R. Velmurugan','Anna University','Dr. A. Vadivel','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2024'),(728,'EXT_SCHOLAR','19142697163','Mr.S.Dinesh','Anna University','Dr.P. Chandramohan','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2019'),(729,'TE2313','19142697164','Mr.B.Senthilkumar','Anna University','Dr.P. Chandramohan','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2019'),(730,'EXT_SCHOLAR','19122697159','Mr.G.Thilak','Anna University','Dr.P. Chandramohan','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2019'),(731,'TE0125','21132697303','Mr. M. S. Balasanthosh','Anna University','Dr.P. Chandramohan','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Sep , 2021'),(732,'EXT_SCHOLAR','20142691223','Mr.S.Pradeep','Anna University','Dr.P. Chandramohan','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2020'),(733,'EXT_SCHOLAR','24142691251','Mr.S. Saravana Kumar','Anna University','Dr.P. Chandramohan','Ph.D Scholar','External Scholar (Mechanical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec-23'),(734,'TE1432','21244691513','Ms. S. S. Sugantha Mallika','Anna University','Dr. V. Karpagam','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Feb, 2021'),(735,'TE2108','21244691391','Ms. S. Jansi Rani','Anna University','Dr. V. Karpagam','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Jan, 2021'),(736,'TE0511','19244697261','Mrs. P.V. Kavitha','Anna University','Dr. V. Karpagam','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2019'),(737,'EXT_SCHOLAR','21134691515','Mr. Ram Sundar','Anna University','Dr. V. Karpagam','Ph.D Scholar','External Scholar (Artificial Intelligence & Data Science)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2021'),(738,'EXT_SCHOLAR','21244691553','Mrs. S. Lavanya','Anna University','Dr. V. Karpagam','Ph.D Scholar','External Scholar (Artificial Intelligence & Data Science)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2021'),(739,'EXT_SCHOLAR','20122691131','Mr. D.','Anna University','Robotics and Automation','Ph.D Scholar','External Scholar (Anandakumar)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dr. A. Murugarajan'),(740,'EXT_SCHOLAR','20142691224','Mr. T. Sudhakar','Anna University','Dr. A. Murugarajan','Ph.D Scholar','External Scholar (Robotics and Automation)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2020'),(741,'EXT_SCHOLAR','20241691110','Mrs. S. Indhumathi','Anna University','Dr. A.Sakthivel','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2019'),(742,'EXT_SCHOLAR','21247691115','Ms. S. Uma Maheswari','Anna University','Dr. A.Sakthivel','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2021'),(743,'EXT_SCHOLAR','22257691118','Mrs. G. Ayshwarya','Anna University','Dr. A.Sakthivel','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2022'),(744,'EXT_SCHOLAR','1514769762','Mr. D. Sengottaiyan','Anna University','Dr. A.Sakthivel','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2015'),(745,'EXT_SCHOLAR','24147691109','Mr. P. Selvamurugan','Anna University','Dr. A.Sakthivel','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(746,'EXT_SCHOLAR','24147691167','Mr. K. Rajeswaran','Anna University','Dr.S.Hariganesh','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(747,'EXT_SCHOLAR','24257697187','Ms. Maya Manoj J','Anna University','Dr Deepa B Prabhu','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(748,'EXT_SCHOLAR','24247697160','Ms. Priyanka','Anna University','Dr Deepa B Prabhu','Ph.D Scholar','External Scholar (Nano Science and Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(749,'TE2323','20237691105','Ms. D. Sudha','Anna University','Dr.K.Chitra','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Dec, 2019'),(750,'EXT_SCHOLAR','24149691260','Mr. R. Vigneshwaran','Anna University','Dr. A. Leggins','Ph.D Scholar','External Scholar (Physics)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(751,'EXT_SCHOLAR','24237697193','Ms.Periyanayagi S','Anna University','Dr. A. Leggins','Ph.D Scholar','External Scholar (Physics)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(752,'EXT_SCHOLAR','21147697168','Mr. R. Santhosh kumar','Anna University','Dr. J. Suresh','Ph.D Scholar','External Scholar (Chemistry)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Oct, 2021'),(753,'EXT_SCHOLAR','21247697165','Mrs. R. Hindumathi','Anna University','Dr. J. Suresh','Ph.D Scholar','External Scholar (Chemistry)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Oct, 2021'),(754,'EXT_SCHOLAR','22237691151','Mrs. M. Jayasudha','Anna University','Dr. J. Suresh','Ph.D Scholar','External Scholar (Chemistry)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2022'),(755,'EXT_SCHOLAR','21247697105','Mrs. A. Sangeetha','Anna University','Dr. S. Hariganesh','Ph.D Scholar','External Scholar (Chemistry)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Sep, 2021'),(756,'TE0035','16147697193','Mr. P. Jayaprakash','Anna University','Dr. P. Maheswari naik','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2016'),(757,'TE0032','16147697194','Mr. Y. J. Ganesh','Anna University','Dr. P. Maheswari naik','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2016'),(758,'EXT_SCHOLAR','16237197188','Ms. S. Arulmozhi','Anna University','Dr. K. Sukkiramathi','Ph.D Scholar','External Scholar (Maths)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2016'),(759,'EXT_SCHOLAR','25247691181','Ms. Sudhar Kani A','Anna University','Dr. N. Gopalakrishnan','Ph.D Scholar','External Scholar (Maths)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2025'),(760,'TE2375','23244691366','Ms. P. Divya Prabha','Anna University','Dr. N. Suresh Kumar','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Feb, 2023'),(761,'EXT_SCHOLAR','24234691174','Ms. R. Divya','Anna University','Dr. N. Suresh Kumar','Ph.D Scholar','External Scholar (Information Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(762,'TE2609','23234697370','Mrs. J. M. Priyadharsheni','Anna University','Dr. N. Suresh Kumar','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2023'),(763,'EXT_SCHOLAR','24244697465','Ms. D. Divyabharathi','Anna University','Dr. N. Suresh Kumar','Ph.D Scholar','External Scholar (Information Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(764,'EXT_SCHOLAR','24144697168','Mr. R. Kamalakkannan','Anna University','Dr. N. Suresh Kumar','Ph.D Scholar','External Scholar (Information Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','july, 2024'),(765,'EXT_SCHOLAR','25124691203','Mr. Hari Prakash','Anna University','Dr. N. Suresh Kumar','Ph.D Scholar','External Scholar (Information Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2025'),(766,'EXT_SCHOLAR','24244691303','Ms. C. Kalapana','Anna University','Dr. M. Kalaiarasu','Ph.D Scholar','External Scholar (Information Technology)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(767,'EXT_SCHOLAR','26244691248','Mr. Kayalvizhi','Anna University','Dr.A.Soundarrajan','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(768,'EXT_SCHOLAR','25143697118','Mr. John ananth R','Anna University','Dr.A.Soundarrajan','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Aug, 2025'),(769,'EXT_SCHOLAR','18243691138','Mrs. N. Subhalakshmi','Anna University','Dr. S. Allirani','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2017'),(770,'TE2585','24133691190','Mr. B. Sridhar','Anna University','Dr. S. Allirani','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Dec, 2023'),(771,'EXT_SCHOLAR','24233697146','Mrs. D. Priyadharshini','Anna University','Dr. S. Allirani','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(772,'EXT_SCHOLAR','17123697120','Mr. R. Premkumar','Anna University','Dr. R. Shanmuga sundaram','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','March, 2017'),(773,'EXT_SCHOLAR','24243697104','Ms. Nandhini M','Anna University','Dr. R. Shanmuga sundaram','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(774,'EXT_SCHOLAR','1513369732','Mr. S. Dhamodharan','Anna University','Dr. K. Sebasthirani','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2015'),(775,'EXT_SCHOLAR','16193697105','Mr. G. Rajesh','Anna University','Dr. K. Sebasthirani','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Sep, 2016'),(776,'EXT_SCHOLAR','17144697180','Mr. R. Daniel Raj','Anna University','Dr. K. Sebasthirani','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(777,'EXT_SCHOLAR','24243691179','J. Jeayamani','Anna University','Dr. K. Sebasthirani','Ph.D Scholar','External Scholar (Electrical and Electronics Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(778,'EXT_SCHOLAR','21234697455','Ms. T. Divya','Anna University','Dr. G. Gopu','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Nov, 2021'),(779,'EXT_SCHOLAR','24243691233','Ms. B. Chistyjuliet','Anna University','Dr. G. Gopu','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(780,'EXT_SCHOLAR','24224197531','Ms. D. Sangeetha','Anna University','Dr. G. Gopu','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jul, 2024'),(781,'EXT_SCHOLAR','26144691127','Mr.Palvin Muthesh','Anna University','Dr. G. Gopu','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(782,'EXT_SCHOLAR','26243691107','Ms.S.S.Karthikadevi','Anna University','Dr. G. Gopu','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(783,'EXT_SCHOLAR','17143691180','Mr. E.  Esakki Vigneswaran','Anna University','Dr. S. Jayanthy','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2016'),(784,'TE2596','21254697176','Ms. R. S. Ramya','Anna University','Dr. S. Jayanthy','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Sep, 2021'),(785,'EXT_SCHOLAR','23244691103','Ms. S. Vidya Priya Darcini','Anna University','Dr. S. Jayanthy','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2022'),(786,'TE2607','23139697207','Mr. P. Mohan Raj','Anna University','Dr. S. Jayanthy','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2023'),(787,'EXT_SCHOLAR','24259697215','Ms. I. Mohitha','Anna University','Dr. S. Jayanthy','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(788,'TE2427','22144697269','Mr. M. Selvaganesh','Anna University','Dr. H. Mangalam','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','July, 2022'),(789,'EXT_SCHOLAR','18134691570','Mr. V. Ganesh','Anna University','Dr. H. Mangalam','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2017'),(790,'EXT_SCHOLAR','22154697149','Mr. S. Karthik','Anna University','Dr. S. P. Vimal','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2022'),(791,'EXT_SCHOLAR','22144691280','Mr. S. Surender Kumar','Anna University','Dr. S. P. Vimal','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2022'),(792,'EXT_SCHOLAR','18144691137','Mr. R. Karthi Kumar','Anna University','Dr. S. P. Vimal','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2017'),(793,'EXT_SCHOLAR','17133697149','Mr. R. Ramachandran','Anna University','Dr. S. P. Vimal','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(794,'EXT_SCHOLAR','18124691236','Mr. P. Ramu','Anna University','Dr. S. P. Vimal','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2017'),(795,'EXT_SCHOLAR','23149697175','C. Satish Kumar','Anna University','Dr. S. P. Vimal','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2023'),(796,'EXT_SCHOLAR','22144697121','Ms. S. Nithyasai','Anna University','Dr. B. Nataraj','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2022'),(797,'EXT_SCHOLAR','22254697124','Ms. K. Parvathy','Anna University','Dr. B. Nataraj','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2022'),(798,'EXT_SCHOLAR','21244691550','Ms. R. Ramya','Anna University','Dr. B. Nataraj','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2021'),(799,'EXT_SCHOLAR','21144697289','Mr. S. Pragadeswaran','Anna University','Dr. B. Nataraj','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Oct , 2021'),(800,'EXT_SCHOLAR','23249697203','R. Krithikaa','Anna University','Dr. B. Nataraj','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2023'),(801,'EXT_SCHOLAR','22234691507','Ms. M. Aiswarya','Anna University','Dr. K. R. Prabha','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Oct, 2022'),(802,'EXT_SCHOLAR','23149697254','B. Manoj kumar','Anna University','Dr. K. R. Prabha','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2023'),(803,'EXT_SCHOLAR','23149697455','G. Mani sankar','Anna University','Dr. K. R. Prabha','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Aug, 2023'),(804,'EXT_SCHOLAR','24249691308','S. Manju','Anna University','Dr. K. R. Prabha','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(805,'EXT_SCHOLAR','24134697136','Mr. Sathish P','Anna University','Dr. S. Lakshmi Narayanan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(806,'EXT_SCHOLAR','25249691159','Ms. Divya V','Anna University','Dr. S. Lakshmi Narayanan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2025'),(807,'EXT_SCHOLAR','25249697237','Ms. K.Bhuvaneshwari','Anna University','Dr. S. Lakshmi Narayanan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(808,'EXT_SCHOLAR','26249691160','Ms.Tamilselvi.R','Anna University','Dr. S. Jayanthy','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(809,'EXT_SCHOLAR','25234691255','Ms. Sridevi P','Anna University','Dr. M. Kasiselvanathan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2025'),(810,'EXT_SCHOLAR','25239691116','Ms. Gayathree K','Anna University','Dr. M. Kasiselvanathan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2025'),(811,'EXT_SCHOLAR','24229691290','Mrs. C E. Rajaprabha','Anna University','Dr. M. Kasiselvanathan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(812,'EXT_SCHOLAR','24243691153','Ms. Prabhavathy','Anna University','Dr. M. Kasiselvanathan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(813,'EXT_SCHOLAR','24243697115','Ms. Kavithamani N','Anna University','Dr. M. Kasiselvanathan','Ph.D Scholar','External Scholar (Electronics and Communication Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(814,'EXT_SCHOLAR','21254697415','Ms. Sruthi Mol P','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Oct, 2021'),(815,'EXT_SCHOLAR','23249697114','Ms. A. J. Jaya Divya','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2023'),(816,'EXT_SCHOLAR','24189691163','Mr. Mohammedkasim M','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(817,'EXT_SCHOLAR','24149697184','Mr. Samraj. S','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(818,'EXT_SCHOLAR','25139697270','Mr.A.Michael','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(819,'EXT_SCHOLAR','25139697127','Ms.V.G.Gayathri','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(820,'EXT_SCHOLAR','25139697113','Ms.S..Gayathri','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(821,'EXT_SCHOLAR','26244691430','Ms.A.Vanitha','Anna University','Dr. N. Sathish Kumar','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(822,'EXT_SCHOLAR','26257691245','Kavya K S','Anna University','Dr.Vishnu Vardhan','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(823,'EXT_SCHOLAR','25249691142','Ms. Archana D','Anna University','Dr. V. Radhika','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2025'),(824,'EXT_SCHOLAR','25249697228','Ms.Shalini','Anna University','Dr. V. Radhika','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(825,'EXT_SCHOLAR','23197691174','Mr. M. K. Sumesh','Anna University','Dr. Deepa B. Prabhu','Ph.D Scholar','External Scholar (Biomedical Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2022'),(826,'EXT_SCHOLAR','22243697126','Ms. D.','Anna University','Electronics and Instrumentation Engineering','Ph.D Scholar','External Scholar (Kavitha)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dr. B. Sharmila'),(827,'EXT_SCHOLAR','21244697584','Ms. A.','Anna University','Electronics and Instrumentation Engineering','Ph.D Scholar','External Scholar (Reethika)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dr. B. Sharmila'),(828,'EXT_SCHOLAR','24249697233','Mrs. Ramya S','Anna University','Dr. B. Sharmila','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2024'),(829,'EXT_SCHOLAR','21234691237','Ms. Pradeepa','Anna University','Dr. B. Sharmila','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2025'),(830,'EXT_SCHOLAR','25249697110','Keerthana sree','Anna University','Dr. B. Sharmila','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','July, 2025'),(831,'EXT_SCHOLAR','21144691302','Mr. S. Saravanakumar','Anna University','Dr. V. Rukkumani','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2021'),(832,'EXT_SCHOLAR','21244691424','Ms. V. Manimegalai','Anna University','Dr. V. Rukkumani','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2021'),(833,'EXT_SCHOLAR','21244691359','Ms. A. Gayathri','Anna University','Dr. V. Rukkumani','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2021'),(834,'EXT_SCHOLAR','17143697244','Mr. M. Karthick','Anna University','Dr. V. Rukkumani','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(835,'EXT_SCHOLAR','17134697381','Mr. M. Mailsamy','Anna University','Dr. V. Rukkumani','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(836,'EXT_SCHOLAR','18134691472','Mr. V. Moorthy','Anna University','Dr. V. Rukkumani','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2017'),(837,'TE2655','23133691189','Mr. P. Balaji','Anna University','Dr. D. Devasena','Ph.D Scholar','Sri Ramakrishna Engineering College','Provisionally Registered','2026-07-26 12:50:11',NULL,'Internal','Dec, 2022'),(838,'EXT_SCHOLAR','24243691183','Ms. S. Kasthuri','Anna University','Dr. D. Devasena','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2023'),(839,'EXT_SCHOLAR','25234697265','Ms.S.Rajeshwari','Anna University','Dr. D. Devasena','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jul,2025'),(840,'EXT_SCHOLAR','25244697272','Ms.D.Brindha','Anna University','Dr. D. Devasena','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jul,2025'),(841,'EXT_SCHOLAR','25244697101','Mr.K.Aravind','Anna University','Dr. Nagarajapandian','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jul,2025'),(842,'EXT_SCHOLAR','25259697159','Mr.Neethu krishnan','Anna University','Dr. Nagarajapandian','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jul,2025'),(843,'EXT_SCHOLAR','26299691239','Ms.S.Sangeetha','Anna University','Dr. Nagarajapandian','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(844,'EXT_SCHOLAR','26299691286','Ms.U.Amritha','Anna University','Dr. Nagarajapandian','Ph.D Scholar','External Scholar (Electronics and Instrumentation Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jan, 2026'),(845,'EXT_SCHOLAR','21248697110','Ms. V. Vishnu Priya','Anna University','Dr. R. Mary Metilda','Ph.D Scholar','External Scholar (Management Studies)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Sep, 2021'),(846,'EXT_SCHOLAR','20248691101','Ms. S. D. Shamini','Anna University','Dr. R. Mary Metilda','Ph.D Scholar','External Scholar (Management Studies)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Dec, 2019'),(847,'EXT_SCHOLAR','17158697105','Ms. A. Grace Antony Rose','Anna University','Dr. R. Mary Metilda','Ph.D Scholar','External Scholar (Management Studies)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','June, 2017'),(848,'EXT_SCHOLAR','25248691115','Ms. Jenifer Chrisla T','Anna University','Dr. S. Krishnaprabha','Ph.D Scholar','External Scholar (Management Studies)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Feb, 2025'),(849,'EXT_SCHOLAR','25231697103','Deepika S','Anna University','Dr.S.Hema','Ph.D Scholar','External Scholar (Civil Engineering)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','Jul, 2025'),(850,'EXT_SCHOLAR','917530089996    \r------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------',':X','Anna University','CJ','Ph.D Scholar','External Scholar (ha+)','Provisionally Registered','2026-07-26 12:50:11',NULL,'External','KH'),(851,'TE0005',NULL,'Dr.R.BRINDHA',NULL,NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(852,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(853,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(854,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(855,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(856,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(857,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(858,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(859,'TE0005',NULL,'Dr.R.BRINDHA','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(860,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','31/07/2026',NULL,NULL,NULL),(861,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(862,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(863,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(864,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(865,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(866,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(867,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(868,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(869,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(870,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(871,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(872,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','01/08/2026',NULL,NULL,NULL),(873,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','03/08/2026',NULL,NULL,NULL),(874,'TE0005',NULL,'','Anna University',NULL,NULL,NULL,'Ongoing','03/08/2026',NULL,NULL,NULL);
/*!40000 ALTER TABLE `staff_scholars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_seed_money`
--

DROP TABLE IF EXISTS `staff_seed_money`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_seed_money` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `staff_name` longtext,
  `title` longtext,
  `faculty_role` longtext,
  `sanctioned_date` longtext,
  `duration` longtext,
  `amount` double DEFAULT NULL,
  `file` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_seed_money`
--

LOCK TABLES `staff_seed_money` WRITE;
/*!40000 ALTER TABLE `staff_seed_money` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_seed_money` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_supervisor`
--

DROP TABLE IF EXISTS `staff_supervisor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_supervisor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` longtext,
  `res_sup_id` longtext,
  `staff_name` longtext,
  `supj` longtext,
  `university` longtext,
  `internal` int DEFAULT NULL,
  `external` int DEFAULT NULL,
  `scholar` longtext,
  `date` longtext,
  `recognition_month_year` longtext,
  `file` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_supervisor`
--

LOCK TABLES `staff_supervisor` WRITE;
/*!40000 ALTER TABLE `staff_supervisor` DISABLE KEYS */;
INSERT INTO `staff_supervisor` VALUES (1,'TE0451','2840014','Dr.M.S.GEETHA DEVASENA','Software Engineering and Testing, Computational Intelligence, High Performance Computing, Machine Learning, Deep Learning','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(2,'TE0455','4140001','Dr.R.MADHUMATHI','Cloud Computing, Internet of Things, Artificial Intelligence, Data Analytics, Quantum Computing','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(3,'TE2125','2740090','Dr.P.MATHIYALAGAN','Data Mining, Computer Networks, Distributed System, Image Processing','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(4,'TE2930','2740110','Dr.H.MANGALAM','VLSI Design, Communication, Image processing, QCA technology','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(5,'TE2932','2530048','Dr.S.JAYANTHY','VLSI Design and Testing, AI/ML, Embedded systems and IOT, Communication, Security.','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(6,'TE0337','2830003','Dr.G.GOPU','Health Care, Biomedical, Image Processing, IoT, Instrumentation','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(7,'TE0398','2840041','Dr.B.NATARAJ','RF Communication, Wireless Communication and Networks, VLSI Signal and Image Processing, IoT, AI/ML','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(8,'TE2111','4590014','Dr.T.R.SATHISHKUMAR','Wireless Communication, Wireless Sensor Networks, VLSI Signal Processing, Antennas, Embedded Systems and IoT','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(9,'TE0396','2840151','Dr.S.P.VIMAL','Applied electronics, Information and Communication Engineering, Embedded systems and IoT, Deep Learning, Sensors and systems','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(10,'TE1211','3640004','Dr.K.R.PRABHA','Image Processing, AI/ML, Embedded Systems and IoT, Wireless Communication, VLSI Signal Processing','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(11,'TE1463','4140052','Dr.S.LAKSHMI NARAYANAN','Image Processing, Signal Processing, Wireless Communication, Computer Networks','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(12,'TE1241','4490002','Dr.M.KASISELVANATHAN','Electronics & Communication, Optimization Techniques, Machine Learning, Information Technology, Electric Vehicles','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(13,'TE2751','2130227','Dr.A.SOUNDARRAJAN','Applied Electronics, Embedded systems, Soft Computing, Intelligent Automation Systems, Cybersecurity and data analytics','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(14,'TE0235','2930031','Dr.S.ALLIRANI','Electrical Machine Design, Finite Element Analysis, Electric Drives and Control, Electric Vehicle Prediction Algorithms, Soft Computing Techniques','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(15,'TE2862','2930041','Dr.S.SAKTHIVEL','Control Techniques for Power Converters, Power Electronics Applications to Power System, Signal Processing Applications, Soft computing Techniques','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(16,'TE0237','2730023','Dr.K.SEBASTHI RANI','Power Electronics and Drives, Power Quality, Soft Computing techniques, Control Systems, Electric Vehicles','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(17,'TE1313','4630023','Dr.R.KRISHNAKUMAR','Renewable Energy, Power System Reliability, Optimization Techniques, Electric Vehicles','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(18,'TE0128','2720044','Dr.P.KARUPPUSWAMY','Manufacturing, Machining, Maintenance, Materials Engineering','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(19,'TE0129','3320021','Dr.C.BHAGYANATHAN','Materials, Welding, Coatings, Manufacturing','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(20,'TE2201','2420556','Dr.J.YOGANANDH','Tribology, Surface Engineering, Welding','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(21,'TE2352','2720053','Dr.N.GUNASEKAR','Renewable Energy, Thermal Engineering, Solar Energy','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(22,'TE2264','4520026','Dr.T.VELMURUGAN','Friction Stir Process, Engineering Design, Mechanical Engineering, Composites','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(23,'TE1232','4120163','Dr.B.BRAILSON MANSINGH','Thermal Management, Polymer Composites, Natural Fiber, Filler Material','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(24,'TE2153','4320005','Dr.A.VADIVEL','Internal Combustion Engine, Biofuels, Thermal Barrier Coating, Thermal Engineering','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(25,'TE2062','4420020','Dr.S.OMPRAKASAM','Welding Technology, Metallurgy, Composite Materials, Optimization Techniques','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(26,'TE2366','4720011','Dr.R.RAGHU','Additive Manufacturing, Materials Science, Metallurgy, Mechanical Engineering','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(27,'TE0505','4140158','Dr.M.KALAIARASU','Data Mining, Machine Learning','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(28,'TE0236','2630004','Dr.R.SHANMUGASUNDARAM','Power Electronics, Drives and Control, Intelligent Control, Control System, Adaptive Control','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(29,'TE0340','2930057','Dr.B.SHARMILA','Image Processing, Control systems, Intelligent system design, Modelling, Sensors and Measurements','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(30,'TE0341','2930015','Dr.V.RUKKUMANI','Sensors and IoT, VLSI Design, Instrumentation, Low power VLSI, Data acquisition','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(31,'TE0343','3940005','Dr.D.DEVASENA','Process control and Automation, Sensor Fabrication, AI Based Image Processing, Signal and image processing, Sensors and Instrumentation','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(32,'TE5030','4530006','Dr.M.NAGARAJAPANDIAN','Industrial Process control Controller Design, Optimal control, Optimization Techniques, Machine learning, Sensors and Instrumentation','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(33,'TE1297','2340306','Dr.S.SATHISH','Wireless communication, Biomedical Instrumentation, Signal processing, RF Antenna design, Health care','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(34,'TE0347','4290018','Dr.V.RADHIKA','Embedded system, VLSI, Artificial intelligence, Health care, Instrumentation','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(35,'TE2475','3950005','Dr.DEEPA B.PRABHU','Biomaterials, Nanomaterials, Medical Instrumentation, Health care, Electronic sensing system','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(36,'TE2705','4350013','Dr.P.VISHNUVARDHAN','Energy storage conversion, Batteries, Supercapacitors, Nanofluids, Bioinformatics','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(37,'TE2356','8620056','Mr.R.MOHAN','Materials Processing, Manufacturing, Aeronautical, Fluid Mechanics, Heat Transfer','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(38,'TE0168','4220031','Dr.C.J.THOMAS RENALD','Thermal, Energy, Shock Waves, Propulsion','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(39,'TE2444','3010008','Dr.S.HEMA','Water Quality, Wastewater Management, Solid waste, Air Pollution Control','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(40,'TE2446','2710010','Dr.S.KANCHANA','Industrial Wastewater Treatment, Construction Safety, Environmental Engineering','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(41,'TE1155','2320261','Dr.A. MURUGARAJAN','Manufacturing and Metrology Material Processing Optimization and Machine Tools','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(42,'TE1157','4020056','Dr.R.SUDHAKAR','Mechanical Engineering, Mechatronics, Robotics, Industrial Automation','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(43,'TE0504','2740102','Dr.V.KARPAGAM','Artificial Intelligence, Computer Vision, Cyber Security, Information retrieval, Responsible AI','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(44,'TE2132','4140010','Dr.T.ANITHA','Data Mining, Machine Learning, Image Processing, Deep Learning','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(45,'TE0456','3940017','Dr.R.KINGSY GRACE','IoT and Cloud Computing, High Performance Computing, Machine Learning, Air Pollution Monitoring','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(46,'TE0450','2840059','Dr.A.GRACE SELVARANI','Medical Image Processing, Image Processing, Cloud Computing, Software Engineering','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(47,'TE1251','3140048','Dr.R.ANURADHA','Machine Learning, Fuzzy Logic, Data Mining, Artificial Intelligence','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(48,'TE1237','2880036','Dr.S.KRISHNAPRABHA','Finance, Marketing, HR, Business Analytics','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(49,'TE2028','2780011','Dr.R.MARY METILDA','Marketing, HR, Operations and Finance','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(50,'TE2457','4070006','Dr.N.GOPALAKRISHNAN','Neural Networks, Stability Theory, Differential Equations, Stochastic Systems','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(51,'TE0045','4070003','Dr.D.INDHUMATHY','Stochastic Processes, Probability and Queuing Theory, Differential Equations, Graph Theory, Fuzzy Logic','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(52,'TE2013','2370308','Dr.P.MAHESWARI NAIK','Operator Theory, Graph Theory, Topology','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(53,'TE0041','3470035','Dr.K.SUKKIRAMATHI','Stochastic Processes, Graph theory, Operator theory, Fuzzy logic','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(54,'TE2508','3970010','Dr.V.THARANIDHARAN','Control Theory, Mathematical Modelling, Differential Equations, Computational Methods, Optimization Techniques','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(55,'TE0011','2770087','Dr.M.RM.KRISHNAPPA','Thin Films, Materials Science, Nano Technology, Spectroscopy','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(56,'TE1456','2470103','Dr.S.DEIVANAYAKI','Conducting Polymers, Nano Composites, Thin Films, Solar Cell Applications','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(57,'TE0014','2970119','Dr.M.CHITRA','Gas Sensors, Nanomaterials, Supercapacitors','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(58,'TE0015','4170065','Dr.R.VASANTHAPRIYA','Semiconducting Metal oxide, Nanomaterials, Gas Sensors, Super capacitors, Solar Cells','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(59,'TE2579','4170007','Dr.A.LEGGINS','Nanotechnology, Soft Matter Physics, Physicochemical Mechanisms, Biomaterials, Waste management system','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(60,'TE2424','2870112','Dr.J.SURESH','Bionanomaterials, Greener Synthesis, Biosynthesis, Nanoparticles','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(61,'TE2888','2270570','Dr.M.SELLADURAI','Polymer Chemistry, Organic Chemistry, High Performance Polymers','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL),(62,'TE2612','4170027','Dr.S.HARIGANESH','Chemistry Photocatalysis Nanochemistry Metalorganic Framework Copper Spinels','Anna University',0,0,NULL,'2026-07-26 12:15:30',NULL,NULL);
/*!40000 ALTER TABLE `staff_supervisor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_user`
--

DROP TABLE IF EXISTS `staff_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_user` (
  `staff_id` varchar(255) NOT NULL,
  `password` longtext,
  `file` longtext,
  `is_relieved` int DEFAULT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_user`
--

LOCK TABLES `staff_user` WRITE;
/*!40000 ALTER TABLE `staff_user` DISABLE KEYS */;
INSERT INTO `staff_user` VALUES ('NT2785','$2a$10$w9kYVf0SqiyRn83LrWzaz.7K7fogBR/4arbH6bSPrCrW70hPtEcUG',NULL,0),('TE0005','TE0005',NULL,0),('TE0006','TE0006',NULL,0),('TE0011','TE0011',NULL,0),('TE0014','TE0014',NULL,0),('TE0015','TE0015',NULL,0),('TE0019','TE0019',NULL,0),('TE0028','TE0028',NULL,0),('TE0029','TE0029',NULL,0),('TE0030','TE0030',NULL,0),('TE0031','TE0031',NULL,0),('TE0032','TE0032',NULL,0),('TE0035','TE0035',NULL,0),('TE0039','TE0039',NULL,0),('TE0041','TE0041',NULL,0),('TE0044','TE0044',NULL,0),('TE0045','TE0045',NULL,0),('TE0102','TE0102',NULL,0),('TE0120','TE0120',NULL,0),('TE0125','TE0125',NULL,0),('TE0128','TE0128',NULL,0),('TE0129','TE0129',NULL,0),('TE0168','TE0168',NULL,0),('TE0235','TE0235',NULL,0),('TE0236','TE0236',NULL,0),('TE0237','TE0237',NULL,0),('TE0240','TE0240',NULL,0),('TE0244','TE0244',NULL,0),('TE0245','TE0245',NULL,0),('TE0337','TE0337',NULL,0),('TE0340','TE0340',NULL,0),('TE0341','TE0341',NULL,0),('TE0343','TE0343',NULL,0),('TE0347','TE0347',NULL,0),('TE0390','TE0390',NULL,0),('TE0393','TE0393',NULL,0),('TE0396','TE0396',NULL,0),('TE0397','TE0397',NULL,0),('TE0398','TE0398',NULL,0),('TE0450','TE0450',NULL,0),('TE0451','TE0451',NULL,0),('TE0452','TE0452',NULL,0),('TE0453','TE0453',NULL,0),('TE0455','TE0455',NULL,0),('TE0456','TE0456',NULL,0),('TE0458','TE0458',NULL,0),('TE0462','TE0462',NULL,0),('TE0501','TE0501',NULL,0),('TE0504','TE0504',NULL,0),('TE0505','TE0505',NULL,0),('TE0506','TE0506',NULL,0),('TE0511','TE0511',NULL,0),('TE0556','TE0556',NULL,0),('TE0755','TE0755',NULL,0),('TE1102','TE1102',NULL,0),('TE1151','TE1151',NULL,0),('TE1155','TE1155',NULL,0),('TE1157','TE1157',NULL,0),('TE1158','TE1158',NULL,0),('TE1162','TE1162',NULL,0),('TE1163','TE1163',NULL,0),('TE1196','TE1196',NULL,0),('TE1203','TE1203',NULL,0),('TE1204','TE1204',NULL,0),('TE1206','TE1206',NULL,0),('TE1211','TE1211',NULL,0),('TE1226','TE1226',NULL,0),('TE1232','TE1232',NULL,0),('TE1237','TE1237',NULL,0),('TE1241','TE1241',NULL,0),('TE1251','TE1251',NULL,0),('TE1271','TE1271',NULL,0),('TE1280','TE1280',NULL,0),('TE1292','TE1292',NULL,0),('TE1297','TE1297',NULL,0),('TE1301','TE1301',NULL,0),('TE1308','TE1308',NULL,0),('TE1312','TE1312',NULL,0),('TE1313','TE1313',NULL,0),('TE1402','TE1402',NULL,0),('TE1404','TE1404',NULL,0),('TE1412','TE1412',NULL,0),('TE1419','TE1419',NULL,0),('TE1424','TE1424',NULL,0),('TE1432','TE1432',NULL,0),('TE1454','TE1454',NULL,0),('TE1456','TE1456',NULL,0),('TE1461','TE1461',NULL,0),('TE1463','TE1463',NULL,0),('TE1554','TE1554',NULL,0),('TE2013','TE2013',NULL,0),('TE2015','TE2015',NULL,0),('TE2027','TE2027',NULL,0),('TE2028','TE2028',NULL,0),('TE2031','TE2031',NULL,0),('TE2038','TE2038',NULL,0),('TE2053','TE2053',NULL,0),('TE2062','TE2062',NULL,0),('TE2108','TE2108',NULL,0),('TE2111','TE2111',NULL,0),('TE2125','TE2125',NULL,0),('TE2132','TE2132',NULL,0),('TE2139','TE2139',NULL,0),('TE2142','TE2142',NULL,0),('TE2143','TE2143',NULL,0),('TE2153','TE2153',NULL,0),('TE2193','TE2193',NULL,0),('TE2201','TE2201',NULL,0),('TE2213','TE2213',NULL,0),('TE2229','TE2229',NULL,0),('TE2243','TE2243',NULL,0),('TE2250','TE2250',NULL,0),('TE2264','TE2264',NULL,0),('TE2273','$2a$10$1agr2KhD9COEGdtnguneKOuL5/akFTzbOZvKo6RmJdHpujftaGheC','TE2273_1785331111507-image.jpg',0),('TE2275','TE2275',NULL,0),('TE2278','TE2278',NULL,0),('TE2279','TE2279',NULL,0),('TE2286','TE2286',NULL,0),('TE2289','TE2289',NULL,0),('TE2290','TE2290',NULL,0),('TE2291','TE2291',NULL,0),('TE2298','TE2298',NULL,0),('TE2313','TE2313',NULL,0),('TE2323','TE2323',NULL,0),('TE2346','TE2346',NULL,0),('TE2347','TE2347',NULL,0),('TE2348','TE2348',NULL,0),('TE2352','TE2352',NULL,0),('TE2356','TE2356',NULL,0),('TE2366','TE2366',NULL,0),('TE2367','TE2367',NULL,0),('TE2372','TE2372',NULL,0),('TE2375','TE2375',NULL,0),('TE2424','TE2424',NULL,0),('TE2427','TE2427',NULL,0),('TE2434','TE2434',NULL,0),('TE2440','TE2440',NULL,0),('TE2444','TE2444',NULL,0),('TE2445','TE2445',NULL,0),('TE2446','TE2446',NULL,0),('TE2455','TE2455',NULL,0),('TE2457','TE2457',NULL,0),('TE2460','TE2460',NULL,0),('TE2463','TE2463',NULL,0),('TE2475','TE2475',NULL,0),('TE2482','TE2482',NULL,0),('TE2496','TE2496',NULL,0),('TE2499','TE2499',NULL,0),('TE2500','TE2500',NULL,0),('TE2508','TE2508',NULL,0),('TE2509','TE2509',NULL,0),('TE2513','TE2513',NULL,0),('TE2519','TE2519',NULL,0),('TE2520','TE2520',NULL,0),('TE2523','TE2523',NULL,0),('TE2533','TE2533',NULL,0),('TE2535','TE2535',NULL,0),('TE2536','TE2536',NULL,0),('TE2537','TE2537',NULL,0),('TE2538','TE2538',NULL,0),('TE2539','TE2539',NULL,0),('TE2540','TE2540',NULL,0),('TE2548','TE2548',NULL,0),('TE2561','TE2561',NULL,0),('TE2571','TE2571',NULL,0),('TE2579','TE2579',NULL,0),('TE2580','TE2580',NULL,0),('TE2582','TE2582',NULL,0),('TE2583','TE2583',NULL,0),('TE2585','TE2585',NULL,0),('TE2586','TE2586',NULL,0),('TE2590','TE2590',NULL,0),('TE2591','TE2591',NULL,0),('TE2596','TE2596',NULL,0),('TE2597','TE2597',NULL,0),('TE2599','TE2599',NULL,0),('TE2601','TE2601',NULL,0),('TE2602','TE2602',NULL,0),('TE2606','TE2606',NULL,0),('TE2607','TE2607',NULL,0),('TE2608','TE2608',NULL,0),('TE2609','TE2609',NULL,0),('TE2611','TE2611',NULL,0),('TE2612','TE2612',NULL,0),('TE2632','TE2632',NULL,0),('TE2636','TE2636',NULL,0),('TE2641','TE2641',NULL,0),('TE2643','TE2643',NULL,0),('TE2650','TE2650',NULL,0),('TE2653','TE2653',NULL,0),('TE2655','TE2655',NULL,0),('TE2658','TE2658',NULL,0),('TE2660','TE2660',NULL,0),('TE2667','TE2667',NULL,0),('TE2676','TE2676',NULL,0),('TE2677','TE2677',NULL,0),('TE2678','TE2678',NULL,0),('TE2684','TE2684',NULL,0),('TE2687','TE2687',NULL,0),('TE2688','TE2688',NULL,0),('TE2691','TE2691',NULL,0),('TE2693','TE2693',NULL,0),('TE2694','TE2694',NULL,0),('TE2704','TE2704',NULL,0),('TE2705','TE2705',NULL,0),('TE2707','TE2707',NULL,0),('TE2710','TE2710',NULL,0),('TE2716','TE2716',NULL,0),('TE2717','TE2717',NULL,0),('TE2725','TE2725',NULL,0),('TE2726','TE2726',NULL,0),('TE2737','TE2737',NULL,0),('TE2738','TE2738',NULL,0),('TE2740','TE2740',NULL,0),('TE2745','TE2745',NULL,0),('TE2746','TE2746',NULL,0),('TE2751','$2a$10$tLsf.aWI9FB7ET36VshjN.3EcG4TQTuhnOh9q2zyo8ENBs.nkWbma',NULL,0),('TE2752','TE2752',NULL,0),('TE2755','TE2755',NULL,0),('TE2765','TE2765',NULL,0),('TE2766','TE2766',NULL,0),('TE2771','TE2771',NULL,0),('TE2781','TE2781',NULL,0),('TE2799','TE2799',NULL,0),('TE2814','TE2814',NULL,0),('TE2815','TE2815',NULL,0),('TE2816','TE2816',NULL,0),('TE2817','TE2817',NULL,0),('TE2821','TE2821',NULL,0),('TE2822','TE2822',NULL,0),('TE2823','TE2823',NULL,0),('TE2825','TE2825',NULL,0),('TE2828','TE2828',NULL,0),('TE2829','TE2829',NULL,0),('TE2830','TE2830',NULL,0),('TE2834','TE2834',NULL,0),('TE2841','TE2841',NULL,0),('TE2847','TE2847',NULL,0),('TE2849','TE2849',NULL,0),('TE2850','TE2850',NULL,0),('TE2853','TE2853',NULL,0),('TE2854','TE2854',NULL,0),('TE2855','TE2855',NULL,0),('TE2857','TE2857',NULL,0),('TE2861','TE2861',NULL,0),('TE2862','TE2862',NULL,0),('TE2876','TE2876',NULL,0),('TE2878','TE2878',NULL,0),('TE2879','TE2879',NULL,0),('TE2880','TE2880',NULL,0),('TE2883','TE2883',NULL,0),('TE2884','TE2884',NULL,0),('TE2888','TE2888',NULL,0),('TE2891','TE2891',NULL,0),('TE2894','TE2894',NULL,0),('TE2904','TE2904',NULL,0),('TE2906','TE2906',NULL,0),('TE2911','TE2911',NULL,0),('TE2914','TE2914',NULL,0),('TE2915','TE2915',NULL,0),('TE2916','TE2916',NULL,0),('TE2927','TE2927',NULL,0),('TE2930','TE2930',NULL,0),('TE2931','TE2931',NULL,0),('TE2932','TE2932',NULL,0),('TE2933','TE2933',NULL,0),('TE2934','TE2934',NULL,0),('TE2935','TE2935',NULL,0),('TE2936','TE2936',NULL,0),('TE2938','TE2938',NULL,0),('TE2940','TE2940',NULL,0),('TE5006','TE5006',NULL,0),('TE5014','TE5014',NULL,0),('TE5022','TE5022',NULL,0),('TE5030','TE5030',NULL,0);
/*!40000 ALTER TABLE `staff_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `university`
--

DROP TABLE IF EXISTS `university`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `university` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uni_name` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `university`
--

LOCK TABLES `university` WRITE;
/*!40000 ALTER TABLE `university` DISABLE KEYS */;
INSERT INTO `university` VALUES (1,'Anna University'),(2,'Bharathiar University'),(3,'Amrita Vishwa Vidyapeetham'),(4,'PSG College of Technology'),(5,'Sathyabama University');
/*!40000 ALTER TABLE `university` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-05 11:02:38
