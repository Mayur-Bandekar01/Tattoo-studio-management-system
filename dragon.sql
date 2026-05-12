CREATE DATABASE  IF NOT EXISTS `dragon_tattoos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dragon_tattoos`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dragon_tattoos
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `artist_id` varchar(20) DEFAULT NULL,
  `service_type` varchar(20) DEFAULT 'tattoo',
  `tattoo_concept` varchar(255) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `extra_details` text,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration_hours` decimal(4,1) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `fk_appt_customer` (`customer_id`),
  KEY `fk_appt_artist` (`artist_id`),
  CONSTRAINT `fk_appt_artist` FOREIGN KEY (`artist_id`) REFERENCES `artist` (`artist_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,2,'DRAG-ART-001','tattoo','lion on hand','uploads/references/ref_2_1773495450.png','{\"service\": \"Tattoo Making\", \"size\": \"Extra Large (30cm+)\", \"placement\": \"Hand\", \"style\": \"Black & Grey\", \"colour_preference\": \"Black & Grey only\", \"notes\": \"i need similar type of tattooo\"}','2026-03-16','12:00:00',4.0,'Done','2026-03-14 13:37:30'),(2,1,'DRAG-ART-001','tattoo','prace symbol on hand','uploads/references/ref_1_1773538615.png','{\"service\": \"Tattoo Making\", \"size\": \"Small (under 5cm)\", \"placement\": \"Other\", \"style\": \"Black & Grey\", \"colour_preference\": \"Black & Grey only\", \"notes\": \"i want this tattoo on right hand placed between knuckles and wrist\"}','2026-03-17','11:00:00',1.0,'Done','2026-03-15 01:36:55'),(3,1,'DRAG-ART-003','tattoo','Tattoo Removal',NULL,'{\"service\": \"Tattoo Removal\", \"tattoo_size\": \"Medium (5u201315cm)\", \"tattoo_color\": \"Black only\", \"body_location\": \"Forearm\", \"tattoo_age\": \"Less than 1 year\", \"sessions_expected\": \"\", \"skin_sensitivity\": \"Sensitive\", \"notes\": \"\"}','2026-03-18','12:00:00',1.0,'Done','2026-03-17 16:42:35'),(4,3,'DRAG-ART-001','tattoo','prace symbol on hand','uploads/references/ref_3_1773768615.png','{\"service\": \"Tattoo Making\", \"size\": \"Medium (5u201315cm)\", \"placement\": \"Hand\", \"style\": \"Black & Grey\", \"colour_preference\": \"Black & Grey only\", \"notes\": \"\"}','2026-03-18','13:00:00',1.0,'Done','2026-03-17 17:30:15'),(5,1,'DRAG-ART-001','tattoo','eagle eye on neck','uploads/references/ref_1_1773910970.jpg','{\"service\": \"Tattoo Making\", \"size\": \"Medium (5u201315cm)\", \"placement\": \"Neck\", \"style\": \"Black & Grey\", \"colour_preference\": \"Black & Grey only\", \"notes\": \"\"}','2026-03-21','10:00:00',2.0,'Done','2026-03-19 09:02:50'),(6,3,'DRAG-ART-001','tattoo','flute on hand','uploads/references/ref_3_1773914811.jpg','{\"service\": \"Tattoo Making\", \"size\": \"Medium (5u201315cm)\", \"placement\": \"Hand\", \"style\": \"Black & Grey\", \"colour_preference\": \"Full Color\", \"notes\": \"\"}','2026-03-21','10:00:00',1.0,'Done','2026-03-19 10:06:51'),(7,2,'DRAG-ART-001','tattoo','katana on hand','uploads/references/ref_2_1773934291.jpg','{\"service\": \"Tattoo Making\", \"size\": \"Medium (5u201315cm)\", \"placement\": \"Hand\", \"style\": \"Black & Grey\", \"colour_preference\": \"Limited Color (2-3 colors)\", \"notes\": \"\"}','2026-03-23','11:00:00',1.0,'Done','2026-03-19 15:31:31'),(11,4,'DRAG-ART-002','tattoo','Art / Sketching — Watercolor Painting','uploads/references/ref_4_1774183511.jpg','{\"service\": \"Art / Sketching\", \"art_type\": \"Watercolor Painting\", \"art_size\": \"A4 (210u00d7297 mm)\", \"colour_preference\": \"Artist\'s choice\", \"deadline\": \"\", \"notes\": \"\"}','2026-03-23','13:00:00',1.0,'Done','2026-03-22 12:45:11'),(12,2,'DRAG-ART-002','tattoo','Art / Sketching — Blood Art','uploads/references/ref_2_1776771785.jpg','{\"service\": \"Art / Sketching\", \"art_type\": \"Blood Art\", \"art_size\": \"A5 (148\\u00d7210 mm)\", \"colour_preference\": \"Artist\'s choice\", \"deadline\": \"\", \"notes\": \"i need this same image in blood art\"}','2026-04-22','11:00:00',2.0,'Done','2026-04-21 11:43:05'),(13,4,'DRAG-ART-002','tattoo','Art / Sketching — Digital Sketch','uploads/references/ref_4_1777471963.jpg','{\"service\": \"Art / Sketching\", \"art_type\": \"Digital Sketch\", \"art_size\": \"A4 (210\\u00d7297 mm)\", \"colour_preference\": \"Artist\'s choice\", \"deadline\": \"\", \"notes\": \"digital sketch art of this image\"}','2026-04-30','11:00:00',1.0,'Done','2026-04-29 14:12:43'),(16,3,'DRAG-ART-002','tattoo','Art / Sketching — Black & White Sketch','uploads/references/ref_3_1777474533.jpg','{\"service\": \"Art / Sketching\", \"art_type\": \"Black & White Sketch\", \"art_size\": \"A4 (210\\u00d7297 mm)\", \"colour_preference\": \"Black & White only\", \"deadline\": \"\", \"notes\": \"\"}','2026-04-30','13:00:00',1.0,'Done','2026-04-29 14:55:33'),(17,5,'DRAG-ART-001','tattoo','bird on side neck','uploads/references/ref_5_1777828260.jpg','{\"service\": \"Tattoo Making\", \"size\": \"Medium (5\\u201315cm)\", \"placement\": \"Other\", \"style\": \"Custom Masterpiece\", \"colour_preference\": \"Black & Grey only\", \"notes\": \"\"}','2026-05-05','12:00:00',NULL,'Rejected','2026-05-03 17:11:00'),(18,4,'DRAG-ART-001','tattoo','trishu on hand','uploads/references/ref_4_1778007076.jpg','{\"service\": \"Tattoo Making\", \"size\": \"Medium (5\\u201315cm)\", \"placement\": \"Hand\", \"style\": \"Custom Masterpiece\", \"colour_preference\": \"Black & Grey only\", \"notes\": \"\"}','2026-05-07','10:00:00',NULL,'Rejected','2026-05-05 18:51:16');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artist`
--

DROP TABLE IF EXISTS `artist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artist` (
  `artist_id` varchar(20) NOT NULL,
  `artist_name` varchar(100) NOT NULL,
  `artist_email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `specialisation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`artist_id`),
  UNIQUE KEY `uq_artist_email` (`artist_email`),
  UNIQUE KEY `idx_artist_id` (`artist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist`
--

LOCK TABLES `artist` WRITE;
/*!40000 ALTER TABLE `artist` DISABLE KEYS */;
INSERT INTO `artist` VALUES ('DRAG-ART-001','Arjun Mehta','arjun@dragon.com','scrypt:32768:8:1$vbCeVrccr9fm1NCL$766f37cb63d281f523dcf8886402be1d070be7ce6008ae7a06f5d8a37224b179010b490b491b418bb90cb0702b72b52fa667517b4c7678432e0dcc112a50a141','9876543210','Tattoo Artist','2026-03-13 19:30:33',NULL),('DRAG-ART-002','Priya Sharma','priya@dragon.com','scrypt:32768:8:1$aLvHOp7WNoDBYnNT$d766cb9abe85f6db3abcf73c03991ffaa57675fadaaa3fbc26ddf859d4c66dc3cd00c356ec01563e323b258a36420dcf293ca92916a3bb5a526156d7f5ee1b19','9876543211','Sketch Artist','2026-03-13 19:30:33',NULL),('DRAG-ART-003','Rahul Verma','rahul@dragon.com','scrypt:32768:8:1$XmHflPojYYlpdUZs$19ec31592995603895003e4cf677b809c35688b7af828025cbaef712986b0d0bd4884e20286b69182adb9263f74937449487894e804360931ac2c279df2354a0','9876543212','Laser Removal Specialist','2026-03-13 19:30:33',NULL);
/*!40000 ALTER TABLE `artist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `insta_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `uq_customer_email` (`customer_email`),
  UNIQUE KEY `idx_customer_email` (`customer_email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Venom','venomousbeast107@gmail.com','scrypt:32768:8:1$Kg6jegfZ60dSi28x$7cac700a5f3493afe2d2d64184ee6dfb5f7334b393d3fad1ed9f98df81f6dda906ce7b3bfa058a1b971c9fa1486ff5cde037e2fc792ccf6576a03316dd756aad','1111111111','','2026-03-13 19:37:33'),(2,'Jonathan Baker','jonathanbaker@gmail.com','scrypt:32768:8:1$9GiQ3Ac78715HQK0$8ed96170d195fb6d5c8c75eb02cf84d3397dfe56fd9be69458d1fc977db965575ea76e3fb3eda525c94c261e62edfdb77d6682417e08389c23db5c6e2da37df5','6121868868','_jonathan_baker_','2026-03-14 13:33:41'),(3,'Mayur','mayurbandekar480@gmail.com','scrypt:32768:8:1$gmfXIcJ3BG44J0ca$658d698b8946f9eb591963a43b8eab8a6d377f9c823f1c6e855bd798bb92ed387277f517e8f8bb2565492cfe4f3655ff5e557044d45eab307ac9820bdc080088','6360174312','','2026-03-17 17:29:18'),(4,'Daria Pratt','Daria@gmail.com','scrypt:32768:8:1$CjTaHacv6og5PKCR$10a5014e60cfb218a4e59fdd08962a285de4c9cf3550b21f6acbd92a893bc18d6db12c54839ab9ce0d3f4200d30c27dedfdc813391edbc369fe45a0c8168f553','7485694152','','2026-03-22 12:43:31'),(5,'Test Customer','testcustomer@example.com','scrypt:32768:8:1$GUJ6W5oEHXY6HWmC$86e03e09f11094b691cf2b746b3ea26ade0b35c9b5bd9786f83a95f009a640eb480738b045f859de36403e1c224e7b533a6375dea1528e5b7dee886b8f463bfa','1234567890','','2026-04-25 19:53:26'),(6,'Debug Customer','debug@example.com','scrypt:32768:8:1$oEIPBWn9HEQPwaqq$aa457c39d70783d0f9e5143b311443b2a822fa795493955aa951722cc64e32fc4ad9530a61042719385d5171a55fb04607d2522dc52339bb5a3997c56a5de339','9876543210','','2026-04-26 15:03:53'),(7,'Test Customer','test@customer.com','scrypt:32768:8:1$tuaWdM1x5BI6FFqp$cbfe0928793f7b45927f978a2e553bda5da727b22ebeaf5b6d5aa54a7233b32ee86a4a7f1af51e69cf2cd0573d165fe90b2be4997ecb1d263bbbb87b38c4d07c','1234567890','','2026-04-26 15:41:46'),(8,'Test User','test@example.com','scrypt:32768:8:1$J5895WAfrSZB4cy5$2314cfddc70eae4e8f6bf5677b0ee6ee7d02926bdc79413374cc3546fd4397a6f38d93c120fbc7e78dfa35a623a8dae9fc0fef914bb4237f0aa541b3ef0b52f1','1234567890','','2026-04-27 10:38:51'),(9,'Test User Two','test2@example.com','scrypt:32768:8:1$beEqkSbL3TjNC3xn$152d709bc976d89366624d55165af045e0a64ea93cbaf834428dd3e2c25879492182b224283d10d6302b5ee06a0bf37bb761104fc131f9224c50e2b879788545','1234567891','','2026-04-27 10:41:21'),(10,'vishal benni','vishalbennni@gmail.com','scrypt:32768:8:1$QFiJ6hIL2l1eGegH$29c67e095665cf1da4ca07f486cc89601c56aaf7a96f0f9410db78ce41b55b7c96ce517ec2c8a1176852441bd94f0d307f02abc52250006d7e9600bc082f0dbe','9945874314','_vishal_benni_','2026-05-04 19:02:35');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery` (
  `gallery_id` int NOT NULL AUTO_INCREMENT,
  `artist_id` varchar(20) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `style` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`gallery_id`),
  KEY `fk_gallery_artist` (`artist_id`),
  CONSTRAINT `fk_gallery_artist` FOREIGN KEY (`artist_id`) REFERENCES `artist` (`artist_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
INSERT INTO `gallery` VALUES (1,'DRAG-ART-001','uploads/gallery/gallery_DRAG-ART-001_1773496586.png','lion on hand','Blackwork','2026-03-14 13:56:26'),(2,'DRAG-ART-001','uploads/gallery/gallery_DRAG-ART-001_1774094082.jpg','Reindeer','Geometric','2026-03-21 11:54:42'),(3,'DRAG-ART-002','uploads/gallery/gallery_DRAG-ART-002_1774096039.png','sketch art of a girl','','2026-03-21 12:27:19'),(4,'DRAG-ART-002','uploads/gallery/gallery_DRAG-ART-002_1775332289.png','sketch of zoro','Pencil Sketch','2026-04-04 19:51:29'),(5,'DRAG-ART-001','uploads/gallery/art_DRAG-ART-001_1778140596.jpg','virat kohli','Tattoo','2026-05-07 07:56:36');
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiry`
--

DROP TABLE IF EXISTS `inquiry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inquiry` (
  `inquiry_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `inquiry_type` enum('tattoo','sketch','removal','general') NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) DEFAULT 'New',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `artist_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`inquiry_id`),
  KEY `fk_inquiry_artist` (`artist_id`),
  CONSTRAINT `fk_inquiry_artist` FOREIGN KEY (`artist_id`) REFERENCES `artist` (`artist_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiry`
--

LOCK TABLES `inquiry` WRITE;
/*!40000 ALTER TABLE `inquiry` DISABLE KEYS */;
INSERT INTO `inquiry` VALUES (1,'mayu','mayu@gmail.com',NULL,'sketch','hii its me mayuuuuuuuuuuu','New','2026-05-04 13:16:54',NULL),(2,'Vikas pattar','vikaspatter@gmail.com','6546546146','general','help me to enhance my art','New','2026-05-05 17:50:46',NULL),(3,'kalmrsh','kalmesh@gmail.com','8978979877','tattoo','weofijfwefnownfow','New','2026-05-06 07:45:33','DRAG-ART-001'),(4,'suresh','suresh@gmail.com','6549549844','removal','srtereryeyer','New','2026-05-06 08:01:46','DRAG-ART-003');
/*!40000 ALTER TABLE `inquiry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `quant_stock` decimal(8,2) NOT NULL DEFAULT '0.00',
  `reorder_level` decimal(10,2) DEFAULT '5.00',
  `unit_cost` decimal(10,2) DEFAULT '0.00',
  `artist_type` varchar(20) NOT NULL DEFAULT 'all',
  `artist_id` varchar(20) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `fk_inventory_artist` (`artist_id`),
  CONSTRAINT `fk_inventory_artist` FOREIGN KEY (`artist_id`) REFERENCES `artist` (`artist_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,'Black Ink','Ink','ml',300.00,50.00,0.50,'tattoo','DRAG-ART-001','2026-04-11 12:58:41','2026-04-11 13:42:28'),(2,'Red Ink','Ink','ml',300.00,30.00,0.60,'tattoo','DRAG-ART-001','2026-04-11 12:58:41','2026-04-11 13:42:28'),(3,'Blue Ink','Ink','ml',200.00,30.00,0.60,'tattoo','DRAG-ART-001','2026-05-04 15:43:25','2026-05-04 15:43:25'),(4,'Tattoo Needle 3RL','Needle','pcs',100.00,20.00,5.00,'tattoo','DRAG-ART-001','2026-04-11 12:58:41','2026-04-11 13:42:28'),(5,'Tattoo Needle 5RS','Needle','pcs',100.00,20.00,5.00,'tattoo','DRAG-ART-001','2026-04-11 12:58:41','2026-04-11 13:42:28'),(13,'Dynamic Black Ink','Ink','ml',180.00,60.00,23.33,'tattoo','DRAG-ART-001','2026-05-04 15:50:23','2026-05-04 15:50:23'),(14,'Dynamic Red Ink','Ink','ml',120.00,60.00,21.67,'tattoo','DRAG-ART-001','2026-05-04 00:54:25','2026-05-04 00:54:25'),(15,'Dynamic Blue Ink','Ink','ml',60.00,60.00,21.67,'tattoo','DRAG-ART-001','2026-05-04 15:50:36','2026-05-04 15:50:36'),(16,'Dynamic Green Ink','Ink','ml',120.00,60.00,21.67,'tattoo','DRAG-ART-001','2026-05-04 00:54:25','2026-05-04 00:54:25'),(18,'Sketch Pencils HB','Other','pcs',20.00,5.00,10.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(19,'Sketch Pencils HB','Other','pcs',20.00,5.00,10.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(20,'Sketch Pencils 2B','Other','pcs',20.00,5.00,10.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(21,'Sketch Pencils 4B','Other','pcs',20.00,5.00,10.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(22,'Charcoal Sticks','Other','pcs',15.00,4.00,15.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(23,'Ink Pens 0.1mm','Other','pcs',10.00,3.00,25.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(24,'Ink Pens 0.3mm','Other','pcs',10.00,3.00,25.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(25,'Watercolor Set 12 colors','Pigment','Sets',5.00,2.00,200.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(26,'Acrylic Paint Set','Pigment','Sets',3.00,1.00,350.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(27,'Canvas A4','Canvas','Sheets',29.00,10.00,15.00,'art','DRAG-ART-002','2026-04-20 14:54:14','2026-04-20 14:54:14'),(28,'Canvas A3','Canvas','Sheets',20.00,8.00,25.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(29,'Watercolor Paper A4','Paper','Sheets',50.00,15.00,8.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(30,'Sketch Paper A3','Paper','Sheets',40.00,10.00,5.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(31,'Round Brushes Set','Brush','Sets',5.00,2.00,150.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(32,'Flat Brushes Set','Brush','Sets',5.00,2.00,150.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(33,'Eraser Set','Other','Packs',10.00,3.00,20.00,'art','DRAG-ART-002','2026-04-11 12:58:41','2026-04-11 13:42:28'),(34,'Palette Mixing Tray','Other','pcs',3.00,1.00,80.00,'art','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(35,'Nitrile Gloves','Glove','Pairs',60.00,10.00,3.00,'all','DRAG-ART-001','2026-04-27 13:49:27','2026-04-27 13:49:27'),(36,'Sanitizer','Aftercare','ml',7501.00,500.00,0.16,'all','DRAG-ART-001','2026-05-04 15:40:56','2026-05-04 15:40:56'),(37,'Needle','Needle','pcs',8.02,5.00,20.00,'all','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25'),(38,'Syringe (Blood Extraction Tool)','Blood Art','pcs',50.00,10.00,120.00,'all','DRAG-ART-002','2026-05-04 00:54:25','2026-05-04 00:54:25');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_usage`
--

DROP TABLE IF EXISTS `inventory_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `item_id` int NOT NULL,
  `qty_used` decimal(10,2) NOT NULL,
  `artist_id` varchar(50) NOT NULL,
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usage_id`),
  KEY `fk_usage_appointment` (`appointment_id`),
  KEY `fk_usage_item` (`item_id`),
  KEY `fk_usage_artist` (`artist_id`),
  CONSTRAINT `fk_usage_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_artist` FOREIGN KEY (`artist_id`) REFERENCES `artist` (`artist_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_item` FOREIGN KEY (`item_id`) REFERENCES `inventory` (`item_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_usage`
--

LOCK TABLES `inventory_usage` WRITE;
/*!40000 ALTER TABLE `inventory_usage` DISABLE KEYS */;
INSERT INTO `inventory_usage` VALUES (1,11,37,0.98,'DRAG-ART-001','2026-04-21 13:01:38'),(2,1,3,100.00,'DRAG-ART-001','2026-05-04 15:43:25');
/*!40000 ALTER TABLE `inventory_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `owner_id` int NOT NULL,
  `total_amt` decimal(10,2) NOT NULL,
  `concept_type` varchar(255) DEFAULT NULL,
  `pay_status` enum('Pending','Paid','Under Review') DEFAULT 'Pending',
  `generated_date` date NOT NULL,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `uq_invoice_appointment` (`appointment_id`),
  KEY `fk_invoice_owner` (`owner_id`),
  CONSTRAINT `fk_invoice_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invoice_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`owner_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,1,1,5000.00,'Tattoo','Paid','2026-03-14'),(2,2,1,2000.00,'Tattoo','Paid','2026-03-15'),(3,3,1,2000.00,'Removal','Paid','2026-03-18'),(4,4,1,2000.00,'Touch-up','Paid','2026-03-18'),(5,5,1,5000.00,'Tattoo','Paid','2026-03-18'),(6,6,1,2000.00,'Tattoo','Paid','2026-03-19'),(7,7,1,3000.00,'Tattoo','Paid','2026-03-21'),(8,11,1,1000.00,'Sketch','Paid','2026-03-23'),(9,12,1,1500.00,'Sketch','Paid','2026-04-22'),(10,13,1,1000.00,'Sketch','Paid','2026-04-30'),(11,16,1,1000.00,'Sketch','Paid','2026-04-30');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `sender_id` varchar(50) NOT NULL,
  `sender_role` enum('customer','artist') NOT NULL,
  `receiver_id` varchar(50) NOT NULL,
  `receiver_role` enum('customer','artist') NOT NULL,
  `appointment_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint DEFAULT '0',
  PRIMARY KEY (`message_id`),
  KEY `idx_receiver` (`receiver_id`,`receiver_role`,`is_read`),
  KEY `idx_thread` (`sender_id`,`receiver_id`,`appointment_id`),
  KEY `fk_msg_appointment` (`appointment_id`),
  CONSTRAINT `fk_msg_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`appointment_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'DRAG-ART-001','artist','3','customer',NULL,'hiii','2026-03-30 07:13:15',1),(4,'DRAG-ART-001','artist','2','customer',7,'hii','2026-03-30 14:49:59',1),(5,'DRAG-ART-001','artist','2','customer',7,'hello','2026-03-30 14:50:03',1),(7,'DRAG-ART-001','artist','2','customer',NULL,'aaaaaaaaaaaaaaaaaaaaa','2026-03-30 15:12:28',1),(8,'DRAG-ART-001','artist','2','customer',NULL,'hi bro! nice to meet you','2026-03-30 15:12:44',1),(13,'DRAG-ART-001','artist','3','customer',NULL,'hello','2026-03-30 16:01:47',1),(20,'DRAG-ART-001','artist','3','customer',NULL,'hii man','2026-04-01 19:58:28',1),(21,'3','customer','3','customer',NULL,'hii bro','2026-04-01 19:58:56',1),(22,'4','customer','DRAG-ART-002','artist',NULL,'hii','2026-04-01 20:05:24',1),(24,'4','customer','DRAG-ART-002','artist',NULL,'hiii','2026-04-02 17:01:49',1),(25,'4','customer','DRAG-ART-002','artist',NULL,'hello bro,i liked your art work','2026-04-02 17:02:03',1),(28,'DRAG-ART-002','artist','4','customer',NULL,'thank you for your complements','2026-04-03 05:25:34',1),(30,'DRAG-ART-001','artist','3','customer',NULL,'hii, nice to meet you','2026-04-07 18:25:09',1),(33,'DRAG-ART-002','artist','2','customer',12,'is this image the final decision','2026-04-21 17:54:14',1),(38,'DRAG-ART-001','artist','2','customer',NULL,'hrllo','2026-04-27 15:24:12',0),(39,'DRAG-ART-001','artist','3','customer',NULL,'hii','2026-04-29 17:00:00',1),(40,'DRAG-ART-001','artist','3','customer',NULL,'hii','2026-04-29 19:03:13',1),(41,'DRAG-ART-001','artist','1','customer',NULL,'hii','2026-04-29 19:20:03',0),(43,'3','customer','DRAG-ART-001','artist',NULL,'hii','2026-05-01 23:59:14',1),(44,'3','customer','DRAG-ART-002','artist',NULL,'hii','2026-05-02 00:19:11',0),(45,'5','customer','DRAG-ART-001','artist',NULL,'hii','2026-05-03 22:45:25',1);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `owner_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `monthly_target` decimal(10,2) DEFAULT '250000.00',
  PRIMARY KEY (`owner_id`),
  UNIQUE KEY `uq_owner_email` (`email`),
  UNIQUE KEY `idx_owner_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
INSERT INTO `owner` VALUES (1,'Dragon Owner','owner@dragon.com','scrypt:32768:8:1$L6TzaEKUyraMimVD$1f7214899bb92cce2fa4b65dcf94c015c8fdb97c51b6c8f78504e4c099a8b0aaceb7e3c899cfba0968e2e3e065f848a4be767cb9d65391b4ba40d934e6367d2b','9999999999','2026-03-13 19:30:24',100000.00);
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_method` text NOT NULL,
  `payment_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Approved',
  PRIMARY KEY (`payment_id`),
  KEY `fk_payment_invoice` (`invoice_id`),
  CONSTRAINT `fk_payment_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,1,5000.00,'Cash','2026-03-14','Approved'),(2,2,2000.00,'Cash','2026-03-15','Approved'),(3,3,2000.00,'UPI','2026-03-18','Approved'),(4,4,2000.00,'Cash','2026-03-18','Approved'),(5,5,5000.00,'UPI','2026-03-19','Approved'),(6,6,2000.00,'Card','2026-03-19','Approved'),(7,7,3000.00,'UPI via PhonePe — UTR: 841848484484','2026-03-19','Approved'),(9,8,1000.00,'UPI — UTR: 345675646464','2026-03-24','Approved'),(10,9,1500.00,'UPI — UTR: 123123555548','2026-04-21','Approved'),(11,10,1000.00,'Card','2026-04-29','Approved'),(12,11,1000.00,'UPI — UTR: 654841984914','2026-04-29','Approved');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'dragon_tattoos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-10 13:25:24
