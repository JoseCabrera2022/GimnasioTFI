CREATE DATABASE  IF NOT EXISTS `gymmanager_pro` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gymmanager_pro`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: gymmanager_pro
-- ------------------------------------------------------
-- Server version	8.0.43

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
INSERT INTO `actividades` VALUES (2,'Spinning','Clase de spinning de alta intensidad',NULL,'2025-11-18 04:17:16',1),(3,'Crossfit','Entrenamiento funcional de fuerza',NULL,'2025-11-18 04:17:16',1),(4,'Zumba','Clase de baile fitness',NULL,'2025-11-18 04:17:16',1),(5,'Natación','Entrenamiento en pileta olímpica',NULL,'2025-11-18 04:17:16',1),(6,'Yoga','Sesión de yoga relajante',NULL,'2025-11-18 04:17:16',2),(7,'Spinning','Clase de spinning de alta intensidad',NULL,'2025-11-18 04:17:16',2),(8,'Crossfit','Entrenamiento funcional de fuerza',NULL,'2025-11-18 04:17:16',2),(9,'Zumba','Clase de baile fitness',NULL,'2025-11-18 04:17:16',1),(10,'Natación','Entrenamiento en pileta olímpica','/uploads/1763586109490.jpg','2025-11-18 04:17:16',2),(11,'Calistenia','Entrenamiento en barras al aire libre, gánale a tu cuerpo',NULL,'2025-11-23 01:59:16',1),(12,'Cardio','Mejora tu salud',NULL,'2025-11-23 14:18:26',1);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresias`
--

LOCK TABLES `membresias` WRITE;
/*!40000 ALTER TABLE `membresias` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_contacto`
--

LOCK TABLES `mensajes_contacto` WRITE;
/*!40000 ALTER TABLE `mensajes_contacto` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes`
--

LOCK TABLES `planes` WRITE;
/*!40000 ALTER TABLE `planes` DISABLE KEYS */;
INSERT INTO `planes` VALUES (1,'basico','Plan Básico',7000.00,'Acceso estándar (lunes a viernes), control de asistencia, reservas online'),(2,'estandar','Plan Estándar',11200.00,'Incluye beneficios del básico, pagos automáticos, 30% de descuento en productos'),(3,'premium','Plan Premium',15400.00,'Incluye todo lo anterior, acceso exclusivo fines de semana, clases ilimitadas, entrenador personal');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
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
INSERT INTO `turnos` VALUES (3,2,'2025-11-25 18:00:00',20),(4,2,'2025-11-27 18:00:00',20),(5,3,'2025-11-28 19:00:00',25),(6,4,'2025-11-29 17:00:00',30),(7,5,'2025-11-30 10:00:00',12),(8,6,'2025-11-18 09:00:00',20),(9,6,'2025-11-18 18:00:00',20),(10,7,'2025-11-20 10:00:00',15),(11,7,'2025-11-20 19:00:00',15),(12,8,'2025-11-17 11:00:00',12),(13,8,'2025-11-17 20:00:00',12),(14,9,'2025-11-19 12:00:00',25),(15,9,'2025-11-19 21:00:00',25),(16,10,'2025-11-21 13:00:00',10),(17,10,'2025-11-21 22:00:00',10),(18,2,'2025-11-18 14:30:00',10),(19,10,'2025-11-24 08:30:00',15),(20,8,'2025-11-18 14:30:00',10),(21,3,'2025-11-24 08:30:00',10),(23,8,'2025-11-23 15:00:00',10),(24,11,'2025-11-22 19:00:00',8),(26,12,'2025-11-23 11:30:00',1);
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Atlas Gym','Reconquista 460','Banda del Río Salí','Tucumán','Argentina','‪+54 381 555-1234‬','contacto@atlasgym.com',-26.84211110,-65.16120300,'2025-11-18 16:01:46'),(2,'Atlas Gym','25 de Mayo 123','San Miguel de Tucumán','Tucumán','Argentina','‪+54 381 555-4567‬','sanmiguel@atlasgym.com',-26.81670000,-65.21670000,'2025-11-18 16:01:51');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'José Francisco Cabrera','jose.cabrera.2k7@gmail.com','$2b$10$Ru1FK/t89qxk1ZDnlT4rreuRZLHlUXHKEB2qJOyWM/X6tW3kz7oFq','admin','3816558684','2025-12-03 05:59:24',NULL,'2026-10-20 23:46:16','activo',1,0),(4,'Usuario','jose.cabrera.2k7@outlook.es','$2b$10$iSXiOJob.hlQIChy4Pmynu8OeLOwT/RPp5YCP4w2sUJUlpYOrrcf6','socio','3816558684','2026-10-20 20:07:24',NULL,'2026-10-20 23:55:38','activo',1,1);
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

-- Dump completed on 2026-10-20 21:27:35
