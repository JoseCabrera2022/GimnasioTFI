CREATE DATABASE  IF NOT EXISTS `gymmanager_pro` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gymmanager_pro`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gymmanager_pro
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `foto` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ubicacion_id` int DEFAULT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ubicacion_id` (`ubicacion_id`),
  CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
INSERT INTO `actividades` VALUES (3,'Crossfit','Entrenamiento funcional de fuerza',NULL,'2025-11-18 04:17:16',1,0),(5,'Natación','Entrenamiento en pileta olímpica',NULL,'2025-11-18 04:17:16',1,0),(6,'Yoga','Sesión de yoga relajante',NULL,'2025-11-18 04:17:16',2,0),(7,'Spinning','Clase de spinning de alta intensidad',NULL,'2025-11-18 04:17:16',2,0),(8,'Crossfit','Entrenamiento funcional de fuerza',NULL,'2025-11-18 04:17:16',2,0),(9,'Zumba','Clase de baile fitness',NULL,'2025-11-18 04:17:16',1,0),(10,'Natación','Entrenamiento en pileta olímpica','/uploads/1793835606856.jpg','2025-11-18 04:17:16',2,0),(11,'Calistenia','Entrenamiento en barras al aire libre, gánale a tu cuerpo',NULL,'2025-11-23 01:59:16',1,0),(12,'Cardio','Mejora tu salud',NULL,'2025-11-23 14:18:26',1,0);
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `duraciones`
--

DROP TABLE IF EXISTS `duraciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `duraciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` enum('mensual','trimestral','anual') NOT NULL,
  `dias` int NOT NULL,
  `descuento` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `duraciones`
--

LOCK TABLES `duraciones` WRITE;
/*!40000 ALTER TABLE `duraciones` DISABLE KEYS */;
INSERT INTO `duraciones` VALUES (1,'mensual',30,0.00),(2,'trimestral',90,0.15),(3,'anual',365,0.30);
/*!40000 ALTER TABLE `duraciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membresias`
--

DROP TABLE IF EXISTS `membresias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membresias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `duracion_id` int NOT NULL,
  `pago_id` int DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `estado` enum('activa','vencida','cancelada','pendiente') DEFAULT 'pendiente',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `duracion_id` (`duracion_id`),
  KEY `pago_id` (`pago_id`),
  KEY `fk_membresias_usuario_cascade` (`usuario_id`),
  CONSTRAINT `fk_membresias_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membresias_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membresias_ibfk_3` FOREIGN KEY (`duracion_id`) REFERENCES `duraciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membresias_ibfk_4` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresias`
--

LOCK TABLES `membresias` WRITE;
/*!40000 ALTER TABLE `membresias` DISABLE KEYS */;
INSERT INTO `membresias` VALUES (1,5,3,1,1,'2026-11-04 18:22:53','2026-12-04 18:22:53','activa','2026-11-04 21:22:53'),(2,6,3,1,2,'2026-11-04 18:57:24','2026-12-04 18:57:24','activa','2026-11-04 21:57:23'),(3,7,3,1,3,'2026-11-04 19:16:29','2026-12-04 19:16:29','activa','2026-11-04 22:16:28'),(4,10,3,1,4,'2026-11-05 20:41:21','2026-12-05 20:41:21','activa','2026-11-05 23:41:21');
/*!40000 ALTER TABLE `membresias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_contacto`
--

DROP TABLE IF EXISTS `mensajes_contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_contacto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ubicacion_id` int DEFAULT NULL,
  `respuesta` text,
  `respondido` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ubicacion_id` (`ubicacion_id`),
  CONSTRAINT `mensajes_contacto_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_contacto`
--

LOCK TABLES `mensajes_contacto` WRITE;
/*!40000 ALTER TABLE `mensajes_contacto` DISABLE KEYS */;
INSERT INTO `mensajes_contacto` VALUES (1,'prueba2','prueba2@gmail.com','Probando...','2026-11-04 22:17:45',1,NULL,NULL);
/*!40000 ALTER TABLE `mensajes_contacto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pago_mp` varchar(100) NOT NULL,
  `usuario_id` int NOT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `estado` enum('approved','pending','rejected') NOT NULL,
  `fecha_aprobado` datetime DEFAULT NULL,
  `metodo_pago` varchar(100) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_pago_mp` (`id_pago_mp`),
  KEY `fk_pagos_usuario_cascade` (`usuario_id`),
  CONSTRAINT `fk_pagos_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,'186733440791',5,15400.00,'approved','2026-11-04 18:22:51','credit_card','2026-11-04 21:22:53'),(2,'186740652457',6,15400.00,'approved','2026-11-04 18:57:23','credit_card','2026-11-04 21:57:23'),(3,'187803122198',7,15400.00,'approved','2026-11-04 19:16:28','credit_card','2026-11-04 22:16:28'),(4,'186955830197',10,15400.00,'approved','2026-11-05 20:20:47','credit_card','2026-11-05 23:41:21');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes`
--

DROP TABLE IF EXISTS `planes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `descripcion` text,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes`
--

LOCK TABLES `planes` WRITE;
/*!40000 ALTER TABLE `planes` DISABLE KEYS */;
INSERT INTO `planes` VALUES (1,'basico','Plan Básico',7000.00,'Acceso estándar (lunes a viernes), control de asistencia, reservas online',0),(2,'estandar','Plan Estándar',11200.00,'Incluye beneficios del básico, pagos automáticos, 30% de descuento en productos',0),(3,'premium','Plan Premium',15400.00,'Incluye todo lo anterior, acceso exclusivo fines de semana, clases ilimitadas, entrenador personal',0);
/*!40000 ALTER TABLE `planes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `turno_id` int NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada') DEFAULT 'confirmada',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `turno_id` (`turno_id`),
  KEY `fk_reservas_usuario_cascade` (`usuario_id`),
  CONSTRAINT `fk_reservas_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,7,26,'confirmada','2026-11-04 23:57:23'),(2,7,24,'confirmada','2026-11-04 23:57:36');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turnos`
--

DROP TABLE IF EXISTS `turnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actividad_id` int NOT NULL,
  `fecha` datetime NOT NULL,
  `cupo_maximo` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `actividad_id` (`actividad_id`),
  CONSTRAINT `turnos_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turnos`
--

LOCK TABLES `turnos` WRITE;
/*!40000 ALTER TABLE `turnos` DISABLE KEYS */;
INSERT INTO `turnos` VALUES (5,3,'2026-11-05 19:00:00',25),(7,5,'2026-11-02 10:00:00',12),(8,6,'2026-11-03 09:00:00',20),(9,6,'2026-11-05 18:00:00',20),(10,7,'2026-11-04 10:00:00',15),(11,7,'2026-11-07 19:00:00',15),(12,8,'2026-11-04 11:00:00',12),(13,8,'2026-11-02 20:00:00',12),(14,9,'2026-11-02 12:00:00',25),(15,9,'2026-11-04 21:00:00',25),(16,10,'2026-11-02 13:00:00',10),(17,10,'2026-11-04 22:00:00',10),(19,10,'2026-11-07 08:30:00',15),(20,8,'2026-11-06 14:30:00',10),(21,3,'2026-11-04 08:30:00',10),(23,8,'2026-11-05 15:00:00',10),(24,11,'2026-11-03 19:00:00',8),(26,12,'2026-11-03 11:30:00',1);
/*!40000 ALTER TABLE `turnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `provincia` varchar(100) NOT NULL,
  `pais` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Atlas Gym','Reconquista 460','Banda del Río Salí','Tucumán','Argentina','‪+54 381 555-1234‬','contacto@atlasgym.com',-26.84211110,-65.16120300,'2025-11-18 16:01:46',0),(2,'Atlas Gym','25 de Mayo 123','San Miguel de Tucumán','Tucumán','Argentina','‪+54 381 555-4567‬','sanmiguel@atlasgym.com',-26.81670000,-65.21670000,'2025-11-18 16:01:51',0);
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `correo_electronico` varchar(200) NOT NULL,
  `contraseña_hash` varchar(255) DEFAULT NULL,
  `rol` enum('socio','empleado','admin') DEFAULT 'socio',
  `telefono` varchar(50) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `foto` varchar(255) DEFAULT NULL,
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `ubicacion_id` int DEFAULT NULL,
  `eliminado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo_electronico` (`correo_electronico`),
  KEY `ubicacion_id` (`ubicacion_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'José Francisco Cabrera','jose.cabrera.2k7@gmail.com','$2b$10$Ru1FK/t89qxk1ZDnlT4rreuRZLHlUXHKEB2qJOyWM/X6tW3kz7oFq','admin','3816558684','2025-12-03 05:59:24',NULL,'2026-10-20 23:46:16','activo',1,0),(4,'Usuario','jose.cabrera.2k7@outlook.es','$2b$10$iSXiOJob.hlQIChy4Pmynu8OeLOwT/RPp5YCP4w2sUJUlpYOrrcf6','socio','3816558684','2026-10-20 20:07:24',NULL,'2026-11-02 13:07:40','activo',1,0),(5,'Nicolas Zelarayan','nicolaszelarayan2003@gmail.com','$2b$10$6EYwhOHAzOPCzUo0QadMNeTnsdx4mz2mZjvEKYsuaAIFmxte.EvN6','admin','3813242343','2026-11-04 20:55:03','/uploads/1793825856071.jpg','2026-11-04 23:37:50','activo',1,0),(6,'prueba','prueba@gmail.com','$2b$10$57WSUPETuXS/xZqyR2v9.OZT90DGyZhJgV4x5GJaimGI06qZDh3vK','socio','1233434','2026-11-04 21:57:01',NULL,NULL,'activo',1,0),(7,'prueba2','prueba2@gmail.com','$2b$10$NqG2cxBZNsLQeGS7T5AVxuhLoYLhTYNcS/xjZR17O0/6SQe9xwzMe','socio','1241274712','2026-11-04 22:16:13',NULL,NULL,'activo',1,0),(8,'Martin','martin@gmail.com','$2b$10$BOJo3/WdeZWNEBbtCXnqbeXbHDIh6E5rJOZmKnjfY1mGEoXmaQIKa','socio','2414214124','2026-11-05 00:24:04',NULL,NULL,'activo',2,0),(9,'Empleado','empleado@gmail.com','$2b$10$joEgSz9VZw3u44.b.dEpj.RfNykpsD9tjWWgz7.zJ7ADmTXF.2svi','empleado','381578594','2026-11-05 22:53:52',NULL,NULL,'activo',1,0),(10,'Lucaas','lucas@gmail.com','$2b$10$8EwiX.XEKZSItoogfgVKYeuA5jFyH.UyD/GTyi7OH/I/0MyIZfFbG','socio','244324324','2026-11-05 23:19:48',NULL,NULL,'activo',1,0),(11,'Juan Pérez','juan.perez@gmail.com','$2b$10$CmHZxJaiwHMoMt7erYkj7OZHBTRQ4a2pXZNf4rUr6pjzzsCryPWYW','socio','3814001001','2026-11-18 23:46:56',NULL,NULL,'activo',1,0),(12,'María Gómez','maria.gomez@gmail.com','$2b$10$7RHMeY0txb.8z.N7ZDHC8OMz08gg9j8ihqf807hUL4nH6VnQTaLxW','socio','3814001002','2026-11-18 23:48:18',NULL,NULL,'activo',1,0),(13,'Carlos Rodríguez','carlos.rodriguez@gmail.com','$2b$10$j7r/xwfC8O/F/QUQAjBdAev.em5QB6mstvi82UHgkmdV1XeuxNR3i','socio','3814001003','2026-11-18 23:49:23',NULL,NULL,'activo',1,0),(14,'Ana Fernández','ana.fernandez@gmail.com','$2b$10$wbY3vyRM8GIkXiNghszTuugfUOWFWyiPIG4vdAKxCyxFLdcucrbqO','socio','3814001004','2026-11-18 23:49:56',NULL,NULL,'activo',1,0),(15,'Lucas Martínez','lucas.martinez05@gmail.com','$2b$10$/j6iqBQqW6Cb6JYl.sIWJeOcpseQTTcHgwfLmwZXyaDSClltTsYXK','socio','3814001005','2026-11-18 23:50:50',NULL,NULL,'activo',1,0),(16,'Sofía López','sofia.lopez@gmail.com','$2b$10$EHBKHMBp.9KLav.8AtgIP.TdkuB0vIq9DAxGwQf1z44Y2tEqoY88a','socio','3814001006','2026-11-18 23:52:00',NULL,NULL,'activo',1,0),(17,'Diego González','diego.gonzalez@gmail.com','$2b$10$jRfUMc7h/Fa5k2NBzMeZO.2S5oM.jvkCy7co2XG1GM6qbL8spGPQC','socio','3814001007','2026-11-18 23:52:40',NULL,NULL,'activo',1,0),(18,'Camila Díaz','camila.diaz@gmail.com','$2b$10$8QVPeGXUbYWn5lsRBlibR.UhshDuBB8aCJkyYmdvlhKDnorRzm4Xm','socio','3814001008','2026-11-18 23:53:15',NULL,NULL,'activo',1,0),(19,'Martín Sánchez','martin.sanchez@gmail.com','$2b$10$XxUfYLKzDOuvf59qtK0MZuZ4z42rULuBktC20AOv4SZSXsqPL84.6','socio','3814001009','2026-11-18 23:54:59',NULL,NULL,'activo',1,0),(20,'Valentina Romero','valentina.romero@gmail.com','$2b$10$YUKWjBNjpXs1fbnlSFhmhufwWnI6VLLPrkiinWjHwcI3Z5tWu4FBS','socio','3814001010','2026-11-18 23:55:34',NULL,NULL,'activo',1,0),(21,'Nicolás Torres','nicolas.torres@gmail.com','$2b$10$kh9IFIYvNm87QpuGMo8ScOymN28msXf9edvex6flmrn8RlvYGNzpy','socio','3814001011','2026-11-18 23:56:31',NULL,NULL,'activo',2,0),(22,'Paula Herrera','paula.herrera@gmail.com','$2b$10$6.1ayy3GkvsSx/eZaCO1bOuFsYmkFS46S0FS722i/IuzO7jXQxAXq','socio','3814001012','2026-11-18 23:57:09',NULL,NULL,'activo',2,0),(23,'Agustín Castro','agustin.castro@gmail.com','$2b$10$UUW9BOEXnLGgLftv.zOJeugsdfc2DYC2utBAKRWXczg1qfsmOqcOy','socio','3814001013','2026-11-18 23:57:59',NULL,NULL,'activo',2,0),(24,'Florencia Acosta','flor.acosta@gmail.com','$2b$10$oQVtCPGvF17lToMKWHhr5uGR10Osm1vgRul9e2iOFrt3fUDOVorLu','socio','3814001014','2026-11-18 23:58:19',NULL,NULL,'activo',2,0),(25,'Javier Méndez','javier.mendez@gmail.com','$2b$10$pBZjfGzI3IicYYVvjHeAhuV7Q8dvqiff/FR5.sYsOy/3Ya6PfW8QW','socio','3814001015','2026-11-18 23:58:42',NULL,NULL,'activo',2,0),(26,'Lucía Ramírez','lucia.ramirez@gmail.com','$2b$10$vGOMkL6Hs2FffGSAgOoRUuoYkvvpdA8EUxizvn3b4Gu1i0yhp/Kti','socio','3814001016','2026-11-18 23:59:12',NULL,NULL,'activo',2,0),(27,'Emiliano Juárez','emi.juarez@gmail.com','$2b$10$QOGzR.krT/9WYMuegOWLA.c0.rdhKpmzGC3CrxuhaT/p2L0fBXat.','socio','3814001017','2026-11-18 23:59:43',NULL,NULL,'activo',2,0),(28,'Martina Vargas','martina.vargas@gmail.com','$2b$10$gYan0fce1loZWXaXDJ9hxucmMdoi.J75NHKV90sspJkC4fIfzieZ.','socio','3814001018','2026-11-19 00:00:09',NULL,NULL,'activo',2,0),(29,'Santiago Silva','santiago.silva@gmail.com','$2b$10$wOCVSSaBKG5dvLY2Xc52fOWjoJVdiq4K7Ihxqst0fm9LR8ZTyrPtO','socio','3814001019','2026-11-19 00:00:45',NULL,NULL,'activo',2,0),(30,'Carolina Molina','carolina.molina@gmail.com','$2b$10$VF99QWLuSW1vQLv8gT8RquPPjyw5Zr/2O3tFEB3YTrxynneFimg0C','socio','3814001020','2026-11-19 00:01:19',NULL,NULL,'activo',2,0),(31,'Facundo Núñez','facu.nunez@gmail.com','$2b$10$JdpHdAAikrL2a6aRMyllGegcansx/QSw47OTDb/ISLYTZEjYoh8gG','socio','3814001021','2026-11-19 00:02:27',NULL,NULL,'activo',1,0),(32,'Agostina Peralta','agos.peralta@gmail.com','$2b$10$6.ZmvDQrPH2f5Dm.VETIPuAlgLXmYEPNLazqAYtnXkJqIvdUKJx02','socio','3814001022','2026-11-19 00:02:51',NULL,NULL,'activo',1,0),(33,'Gabriel Medina','gabriel.medina@gmail.com','$2b$10$UD/n3JlsTn9CcdSygJdPOOoTqSeb1iGDMtQ7S3TKWG/BkVJ6p9KtW','socio','3814001023','2026-11-19 00:03:16',NULL,NULL,'activo',1,0),(34,'Victoria Rojas','vicky.rojas@gmail.com','$2b$10$y8WPvGojoeKbw8pmQ9pDsOHJvydtI.8HSJT/f5I3MWnwmHO/Lqb6O','socio','3814001024','2026-11-19 00:04:00',NULL,NULL,'activo',1,0),(35,'Andrés Sosa','andres.sosa@gmail.com','$2b$10$3w8z7GT1Z2lhhDJzkUiazu3oDHFghhyOfYNw/Yilrc3x9uci0HV0u','socio','3814001025','2026-11-19 00:04:24',NULL,NULL,'activo',1,0),(36,'Belén Ortiz','belen.ortiz@gmail.com','$2b$10$0w2i0lFyi9BefKbHO9neT.v3YIOiyfdnKCVoS0TwDO5xjX9CB43a6','socio','3814001026','2026-11-19 00:04:50',NULL,NULL,'activo',1,0),(37,'Tomás Aguirre','tomas.aguirre@gmail.com','$2b$10$DIC3WU/L8LTHDxalaK771.Ol0dylX7/yubt2Mo1k94lFPkTGn2Dli','socio','3814001027','2026-11-19 00:05:15',NULL,NULL,'activo',1,0),(38,'Julieta Ponce','juli.ponce@gmail.com','$2b$10$.HBPJhFmNJW2JVIY4SSucOcjE12JWTTHHiTSUucaq4pWCDZzPdSUi','socio','3814001028','2026-11-19 00:05:38',NULL,NULL,'activo',1,0),(39,'Matías Vega','mati.vega@gmail.com','$2b$10$uUH8tguuHICJGA8n6Ra56.1TTRJyc3pumh/vCi3LdWjt/Equ0qd1S','socio','3814001029','2026-11-19 00:06:03',NULL,NULL,'activo',1,0),(40,'Daniela Guzmán','daniela.guzman@gmail.com','$2b$10$SnAkBinwJIoVoxLM07rqnOY.LgpB7L4WMzVYH1E66RLdsrGZA1UhC','socio','3814001030','2026-11-19 00:06:29',NULL,NULL,'activo',1,0),(41,'Pablo Cabrera','pablo.cabrera@gmail.com','$2b$10$irYPvFr5MqjpFpp/INmrvuYLWkaHLpmxocYLkkCtxN6I5uaPuZCjK','socio','3814001031','2026-11-19 00:22:21',NULL,NULL,'activo',1,0),(42,'Natalia Luna','nati.luna@gmail.com','$2b$10$7XhN12g4YR4P.CMUhKARTujfqT9Ee4Re9wKwWJZK6w/GZ7GG0vJMy','socio','3814001032','2026-11-19 00:24:57',NULL,NULL,'activo',1,0),(43,'Ezequiel Campos','eze.campos@gmail.com','$2b$10$kV7QlfBJeHv/RPvaMDB7HeoFF5HqCi26lBlbJpftsLEekuieCY2gS','socio','3814001033','2026-11-19 00:25:23',NULL,NULL,'activo',1,0),(44,'Rocío Delgado','rocio.delgado@gmail.com','$2b$10$nmOpFCjTpp.JjSOFIOz84u8gOdV8uBtrunrkii6PcgI9mYrN4eOsW','socio','3814001034','2026-11-19 00:25:45',NULL,NULL,'activo',1,0),(45,'Federico Ríos','fede.rios@gmail.com','$2b$10$s8GLtfHnQBWI4n4aT4CQuugxXTkSzte8kpyBtrKXk3NscAf.KrcQW','socio','3814001035','2026-11-19 00:26:57',NULL,NULL,'activo',1,0),(46,'Antonella Figueroa','anto.figueroa@gmail.com','$2b$10$/lIVfye3onATD.BiJt54Cu2kAdU3LTsEmgCOvl4uIY.9g8u1VSz5S','socio','3814001036','2026-11-19 00:27:55',NULL,NULL,'activo',2,0),(47,'Ramiro Herrera','ramiro.herrera@gmail.com','$2b$10$nz8PYcD2o.flnJg9RqHtyexsFQZuthYhf/PG0hY6CzgVsBLfn7otC','socio','3814001037','2026-11-19 00:28:23',NULL,NULL,'activo',2,0),(48,'Macarena Bravo','maca.bravo@gmail.com','$2b$10$h479BIdAsNf86ux.l5qz9OiQd7wE60jYsXPoXr0RpG3wxNLKAIBoy','socio','3814001038','2026-11-19 00:28:45',NULL,NULL,'activo',2,0),(49,'Leonardo Paz','leo.paz@gmail.com','$2b$10$1k4pM4clkcldZ2yHuK9SHe04J7IOLms.JDwJMWd5jLipJI698RKhm','socio','3814001039','2026-11-19 00:29:00',NULL,NULL,'activo',2,0),(50,'Milagros Duarte','mili.duarte@gmail.com','$2b$10$lIMSPb67zrSI/bN8TkdGEurHNQD75gGaZtecg/2jKRr/YSCXmojYO','socio','3814001040','2026-11-19 00:29:18',NULL,NULL,'activo',2,0),(51,'Ignacio Navarro','nacho.navarro@gmail.com','$2b$10$iFiPlkonSD4hSUl64ty9Rux4IMT1pY4IyqMVr6zBe3AWWuopRuGHa','socio','3814001041','2026-11-19 00:29:36',NULL,NULL,'activo',2,0),(52,'Cecilia Morales','ceci.morales@gmail.com','$2b$10$iQVIu3v.LrJM76biupbI2eq8R00NPaNlnHObVod8GrLSIR5WoHXC2','socio','3814001042','2026-11-19 00:29:52',NULL,NULL,'activo',2,0),(53,'Bruno Villalba','bruno.villalba@gmail.com','$2b$10$MTwKdhtlAb5KXK0E1o2JWeeYJHIQwtTRo9Vrfjy5PuOz3BpbzQTv6','socio','3814001043','2026-11-19 00:30:09',NULL,NULL,'activo',2,0),(54,'Aldana Quiroga','aldana.quiroga@gmail.com','$2b$10$APo8gh6oI9hhcF04c.n5geSbQOwpUrvljrkD/9xSGG7vHd8MNNUyy','socio','3814001044','2026-11-19 00:30:30',NULL,NULL,'activo',2,0),(55,'Sebastián Coronel','seba.coronel@gmail.com','$2b$10$6oOCExPaaa71uURXcmT2tO8FQ./b77UYQ.7ERbMRHpCAVFE2LYdVu','socio','3814001045','2026-11-19 00:30:52',NULL,NULL,'activo',2,0),(56,'Jimena Leiva','jime.leiva@gmail.com','$2b$10$uLGmZUVlcHkVaruTytZTmuy.QGGAGHVIo2iTaYMikfl2VxqqVNM/q','socio','3814001046','2026-11-19 00:31:14',NULL,NULL,'activo',2,0),(57,'Lautaro Giménez','lautaro.gimenez@gmail.com','$2b$10$DmZ3i57ayZecpLZ.a/IpWuKMm2Q.CcJpE01uvBiZrwoCcAhGM0aj6','socio','3814001047','2026-11-19 00:31:32',NULL,NULL,'activo',2,0),(58,'Noelia Farías','noe.farias@gmail.com','$2b$10$hDnMRKz5BiUXS5AVIqXy..rsDrvjjatA/hFwKmpd7rokQdGSsVmwa','socio','3814001048','2026-11-19 00:31:48',NULL,NULL,'activo',2,0),(59,'Damián Salas','damian.salas@gmail.com','$2b$10$7DxtfRzuA28h5ibj20xu9O8ZTFivOKCiO.6JHZKMIPAOGxZB9HeuG','socio','3814001049','2026-11-19 00:32:05',NULL,NULL,'activo',2,0),(60,'Fernanda Miranda','fer.miranda@gmail.com','$2b$10$o/a.qTFDAVIz5CBKWoLjnu8K/QLeJUW08XHIGw8MPurFDniqMEkuW','socio','3814001050','2026-11-19 00:32:21',NULL,NULL,'activo',2,0),(61,'Alejandro Ruiz','alejandro.ruiz@gmail.com','$2b$10$D8B607Fw8uJQX0NoGRm3VOQfSDC4TlLu4Jwz.BhIrso/4mopsPtKe','empleado','3815002001','2026-11-19 00:35:23',NULL,NULL,'activo',1,0),(62,'Gabriela Flores','gabriela.flores@gmail.com','$2b$10$iRL0MMxP8bHnqRnu3H.grOexp8Bpn1/8XYN3RWqKVmA/XzU9ynuPK','empleado','3815002002','2026-11-19 00:35:49',NULL,NULL,'activo',1,0),(63,'Hernán Delgado','hernan.delgado@gmail.com','$2b$10$JZDWp0Vcv7HO0nXL2fUay.8mME2eqnbnZXWMocKOPcedt6.uuQ7eO','empleado','3815002003','2026-11-19 00:36:10',NULL,NULL,'activo',1,0),(64,'Laura Medina','laura.medina@gmail.com','$2b$10$eQzDHwS5Ey3QnaxZFc2btuawkYuZxF74PIjQWKxV1/o7Jowm8KkaS','empleado','3815002004','2026-11-19 00:36:35',NULL,NULL,'activo',1,0),(65,'Cristian Vera','cristian.vera@gmail.com','$2b$10$nZGLQiPuvleUYpMomgZDZ.Z3njq3KfQCbg0wiZSN7OvA0urLLAHNW','empleado','3815002005','2026-11-19 00:36:59',NULL,NULL,'activo',1,0),(66,'Marcela Sosa','marcela.sosa@gmail.com','$2b$10$LmjsI0NALKzovGjnc.vlk.J3ZeQRqo9G8.LM5dmZmQUITimJIh2RW','empleado','3815002006','2026-11-19 00:37:25',NULL,NULL,'activo',1,0),(67,'Rodrigo Peña','rodrigo.pena@gmail.com','$2b$10$qPI7HKFTQejJ26418r44jukiBBDniLAf7V3OQ1HReQn7iKcnL0Dt6','empleado','3815002007','2026-11-19 00:37:51',NULL,NULL,'activo',1,0),(68,'Vanesa Castro','vanesa.castro@gmail.com','$2b$10$6V.gId.n/p1jFoFfapBaa.dpk8uFMZVxJkbcNQ1a6AJVmMyAZOdjm','empleado','3815002008','2026-11-19 00:38:16',NULL,NULL,'activo',1,0),(69,'Oscar Benítez','oscar.benitez@gmail.com','$2b$10$AM351zH/O/iNL.a6c0KrX.GiH/VnZEEwq10AzdmUxWlnVNOTyVH.O','empleado','3815002009','2026-11-19 00:38:37',NULL,NULL,'activo',2,0),(70,'Silvana Ortiz','silvana.ortiz@gmail.com','$2b$10$jUtz8dyN.g2AsckDgj1.Qe78mE8UK1U7F.NCIJIAUqmrXYqYxi5JC','empleado','3815002010','2026-11-19 00:38:55',NULL,NULL,'activo',2,0),(71,'Patricia Luna','patricia.luna@gmail.com','$2b$10$xtQZBL1RV4cxVyzHvMvdi.4e4O3DF6UfkNnmZ3U0kopyMk.EEEKWq','empleado','3815002011','2026-11-19 00:39:18',NULL,NULL,'activo',2,0),(72,'Diego Fernández','diego.fernandez@gmail.com','$2b$10$FmR.7dfS7QUdT161NycBxOGMenwzBVqjAtC9cOC2KW7V5YrPzBbv.','empleado','3815002012','2026-11-19 00:41:26',NULL,NULL,'activo',2,0),(73,'Natalia Castro','natalia.castro@gmail.com','$2b$10$ovnNetXCuEG.BaWj0F1SZuvcvpUTKecfPYJkHQvG.csDSYH7N/RXa','empleado','3815002013','2026-11-19 00:41:45',NULL,NULL,'activo',2,0),(74,'Martín Herrera','martin.herrera@gmail.com','$2b$10$BKQhkjwmRRAepRgMGBaiwuVe3vEBjE17M4Na/a70f6yI9n.zFftdm','empleado','3815002014','2026-11-19 00:42:05',NULL,NULL,'activo',2,0),(75,'Claudia Ríos','claudia.rios@gmail.com','$2b$10$KK7JZ2LJmFuP4Xpfsmz9h.Dq9/tI/FKAC3CLZ.XHKjsirm6wViI9K','empleado','3815002015','2026-11-19 00:42:22',NULL,NULL,'activo',2,0),(76,'Javier Morales','javier.morales@gmail.com','$2b$10$amKgUmd3xhBysI2fDJVmPud/1rPVgEO34aRmScyjaMVPZ23n2ZiFi','empleado','3815002016','2026-11-19 00:42:42',NULL,NULL,'activo',2,0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19  1:14:44
