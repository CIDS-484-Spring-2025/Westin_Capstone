-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS webpage;
USE webpage;

-- MySQL dump 10.13  Distrib 9.2.0, for macos14.7 (arm64)
--
-- Host: localhost    Database: webpage
-- ------------------------------------------------------
-- Server version	9.2.0

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

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,79,'2025-04-10 18:53:21'),(2,80,'2025-04-10 20:03:39'),(3,88,'2025-04-10 20:10:29'),(4,89,'2025-04-11 16:07:03'),(5,90,'2025-04-11 16:50:12'),(6,91,'2025-04-11 17:08:02'),(7,92,'2025-04-11 17:11:25'),(8,93,'2025-04-11 18:25:47'),(9,94,'2025-04-11 19:21:17'),(10,95,'2025-04-11 19:39:39'),(11,96,'2025-04-11 20:06:01'),(12,97,'2025-04-11 20:36:11'),(13,98,'2025-04-11 20:37:00'),(14,99,'2025-04-12 15:11:34'),(15,100,'2025-04-12 15:12:28'),(16,102,'2025-04-12 15:27:14'),(17,106,'2025-04-12 19:15:22'),(18,107,'2025-04-12 22:56:16'),(19,108,'2025-04-12 23:09:04'),(20,109,'2025-04-12 23:14:20'),(21,110,'2025-04-12 23:16:11');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`cart_item_id`),
  KEY `cart_id` (`cart_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,2,1),(2,2,3,1),(3,3,2,1),(4,4,3,1),(5,5,5,1),(6,5,8,1),(7,5,7,1),(8,5,3,1),(9,5,2,1),(10,6,2,1),(11,6,3,1),(12,7,1,1),(16,9,6,1),(17,9,8,2),(36,17,5,2),(38,18,5,1),(39,18,7,1),(43,20,3,1),(44,20,6,1),(45,21,5,1),(46,21,6,1);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Items`
--

DROP TABLE IF EXISTS `Items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `item_description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(2083) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tags` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Items`
--

LOCK TABLES `Items` WRITE;
/*!40000 ALTER TABLE `Items` DISABLE KEYS */;
INSERT INTO `Items` VALUES (1,'Logitech G502 HERO','High Performance Wired Gaming Mouse, HERO 25K Sensor, 25,600 DPI, RGB, Adjustable Weights, 11 Programmable Buttons, On-Board Memory, PC / Mac',45.99,'https://c1.neweggimages.com/productimage/nb1280/3C6-0064-00002-S07.jpg','2025-02-04 17:20:37','mouse,gaming,accessory,accessories'),(2,'CORSAIR NIGHTSWORD','RGB Performance Tunable FPS/MOBA Gaming Mouse, Black, Backlit RGB LED, 18000 dpi, Optical\n',49.99,'https://c1.neweggimages.com/productimage/nb1280/26-816-133-V36.jpg','2025-02-04 17:20:37','mouse,gaming,accessory,accessories'),(3,'Mechanical Keyboard','RGB backlit mechanical keyboard with blue switches.',129.99,'https://cdn.mos.cms.futurecdn.net/CxxpjpbaHLt6X2NC8rTa9E-1200-80.jpg','2025-02-04 17:20:37','keyboard,gaming,accessory,accessories'),(4,'4K Monitor','32-inch 4K UHD monitor with vibrant colors.',299.99,'https://www.bhphotovideo.com/images/fb/hp_8y2k9aa_aba_32_4k_ultra_hd_1814579.jpg','2025-02-04 17:20:37','Monitor,gaming,display,4k'),(5,'ASUS 34\" 240 Hz OLED UWQHD Curved Gaming Monitor','34-inch ultra-wide (3440 x 1440) OLED 800R curved gaming monitor with 240 Hz refresh rate and 0.03ms response time',899.99,'https://c1.neweggimages.com/productimage/nb1280/24-281-295-07.png','2025-03-11 19:49:32','Monitor,gaming,display,OLED'),(6,'Alienware 27 Gaming Monitor','27″ monitor optimized for everyday gaming. Features a QHD display with great color performance, delivering gameplay that springs to life.',199.99,'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/alienware/aw2724dm/media-gallery/monitor-alienware-aw2724dm-black-gallery-16.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=1527&qlt=100,1&resMode=sharp2&size=1527,804&chrss=full','2025-03-11 19:52:12','Monitor,gaming,display'),(7,'AMD Ryzen 9 9900X','Ryzen 9 9000 Series Granite Ridge (Zen 5) 12-Core 4.4 GHz - Socket AM5 120W - Radeon Graphics Processor',450.99,'https://c1.neweggimages.com/productimage/nb1280/19-113-842-02.png','2025-03-11 19:52:12','graphics card,gaming,GPU,AMD'),(8,'ASUS TUF Gaming GeForce RTX 5090','Powered by NVIDIA Blackwell, GeForce RTX™ 50 Series GPUs bring game-changing capabilities to gamers and creators. Equipped with a massive level of AI horsepower, the RTX 50 Series enables new experiences and next-level graphics fidelity. Multiply performance with NVIDIA DLSS 4, generate images at unprecedented speed, and unleash your creativity with NVIDIA Studio.',759.99,'https://c1.neweggimages.com/productimage/nb1280/14-126-753-01.jpg','2025-03-11 19:56:53','graphics card,gaming,GPU,RTX');
/*!40000 ALTER TABLE `Items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (4,'wes','Westinimpola1@gmail.com','2025-02-13 14:21:22'),(6,'john','jon@gmail.com','2025-02-25 13:04:21'),(7,'reece','reecescup@gmail.com','2025-02-25 13:08:47'),(8,'josh','jgmail@gmail.com','2025-02-25 15:30:16'),(9,'Westini','weseer@gmail.com','2025-02-27 14:55:44'),(10,'eee','wwe@gmail.com','2025-02-27 14:56:56'),(11,'pepsi','pepsi@gmail.com','2025-02-27 22:41:52'),(12,'kane','kaner88@gmail.com','2025-03-11 13:20:08'),(17,'kane_','kaner80@gmail.com','2025-03-11 13:39:06'),(18,'john ','john@gmail.com','2025-03-11 13:51:44'),(19,'rick','rjohnson@gmail.com','2025-03-11 13:53:02'),(20,'will','will@gmail.com','2025-03-11 14:00:59'),(21,'william','william@gmail.com','2025-03-11 14:37:32'),(22,'jack','jack@gmail.com','2025-03-11 19:29:53'),(23,'jim','j@gmail.com','2025-03-11 19:35:46'),(24,'k','k@gmail.com','2025-03-11 19:38:09'),(25,'mike','mross@gmail.com','2025-03-13 18:19:39'),(26,'donna','don@gmail.com','2025-03-13 18:27:44'),(27,'doug','dimpola@gmail.com','2025-03-13 18:34:06'),(28,'dave','dave@gmail.com','2025-03-13 18:41:20'),(29,'jenna','jenna@gmail.com','2025-03-13 18:42:40'),(30,'ja','ja@gmail.com','2025-03-13 18:49:05'),(31,'user','user@gmail.com','2025-03-14 20:22:12'),(32,'user1','user1@gmail.com','2025-03-14 23:28:44'),(33,'jake','jc@gmail.com','2025-03-29 12:36:32'),(34,'kc','kc@gmail.com','2025-03-29 13:39:25'),(35,'o','o@gmail.com','2025-03-29 13:43:02'),(36,'sh','sh@gmail.com','2025-03-29 13:47:24'),(37,'t','t@gmail.com','2025-03-29 13:55:07'),(38,'create','create@gmail.com','2025-03-29 13:58:07'),(39,'l','l@gmail.com','2025-04-01 13:47:07'),(40,'u','u@gmail.com','2025-04-01 13:51:05'),(41,'q','q@gmail.com','2025-04-01 13:59:42'),(42,'y','y@gmail.com','2025-04-01 14:37:12'),(45,'qw','qw@gmail.com','2025-04-03 13:01:41'),(46,'pp','pp@gmail.com','2025-04-03 13:18:09'),(47,'kk','kk@gmail.com','2025-04-03 13:20:47'),(48,'tt','tt@gmail.com','2025-04-03 13:39:17'),(49,'vv','vv@gmail.com','2025-04-03 13:41:34'),(50,'oo','oo@gmail.com','2025-04-03 13:55:40'),(51,'ty','ty@gmail.com','2025-04-08 01:02:12'),(52,'oooo','oooo@gmail.com','2025-04-08 01:02:39'),(53,'llll','llll@gmail.com','2025-04-08 01:45:23'),(54,'iiii','iiii@gmail.com','2025-04-08 14:28:05'),(55,'hhh','hhh@gmail.com','2025-04-08 14:31:47'),(56,'wess','wess@gmail.com','2025-04-08 15:05:31'),(57,'ppppp','p@gmail.com','2025-04-08 15:06:13'),(58,'dd','dd@gmail.com','2025-04-08 15:13:50'),(59,'0oo','ooo@gmail.com','2025-04-08 15:15:53'),(60,'ttt','ttt@gmail.com','2025-04-08 15:27:06'),(61,'av','av@gmail.com','2025-04-08 15:31:29'),(62,'users','users@gmail.com','2025-04-08 15:33:58'),(63,'user3','user3@gmail.com','2025-04-08 16:59:07'),(64,'user4','user4@gmail.com','2025-04-08 17:07:08'),(65,'zuck','zuck@gmail.com','2025-04-10 01:20:46'),(66,'user5','user5@gmail.com','2025-04-10 01:23:10'),(67,'user6','user6@gmail.com','2025-04-10 01:41:09'),(70,'user7','user7@gmail.com','2025-04-10 02:02:08'),(71,'user8','user8@gmail','2025-04-10 02:04:21'),(73,'user9','user9@gmail.com','2025-04-10 13:08:11'),(74,'user10','user10@gmail.com','2025-04-10 13:23:33'),(75,'user11','user11@gmail.com','2025-04-10 13:49:46'),(76,'user12','user12@gmail.com','2025-04-10 14:49:16'),(77,'user13','user13@gmail.com','2025-04-10 14:57:56'),(78,'user14','user14@gmail.com','2025-04-10 17:40:06'),(79,'user15','user15@gmail.com','2025-04-10 18:52:08'),(80,'user16','user16@gmail.com','2025-04-10 20:03:16'),(81,'user17','user17@gmail.com','2025-04-10 20:07:55'),(88,'user20','user20@gmail.com','2025-04-10 20:10:26'),(89,'user21','user21@gmail.com','2025-04-11 16:06:32'),(90,'kyle','kyle@gmail.com','2025-04-11 16:50:05'),(91,'user22','user22@gmail.com','2025-04-11 17:07:58'),(92,'user23','user23@gmail.com','2025-04-11 17:11:24'),(93,'user24','user24@gmail.com','2025-04-11 18:25:45'),(94,'user25','user25@gmail.com','2025-04-11 19:20:47'),(95,'user26','user26@gmail.com','2025-04-11 19:39:38'),(96,'user27','user27@gmail.com','2025-04-11 20:05:59'),(97,'user29','user29@gmail.com','2025-04-11 20:36:09'),(98,'user30','user30@gmail.com','2025-04-11 20:36:59'),(99,'user31','user31@gmail.com','2025-04-12 15:11:29'),(100,'user32','user32@gmail.com','2025-04-12 15:12:06'),(102,'user33','user33@gmail.com','2025-04-12 15:27:07'),(104,'user34','user34@gmail.com','2025-04-12 16:05:50'),(106,'user35','user35@gmail.com','2025-04-12 19:15:20'),(107,'user37','user37@gmail.com','2025-04-12 22:56:14'),(108,'u1','u1@gmail.com','2025-04-12 23:09:03'),(109,'u2','u2@gmail.com','2025-04-12 23:14:18'),(110,'u3','u3@gmail.com','2025-04-12 23:16:10');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-12 23:31:50
