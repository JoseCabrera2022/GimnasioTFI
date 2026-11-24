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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
INSERT INTO `actividades` VALUES (1,'Yoga','Práctica de posturas, respiración y movilidad para trabajar flexibilidad y equilibrio, con variantes según el nivel.',NULL,'2025-11-23 14:20:23',1,0),(2,'Spinning','Clase grupal de ciclismo indoor con cambios de ritmo y resistencia ajustables a cada participante.',NULL,'2025-11-23 15:12:12',1,0),(3,'Crossfit','Entrenamiento funcional que combina fuerza, resistencia y movimientos variados, con ejercicios adaptables a distintos niveles.',NULL,'2025-11-18 04:17:16',1,0),(4,'Cardio','Sesión aeróbica de intensidad ajustable, orientada a trabajar la resistencia cardiovascular.',NULL,'2025-11-18 05:12:15',2,0),(5,'Natación','Práctica de natación enfocada en técnica, coordinación y resistencia en el agua.',NULL,'2025-11-18 04:17:16',1,0),(6,'Yoga','Práctica de posturas, respiración y movilidad para trabajar flexibilidad y equilibrio, con variantes según el nivel.',NULL,'2025-11-18 04:17:16',2,0),(7,'Spinning','Clase grupal de ciclismo indoor con cambios de ritmo y resistencia ajustables a cada participante.',NULL,'2025-11-18 04:17:16',2,0),(8,'Crossfit','Entrenamiento funcional que combina fuerza, resistencia y movimientos variados, con ejercicios adaptables a distintos niveles.',NULL,'2025-11-18 04:17:16',2,0),(9,'Zumba','Clase grupal de baile con ritmos variados y movimientos aeróbicos, adaptable a distintos niveles.',NULL,'2025-11-18 04:17:16',1,0),(10,'Natación','Práctica de natación enfocada en técnica, coordinación y resistencia en el agua.','/uploads/1793835606856.jpg','2025-11-18 04:17:16',2,0),(11,'Calistenia','Entrenamiento con el peso corporal para desarrollar fuerza y control mediante ejercicios progresivos.',NULL,'2025-11-23 01:59:16',1,0),(12,'Cardio','Sesión aeróbica de intensidad ajustable, orientada a trabajar la resistencia cardiovascular.',NULL,'2025-11-23 14:18:26',1,0),(13,'Calistenia','Entrenamiento con el peso corporal para desarrollar fuerza y control mediante ejercicios progresivos.',NULL,'2025-11-18 05:12:15',2,0),(14,'Zumba','Clase grupal de baile con ritmos variados y movimientos aeróbicos, adaptable a distintos niveles.',NULL,'2025-11-18 05:12:15',2,0);
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reserva_id` int NOT NULL,
  `empleado_id` int DEFAULT NULL,
  `registrado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asistencias_reserva` (`reserva_id`),
  KEY `idx_asistencias_empleado` (`empleado_id`),
  CONSTRAINT `fk_asistencias_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_asistencias_reserva` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (1,14,75,'2026-11-23 01:01:35');
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
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
-- Table structure for table `ingresos_gimnasio`
--

DROP TABLE IF EXISTS `ingresos_gimnasio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingresos_gimnasio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `ubicacion_id` int NOT NULL,
  `empleado_id` int DEFAULT NULL,
  `ingresado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ingresos_socio_fecha` (`usuario_id`,`ingresado_en`),
  KEY `idx_ingresos_sede_fecha` (`ubicacion_id`,`ingresado_en`),
  KEY `idx_ingresos_empleado` (`empleado_id`),
  CONSTRAINT `fk_ingresos_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ingresos_sede` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ingresos_socio` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresos_gimnasio`
--

LOCK TABLES `ingresos_gimnasio` WRITE;
/*!40000 ALTER TABLE `ingresos_gimnasio` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingresos_gimnasio` ENABLE KEYS */;
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
  UNIQUE KEY `uq_membresias_pago_id` (`pago_id`),
  KEY `plan_id` (`plan_id`),
  KEY `duracion_id` (`duracion_id`),
  KEY `pago_id` (`pago_id`),
  KEY `fk_membresias_usuario_cascade` (`usuario_id`),
  CONSTRAINT `fk_membresias_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membresias_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membresias_ibfk_3` FOREIGN KEY (`duracion_id`) REFERENCES `duraciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `membresias_ibfk_4` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresias`
--

LOCK TABLES `membresias` WRITE;
/*!40000 ALTER TABLE `membresias` DISABLE KEYS */;
INSERT INTO `membresias` VALUES (1,5,3,1,1,'2026-11-04 18:22:53','2026-12-04 18:22:53','activa','2026-11-04 21:22:53'),(2,6,3,1,2,'2026-11-04 18:57:24','2026-12-04 18:57:24','activa','2026-11-04 21:57:23'),(3,7,3,1,3,'2026-11-04 19:16:29','2026-12-04 19:16:29','activa','2026-11-04 22:16:28'),(4,10,3,1,4,'2026-11-05 20:41:21','2026-12-05 20:41:21','activa','2026-11-05 23:41:21'),(5,21,1,1,5,'2026-11-20 19:29:42','2026-12-20 19:29:42','activa','2026-11-20 22:29:42'),(6,51,3,1,6,'2026-11-20 19:47:01','2026-12-20 19:47:01','activa','2026-11-20 22:47:00'),(7,52,2,1,7,'2026-11-20 19:50:00','2026-12-20 19:50:00','activa','2026-11-20 22:50:00'),(8,53,1,3,8,'2026-11-20 19:52:27','2027-11-20 19:52:27','activa','2026-11-20 22:52:27'),(9,13,1,1,9,'2026-11-20 20:43:22','2026-12-20 20:43:22','activa','2026-11-20 23:43:25'),(10,16,1,1,10,'2026-11-20 20:51:54','2026-12-20 20:51:54','activa','2026-11-20 23:51:56'),(11,15,1,1,11,'2026-11-20 21:08:54','2026-12-20 21:08:54','activa','2026-11-21 00:08:57'),(12,12,3,1,12,'2026-11-20 21:13:14','2026-12-20 21:13:14','activa','2026-11-21 00:13:15'),(13,14,2,1,13,'2026-11-20 21:18:22','2026-12-20 21:18:22','activa','2026-11-21 00:18:23'),(14,37,3,1,14,'2026-11-22 21:30:11','2026-12-22 21:30:11','activa','2026-11-23 00:30:12');
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
INSERT INTO `mensajes_contacto` VALUES (1,'prueba2','prueba2@gmail.com','Probando...','2026-11-04 22:17:45',1,'No pruebes','2026-11-23 02:21:42');
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
  `plan_id` int DEFAULT NULL,
  `duracion_id` int DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `estado` varchar(40) NOT NULL,
  `fecha_aprobado` datetime DEFAULT NULL,
  `metodo_pago` varchar(100) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_pago_mp` (`id_pago_mp`),
  KEY `fk_pagos_usuario_cascade` (`usuario_id`),
  KEY `idx_pagos_plan_id` (`plan_id`),
  KEY `idx_pagos_duracion_id` (`duracion_id`),
  CONSTRAINT `fk_pagos_duracion` FOREIGN KEY (`duracion_id`) REFERENCES `duraciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pagos_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pagos_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,'186733440791',5,3,1,15400.00,'approved','2026-11-04 18:22:51','credit_card','2026-11-04 21:22:53'),(2,'186740652457',6,3,1,15400.00,'approved','2026-11-04 18:57:23','credit_card','2026-11-04 21:57:23'),(3,'187803122198',7,3,1,15400.00,'approved','2026-11-04 19:16:28','credit_card','2026-11-04 22:16:28'),(4,'186955830197',10,3,1,15400.00,'approved','2026-11-05 20:20:47','credit_card','2026-11-05 23:41:21'),(5,'189708983577',21,1,1,7000.00,'approved','2026-11-20 19:29:39','credit_card','2026-11-20 22:29:42'),(6,'189712399167',51,3,1,15400.00,'approved','2026-11-20 19:46:59','credit_card','2026-11-20 22:47:00'),(7,'190799743402',52,2,1,11200.00,'approved','2026-11-20 19:49:58','credit_card','2026-11-20 22:50:00'),(8,'189713832201',53,1,3,59617.00,'approved','2026-11-20 19:52:26','credit_card','2026-11-20 22:52:27'),(9,'189723862411',13,1,1,7000.00,'approved','2026-11-20 20:43:22','credit_card','2026-11-20 23:43:25'),(10,'190812722174',16,1,1,7000.00,'approved','2026-11-20 20:51:54','credit_card','2026-11-20 23:51:56'),(11,'190815255144',15,1,1,7000.00,'approved','2026-11-20 21:08:54','credit_card','2026-11-21 00:08:57'),(12,'190815935650',12,3,1,15400.00,'approved','2026-11-20 21:13:14','credit_card','2026-11-21 00:13:15'),(13,'190817276420',14,2,1,11200.00,'approved','2026-11-20 21:18:22','credit_card','2026-11-21 00:18:23'),(14,'190045867407',37,3,1,15400.00,'approved','2026-11-22 21:30:11','credit_card','2026-11-23 00:30:12');
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
  `estado` enum('pendiente','confirmada','cancelada','expirada') DEFAULT 'confirmada',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `turno_id` (`turno_id`),
  KEY `fk_reservas_usuario_cascade` (`usuario_id`),
  CONSTRAINT `fk_reservas_usuario_cascade` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,7,26,'expirada','2026-11-04 23:57:23'),(2,7,24,'expirada','2026-11-04 23:57:36'),(3,21,13,'expirada','2026-11-20 22:30:44'),(4,21,37,'expirada','2026-11-20 22:31:23'),(5,21,17,'expirada','2026-11-20 22:31:37'),(6,51,13,'expirada','2026-11-20 22:47:14'),(7,51,37,'expirada','2026-11-20 22:47:45'),(8,51,104,'confirmada','2026-11-20 22:48:24'),(9,51,117,'confirmada','2026-11-20 22:48:36'),(10,37,109,'confirmada','2026-11-23 00:34:10'),(11,37,125,'confirmada','2026-11-23 00:35:28'),(12,53,107,'confirmada','2026-11-23 00:37:04'),(13,53,122,'cancelada','2026-11-23 00:37:09'),(14,53,222,'confirmada','2026-11-23 00:58:10'),(15,53,41,'confirmada','2026-11-23 01:20:42');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turno_entrenadores`
--

DROP TABLE IF EXISTS `turno_entrenadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno_entrenadores` (
  `turno_id` int NOT NULL,
  `empleado_id` int NOT NULL,
  `asignado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`turno_id`,`empleado_id`),
  KEY `idx_turno_entrenadores_empleado` (`empleado_id`,`turno_id`),
  CONSTRAINT `fk_turno_entrenadores_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_turno_entrenadores_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turno_entrenadores`
--

LOCK TABLES `turno_entrenadores` WRITE;
/*!40000 ALTER TABLE `turno_entrenadores` DISABLE KEYS */;
INSERT INTO `turno_entrenadores` VALUES (8,69,'2026-11-20 21:53:18'),(8,70,'2026-11-20 21:53:18'),(9,69,'2026-11-20 21:53:25'),(9,70,'2026-11-20 21:53:25'),(10,72,'2026-11-20 22:09:18'),(10,75,'2026-11-20 22:09:18'),(11,72,'2026-11-20 22:09:22'),(11,75,'2026-11-20 22:09:22'),(12,74,'2026-11-20 22:11:30'),(12,76,'2026-11-20 22:11:30'),(13,74,'2026-11-20 22:11:41'),(13,76,'2026-11-20 22:11:41'),(16,71,'2026-11-20 22:13:45'),(16,73,'2026-11-20 22:13:45'),(17,71,'2026-11-20 22:14:01'),(17,73,'2026-11-20 22:14:01'),(19,71,'2026-11-20 22:13:39'),(19,73,'2026-11-20 22:13:39'),(20,74,'2026-11-20 22:11:24'),(20,76,'2026-11-20 22:11:24'),(23,74,'2026-11-20 22:11:11'),(23,76,'2026-11-20 22:11:11'),(27,69,'2026-11-20 21:51:42'),(27,70,'2026-11-20 21:51:42'),(28,74,'2026-11-20 22:12:42'),(28,76,'2026-11-20 22:12:42'),(29,72,'2026-11-20 22:09:11'),(29,75,'2026-11-20 22:09:11'),(30,72,'2026-11-20 22:09:15'),(30,75,'2026-11-20 22:09:15'),(31,69,'2026-11-20 21:53:11'),(31,70,'2026-11-20 21:53:11'),(32,71,'2026-11-20 22:13:49'),(32,73,'2026-11-20 22:13:49'),(36,72,'2026-11-20 22:09:30'),(36,75,'2026-11-20 22:09:30'),(37,69,'2026-11-20 21:53:36'),(37,70,'2026-11-20 21:53:36'),(41,74,'2026-11-20 22:11:46'),(41,76,'2026-11-20 22:11:46'),(45,71,'2026-11-20 22:14:14'),(45,73,'2026-11-20 22:14:14'),(46,72,'2026-11-20 22:09:38'),(46,75,'2026-11-20 22:09:38'),(50,74,'2026-11-20 22:11:51'),(50,76,'2026-11-20 22:11:51'),(54,71,'2026-11-20 22:14:24'),(54,73,'2026-11-20 22:14:24'),(55,72,'2026-11-20 22:09:48'),(55,75,'2026-11-20 22:09:48'),(58,71,'2026-11-20 22:14:30'),(58,73,'2026-11-20 22:14:30'),(60,74,'2026-11-20 22:11:56'),(60,76,'2026-11-20 22:11:56'),(63,72,'2026-11-20 22:09:58'),(63,75,'2026-11-20 22:09:58'),(64,69,'2026-11-20 21:56:01'),(64,70,'2026-11-20 21:56:01'),(68,74,'2026-11-20 22:12:00'),(68,76,'2026-11-20 22:12:00'),(72,71,'2026-11-20 22:14:49'),(72,73,'2026-11-20 22:14:49'),(73,72,'2026-11-20 22:10:11'),(73,75,'2026-11-20 22:10:11'),(77,74,'2026-11-20 22:12:04'),(77,76,'2026-11-20 22:12:04'),(81,71,'2026-11-20 22:14:59'),(81,73,'2026-11-20 22:14:59'),(82,72,'2026-11-20 22:10:25'),(82,75,'2026-11-20 22:10:25'),(85,71,'2026-11-20 22:15:04'),(85,73,'2026-11-20 22:15:04'),(87,74,'2026-11-20 22:12:15'),(87,76,'2026-11-20 22:12:15'),(90,72,'2026-11-20 22:10:36'),(90,75,'2026-11-20 22:10:36'),(91,69,'2026-11-20 21:57:31'),(91,70,'2026-11-20 21:57:31'),(95,69,'2026-11-20 21:51:53'),(95,70,'2026-11-20 21:51:53'),(96,69,'2026-11-20 21:53:32'),(96,70,'2026-11-20 21:53:32'),(98,74,'2026-11-20 22:12:47'),(98,76,'2026-11-20 22:12:47'),(100,71,'2026-11-20 22:13:56'),(100,73,'2026-11-20 22:13:56'),(101,72,'2026-11-20 22:09:26'),(101,75,'2026-11-20 22:09:26'),(104,69,'2026-11-20 21:52:06'),(104,70,'2026-11-20 21:52:06'),(106,69,'2026-11-20 21:53:49'),(106,70,'2026-11-20 21:53:49'),(107,72,'2026-11-20 22:08:31'),(107,75,'2026-11-20 22:08:31'),(110,74,'2026-11-20 22:12:50'),(110,76,'2026-11-20 22:12:50'),(111,71,'2026-11-20 22:14:07'),(111,73,'2026-11-20 22:14:07'),(112,72,'2026-11-20 22:09:34'),(112,75,'2026-11-20 22:09:34'),(115,69,'2026-11-20 21:52:19'),(115,70,'2026-11-20 21:52:19'),(117,69,'2026-11-20 21:55:07'),(117,70,'2026-11-20 21:55:07'),(118,72,'2026-11-20 22:08:36'),(118,75,'2026-11-20 22:08:36'),(121,74,'2026-11-20 22:12:55'),(121,76,'2026-11-20 22:12:55'),(122,71,'2026-11-20 22:14:19'),(122,73,'2026-11-20 22:14:19'),(123,72,'2026-11-20 22:09:43'),(123,75,'2026-11-20 22:09:43'),(126,69,'2026-11-20 21:52:27'),(126,70,'2026-11-20 21:52:27'),(127,69,'2026-11-20 21:55:48'),(127,70,'2026-11-20 21:55:48'),(128,72,'2026-11-20 22:08:45'),(128,75,'2026-11-20 22:08:45'),(130,74,'2026-11-20 22:13:00'),(130,76,'2026-11-20 22:13:00'),(132,71,'2026-11-20 22:14:35'),(132,73,'2026-11-20 22:14:35'),(133,72,'2026-11-20 22:09:53'),(133,75,'2026-11-20 22:09:53'),(136,69,'2026-11-20 21:52:32'),(136,70,'2026-11-20 21:52:32'),(138,69,'2026-11-20 21:56:08'),(138,70,'2026-11-20 21:56:08'),(139,72,'2026-11-20 22:08:49'),(139,75,'2026-11-20 22:08:49'),(142,74,'2026-11-20 22:13:05'),(142,76,'2026-11-20 22:13:05'),(143,71,'2026-11-20 22:14:41'),(143,73,'2026-11-20 22:14:41'),(144,72,'2026-11-20 22:10:04'),(144,75,'2026-11-20 22:10:04'),(147,69,'2026-11-20 21:52:36'),(147,70,'2026-11-20 21:52:36'),(149,69,'2026-11-20 21:56:26'),(149,70,'2026-11-20 21:56:26'),(150,72,'2026-11-20 22:08:54'),(150,75,'2026-11-20 22:08:54'),(153,74,'2026-11-20 22:13:09'),(153,76,'2026-11-20 22:13:09'),(154,71,'2026-11-20 22:14:55'),(154,73,'2026-11-20 22:14:55'),(155,72,'2026-11-20 22:10:19'),(155,75,'2026-11-20 22:10:19'),(158,69,'2026-11-20 21:52:41'),(158,70,'2026-11-20 21:52:41'),(159,69,'2026-11-20 21:56:46'),(159,70,'2026-11-20 21:56:46'),(160,72,'2026-11-20 22:08:58'),(160,75,'2026-11-20 22:08:58'),(162,74,'2026-11-20 22:13:13'),(162,76,'2026-11-20 22:13:13'),(164,71,'2026-11-20 22:15:10'),(164,73,'2026-11-20 22:15:10'),(165,72,'2026-11-20 22:10:31'),(165,75,'2026-11-20 22:10:31'),(222,72,'2026-11-23 00:57:42'),(222,75,'2026-11-23 00:57:42');
/*!40000 ALTER TABLE `turno_entrenadores` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turnos`
--

LOCK TABLES `turnos` WRITE;
/*!40000 ALTER TABLE `turnos` DISABLE KEYS */;
INSERT INTO `turnos` VALUES (5,3,'2026-11-16 19:00:00',25),(7,5,'2026-11-16 10:00:00',12),(8,6,'2026-11-17 09:00:00',20),(9,6,'2026-11-17 18:00:00',20),(10,7,'2026-11-18 10:00:00',15),(11,7,'2026-11-19 19:00:00',15),(12,8,'2026-11-19 11:00:00',12),(13,8,'2026-11-20 20:00:00',12),(14,9,'2026-11-17 12:00:00',25),(15,9,'2026-11-17 21:00:00',25),(16,10,'2026-11-16 13:00:00',10),(17,10,'2026-11-21 22:00:00',10),(19,10,'2026-11-16 08:30:00',15),(20,8,'2026-11-18 14:30:00',10),(21,3,'2026-11-18 08:30:00',10),(23,8,'2026-11-05 15:00:00',10),(24,11,'2026-11-22 19:00:00',8),(26,12,'2026-11-20 11:30:00',1),(27,14,'2026-11-16 17:00:00',20),(28,13,'2026-11-16 08:00:00',20),(29,7,'2026-11-16 09:00:00',15),(30,7,'2026-11-16 18:30:00',15),(31,6,'2026-11-16 20:00:00',20),(32,10,'2026-11-20 18:00:00',10),(33,9,'2026-11-20 18:00:00',20),(34,3,'2026-11-20 20:00:00',12),(35,11,'2026-11-21 11:00:00',12),(36,7,'2026-11-21 11:00:00',15),(37,6,'2026-11-21 09:00:00',18),(38,5,'2026-11-21 09:00:00',10),(39,12,'2026-11-23 08:00:00',15),(40,9,'2026-11-23 20:00:00',20),(41,8,'2026-11-23 20:00:00',12),(43,5,'2026-11-23 18:00:00',10),(44,11,'2026-11-24 20:00:00',12),(45,10,'2026-11-24 20:00:00',10),(46,7,'2026-11-24 18:00:00',15),(47,3,'2026-11-24 18:00:00',12),(48,12,'2026-11-25 08:00:00',15),(49,9,'2026-11-25 20:00:00',20),(50,8,'2026-11-25 20:00:00',12),(52,5,'2026-11-25 18:00:00',10),(53,11,'2026-11-26 20:00:00',12),(54,10,'2026-11-26 20:00:00',10),(55,7,'2026-11-26 18:00:00',15),(56,3,'2026-11-26 18:00:00',12),(57,12,'2026-11-27 08:00:00',15),(58,10,'2026-11-27 18:00:00',10),(59,9,'2026-11-27 18:00:00',20),(60,8,'2026-11-27 20:00:00',12),(61,3,'2026-11-27 20:00:00',12),(62,11,'2026-11-28 11:00:00',12),(63,7,'2026-11-28 11:00:00',15),(64,6,'2026-11-28 09:00:00',18),(65,5,'2026-11-28 09:00:00',10),(66,12,'2026-11-30 08:00:00',15),(67,9,'2026-11-30 20:00:00',20),(68,8,'2026-11-30 20:00:00',12),(70,5,'2026-11-30 18:00:00',10),(71,11,'2026-12-01 20:00:00',12),(72,10,'2026-12-01 20:00:00',10),(73,7,'2026-12-01 18:00:00',15),(74,3,'2026-12-01 18:00:00',12),(75,12,'2026-12-02 08:00:00',15),(76,9,'2026-12-02 20:00:00',20),(77,8,'2026-12-02 20:00:00',12),(79,5,'2026-12-02 18:00:00',10),(80,11,'2026-12-03 20:00:00',12),(81,10,'2026-12-03 20:00:00',10),(82,7,'2026-12-03 18:00:00',15),(83,3,'2026-12-03 18:00:00',12),(84,12,'2026-12-04 08:00:00',15),(85,10,'2026-12-04 18:00:00',10),(86,9,'2026-12-04 18:00:00',20),(87,8,'2026-12-04 20:00:00',12),(88,3,'2026-12-04 20:00:00',12),(89,11,'2026-12-05 11:00:00',12),(90,7,'2026-12-05 11:00:00',15),(91,6,'2026-12-05 09:00:00',18),(92,5,'2026-12-05 09:00:00',10),(95,14,'2026-11-20 18:00:00',20),(96,6,'2026-11-20 16:00:00',18),(97,1,'2026-11-20 16:00:00',18),(98,13,'2026-11-21 13:00:00',12),(99,11,'2026-11-21 13:00:00',12),(100,10,'2026-11-21 11:00:00',10),(101,7,'2026-11-21 09:00:00',15),(102,5,'2026-11-21 11:00:00',10),(103,2,'2026-11-21 09:00:00',15),(104,14,'2026-11-23 18:00:00',20),(105,9,'2026-11-23 18:00:00',20),(106,6,'2026-11-23 16:00:00',18),(107,4,'2026-11-23 08:00:00',15),(108,3,'2026-11-23 20:00:00',12),(109,1,'2026-11-23 16:00:00',18),(110,13,'2026-11-24 20:00:00',12),(111,10,'2026-11-24 18:00:00',10),(112,7,'2026-11-24 16:00:00',15),(113,5,'2026-11-24 18:00:00',10),(114,2,'2026-11-24 16:00:00',15),(115,14,'2026-11-25 18:00:00',20),(116,9,'2026-11-25 18:00:00',20),(117,6,'2026-11-25 16:00:00',18),(118,4,'2026-11-25 08:00:00',15),(119,3,'2026-11-25 20:00:00',12),(120,1,'2026-11-25 16:00:00',18),(121,13,'2026-11-26 20:00:00',12),(122,10,'2026-11-26 18:00:00',10),(123,7,'2026-11-26 16:00:00',15),(124,5,'2026-11-26 18:00:00',10),(125,2,'2026-11-26 16:00:00',15),(126,14,'2026-11-27 18:00:00',20),(127,6,'2026-11-27 16:00:00',18),(128,4,'2026-11-27 08:00:00',15),(129,1,'2026-11-27 16:00:00',18),(130,13,'2026-11-28 13:00:00',12),(131,11,'2026-11-28 13:00:00',12),(132,10,'2026-11-28 11:00:00',10),(133,7,'2026-11-28 09:00:00',15),(134,5,'2026-11-28 11:00:00',10),(135,2,'2026-11-28 09:00:00',15),(136,14,'2026-11-30 18:00:00',20),(137,9,'2026-11-30 18:00:00',20),(138,6,'2026-11-30 16:00:00',18),(139,4,'2026-11-30 08:00:00',15),(140,3,'2026-11-30 20:00:00',12),(141,1,'2026-11-30 16:00:00',18),(142,13,'2026-12-01 20:00:00',12),(143,10,'2026-12-01 18:00:00',10),(144,7,'2026-12-01 16:00:00',15),(145,5,'2026-12-01 18:00:00',10),(146,2,'2026-12-01 16:00:00',15),(147,14,'2026-12-02 18:00:00',20),(148,9,'2026-12-02 18:00:00',20),(149,6,'2026-12-02 16:00:00',18),(150,4,'2026-12-02 08:00:00',15),(151,3,'2026-12-02 20:00:00',12),(152,1,'2026-12-02 16:00:00',18),(153,13,'2026-12-03 20:00:00',12),(154,10,'2026-12-03 18:00:00',10),(155,7,'2026-12-03 16:00:00',15),(156,5,'2026-12-03 18:00:00',10),(157,2,'2026-12-03 16:00:00',15),(158,14,'2026-12-04 18:00:00',20),(159,6,'2026-12-04 16:00:00',18),(160,4,'2026-12-04 08:00:00',15),(161,1,'2026-12-04 16:00:00',18),(162,13,'2026-12-05 13:00:00',12),(163,11,'2026-12-05 13:00:00',12),(164,10,'2026-12-05 11:00:00',10),(165,7,'2026-12-05 09:00:00',15),(166,5,'2026-12-05 11:00:00',10),(167,2,'2026-12-05 09:00:00',15),(222,4,'2026-11-22 22:00:00',5);
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
INSERT INTO `usuarios` VALUES (1,'José Francisco Cabrera','jose.cabrera.2k7@gmail.com','$2b$10$Ru1FK/t89qxk1ZDnlT4rreuRZLHlUXHKEB2qJOyWM/X6tW3kz7oFq','admin','3816558684','2025-12-03 05:59:24',NULL,'2026-10-20 23:46:16','activo',1,0),(4,'Usuario','jose.cabrera.2k7@outlook.es','$2b$10$iSXiOJob.hlQIChy4Pmynu8OeLOwT/RPp5YCP4w2sUJUlpYOrrcf6','socio','3816558684','2026-10-20 20:07:24',NULL,'2026-11-02 13:07:40','activo',1,0),(5,'Nicolas Zelarayan','nicolaszelarayan2003@gmail.com','$2b$10$CFFi653m5.fDQOWiQob31eBs.LySzPyvcIGRI0EONvpdJ4NPU3OTS','admin','3813242343','2026-11-04 20:55:03','/uploads/1793825856071.jpg','2026-11-22 23:33:11','activo',1,0),(6,'prueba','prueba@gmail.com','$2b$10$57WSUPETuXS/xZqyR2v9.OZT90DGyZhJgV4x5GJaimGI06qZDh3vK','socio','1233434','2026-11-04 21:57:01',NULL,NULL,'activo',1,0),(7,'prueba2','prueba2@gmail.com','$2b$10$NqG2cxBZNsLQeGS7T5AVxuhLoYLhTYNcS/xjZR17O0/6SQe9xwzMe','socio','1241274712','2026-11-04 22:16:13',NULL,NULL,'activo',1,0),(8,'Martin','martin@gmail.com','$2b$10$BOJo3/WdeZWNEBbtCXnqbeXbHDIh6E5rJOZmKnjfY1mGEoXmaQIKa','socio','2414214124','2026-11-05 00:24:04',NULL,NULL,'activo',2,0),(9,'Empleado','empleado@gmail.com','$2b$10$joEgSz9VZw3u44.b.dEpj.RfNykpsD9tjWWgz7.zJ7ADmTXF.2svi','empleado','381578594','2026-11-05 22:53:52',NULL,NULL,'activo',1,0),(10,'Lucaas','lucas@gmail.com','$2b$10$8EwiX.XEKZSItoogfgVKYeuA5jFyH.UyD/GTyi7OH/I/0MyIZfFbG','socio','244324324','2026-11-05 23:19:48',NULL,NULL,'activo',1,0),(11,'Juan Pérez','juan.perez@gmail.com','$2b$10$CmHZxJaiwHMoMt7erYkj7OZHBTRQ4a2pXZNf4rUr6pjzzsCryPWYW','socio','3814001001','2026-11-18 23:46:56',NULL,NULL,'activo',1,0),(12,'María Gómez','maria.gomez@gmail.com','$2b$10$7RHMeY0txb.8z.N7ZDHC8OMz08gg9j8ihqf807hUL4nH6VnQTaLxW','socio','3814001002','2026-11-18 23:48:18',NULL,NULL,'activo',1,0),(13,'Carlos Rodríguez','carlos.rodriguez@gmail.com','$2b$10$j7r/xwfC8O/F/QUQAjBdAev.em5QB6mstvi82UHgkmdV1XeuxNR3i','socio','3814001003','2026-11-18 23:49:23',NULL,NULL,'activo',1,0),(14,'Ana Fernández','ana.fernandez@gmail.com','$2b$10$wbY3vyRM8GIkXiNghszTuugfUOWFWyiPIG4vdAKxCyxFLdcucrbqO','socio','3814001004','2026-11-18 23:49:56',NULL,NULL,'activo',1,0),(15,'Lucas Martínez','lucas.martinez05@gmail.com','$2b$10$/j6iqBQqW6Cb6JYl.sIWJeOcpseQTTcHgwfLmwZXyaDSClltTsYXK','socio','3814001005','2026-11-18 23:50:50',NULL,NULL,'activo',1,0),(16,'Sofía López','sofia.lopez@gmail.com','$2b$10$EHBKHMBp.9KLav.8AtgIP.TdkuB0vIq9DAxGwQf1z44Y2tEqoY88a','socio','3814001006','2026-11-18 23:52:00',NULL,NULL,'activo',1,0),(17,'Diego González','diego.gonzalez@gmail.com','$2b$10$jRfUMc7h/Fa5k2NBzMeZO.2S5oM.jvkCy7co2XG1GM6qbL8spGPQC','socio','3814001007','2026-11-18 23:52:40',NULL,NULL,'activo',1,0),(18,'Camila Díaz','camila.diaz@gmail.com','$2b$10$8QVPeGXUbYWn5lsRBlibR.UhshDuBB8aCJkyYmdvlhKDnorRzm4Xm','socio','3814001008','2026-11-18 23:53:15',NULL,NULL,'activo',1,0),(19,'Martín Sánchez','martin.sanchez@gmail.com','$2b$10$XxUfYLKzDOuvf59qtK0MZuZ4z42rULuBktC20AOv4SZSXsqPL84.6','socio','3814001009','2026-11-18 23:54:59',NULL,NULL,'activo',1,0),(20,'Valentina Romero','valentina.romero@gmail.com','$2b$10$YUKWjBNjpXs1fbnlSFhmhufwWnI6VLLPrkiinWjHwcI3Z5tWu4FBS','socio','3814001010','2026-11-18 23:55:34',NULL,NULL,'activo',1,0),(21,'Nicolás Torres','nicolas.torres@gmail.com','$2b$10$kh9IFIYvNm87QpuGMo8ScOymN28msXf9edvex6flmrn8RlvYGNzpy','socio','3814001011','2026-11-18 23:56:31',NULL,NULL,'activo',2,0),(22,'Paula Herrera','paula.herrera@gmail.com','$2b$10$6.1ayy3GkvsSx/eZaCO1bOuFsYmkFS46S0FS722i/IuzO7jXQxAXq','socio','3814001012','2026-11-18 23:57:09',NULL,NULL,'activo',2,0),(23,'Agustín Castro','agustin.castro@gmail.com','$2b$10$UUW9BOEXnLGgLftv.zOJeugsdfc2DYC2utBAKRWXczg1qfsmOqcOy','socio','3814001013','2026-11-18 23:57:59',NULL,NULL,'activo',2,0),(24,'Florencia Acosta','flor.acosta@gmail.com','$2b$10$oQVtCPGvF17lToMKWHhr5uGR10Osm1vgRul9e2iOFrt3fUDOVorLu','socio','3814001014','2026-11-18 23:58:19',NULL,NULL,'activo',2,0),(25,'Javier Méndez','javier.mendez@gmail.com','$2b$10$pBZjfGzI3IicYYVvjHeAhuV7Q8dvqiff/FR5.sYsOy/3Ya6PfW8QW','socio','3814001015','2026-11-18 23:58:42',NULL,NULL,'activo',2,0),(26,'Lucía Ramírez','lucia.ramirez@gmail.com','$2b$10$vGOMkL6Hs2FffGSAgOoRUuoYkvvpdA8EUxizvn3b4Gu1i0yhp/Kti','socio','3814001016','2026-11-18 23:59:12',NULL,NULL,'activo',2,0),(27,'Emiliano Juárez','emi.juarez@gmail.com','$2b$10$QOGzR.krT/9WYMuegOWLA.c0.rdhKpmzGC3CrxuhaT/p2L0fBXat.','socio','3814001017','2026-11-18 23:59:43',NULL,NULL,'activo',2,0),(28,'Martina Vargas','martina.vargas@gmail.com','$2b$10$gYan0fce1loZWXaXDJ9hxucmMdoi.J75NHKV90sspJkC4fIfzieZ.','socio','3814001018','2026-11-19 00:00:09',NULL,NULL,'activo',2,0),(29,'Santiago Silva','santiago.silva@gmail.com','$2b$10$wOCVSSaBKG5dvLY2Xc52fOWjoJVdiq4K7Ihxqst0fm9LR8ZTyrPtO','socio','3814001019','2026-11-19 00:00:45',NULL,NULL,'activo',2,0),(30,'Carolina Molina','carolina.molina@gmail.com','$2b$10$VF99QWLuSW1vQLv8gT8RquPPjyw5Zr/2O3tFEB3YTrxynneFimg0C','socio','3814001020','2026-11-19 00:01:19',NULL,NULL,'activo',2,0),(31,'Facundo Núñez','facu.nunez@gmail.com','$2b$10$JdpHdAAikrL2a6aRMyllGegcansx/QSw47OTDb/ISLYTZEjYoh8gG','socio','3814001021','2026-11-19 00:02:27',NULL,NULL,'activo',1,0),(32,'Agostina Peralta','agos.peralta@gmail.com','$2b$10$6.ZmvDQrPH2f5Dm.VETIPuAlgLXmYEPNLazqAYtnXkJqIvdUKJx02','socio','3814001022','2026-11-19 00:02:51',NULL,NULL,'activo',1,0),(33,'Gabriel Medina','gabriel.medina@gmail.com','$2b$10$UD/n3JlsTn9CcdSygJdPOOoTqSeb1iGDMtQ7S3TKWG/BkVJ6p9KtW','socio','3814001023','2026-11-19 00:03:16',NULL,NULL,'activo',1,0),(34,'Victoria Rojas','vicky.rojas@gmail.com','$2b$10$y8WPvGojoeKbw8pmQ9pDsOHJvydtI.8HSJT/f5I3MWnwmHO/Lqb6O','socio','3814001024','2026-11-19 00:04:00',NULL,NULL,'activo',1,0),(35,'Andrés Sosa','andres.sosa@gmail.com','$2b$10$3w8z7GT1Z2lhhDJzkUiazu3oDHFghhyOfYNw/Yilrc3x9uci0HV0u','socio','3814001025','2026-11-19 00:04:24',NULL,NULL,'activo',1,0),(36,'Belén Ortiz','belen.ortiz@gmail.com','$2b$10$0w2i0lFyi9BefKbHO9neT.v3YIOiyfdnKCVoS0TwDO5xjX9CB43a6','socio','3814001026','2026-11-19 00:04:50',NULL,NULL,'activo',1,0),(37,'Tomás Aguirre','tomas.aguirre@gmail.com','$2b$10$DIC3WU/L8LTHDxalaK771.Ol0dylX7/yubt2Mo1k94lFPkTGn2Dli','socio','3814001027','2026-11-19 00:05:15',NULL,NULL,'activo',1,0),(38,'Julieta Ponce','juli.ponce@gmail.com','$2b$10$.HBPJhFmNJW2JVIY4SSucOcjE12JWTTHHiTSUucaq4pWCDZzPdSUi','socio','3814001028','2026-11-19 00:05:38',NULL,NULL,'activo',1,0),(39,'Matías Vega','mati.vega@gmail.com','$2b$10$uUH8tguuHICJGA8n6Ra56.1TTRJyc3pumh/vCi3LdWjt/Equ0qd1S','socio','3814001029','2026-11-19 00:06:03',NULL,NULL,'activo',1,0),(40,'Daniela Guzmán','daniela.guzman@gmail.com','$2b$10$SnAkBinwJIoVoxLM07rqnOY.LgpB7L4WMzVYH1E66RLdsrGZA1UhC','socio','3814001030','2026-11-19 00:06:29',NULL,NULL,'activo',1,0),(41,'Pablo Cabrera','pablo.cabrera@gmail.com','$2b$10$irYPvFr5MqjpFpp/INmrvuYLWkaHLpmxocYLkkCtxN6I5uaPuZCjK','socio','3814001031','2026-11-19 00:22:21',NULL,NULL,'activo',1,0),(42,'Natalia Luna','nati.luna@gmail.com','$2b$10$7XhN12g4YR4P.CMUhKARTujfqT9Ee4Re9wKwWJZK6w/GZ7GG0vJMy','socio','3814001032','2026-11-19 00:24:57',NULL,NULL,'activo',1,0),(43,'Ezequiel Campos','eze.campos@gmail.com','$2b$10$kV7QlfBJeHv/RPvaMDB7HeoFF5HqCi26lBlbJpftsLEekuieCY2gS','socio','3814001033','2026-11-19 00:25:23',NULL,NULL,'activo',1,0),(44,'Rocío Delgado','rocio.delgado@gmail.com','$2b$10$nmOpFCjTpp.JjSOFIOz84u8gOdV8uBtrunrkii6PcgI9mYrN4eOsW','socio','3814001034','2026-11-19 00:25:45',NULL,NULL,'activo',1,0),(45,'Federico Ríos','fede.rios@gmail.com','$2b$10$s8GLtfHnQBWI4n4aT4CQuugxXTkSzte8kpyBtrKXk3NscAf.KrcQW','socio','3814001035','2026-11-19 00:26:57',NULL,NULL,'activo',1,0),(46,'Antonella Figueroa','anto.figueroa@gmail.com','$2b$10$/lIVfye3onATD.BiJt54Cu2kAdU3LTsEmgCOvl4uIY.9g8u1VSz5S','socio','3814001036','2026-11-19 00:27:55',NULL,NULL,'activo',2,0),(47,'Ramiro Herrera','ramiro.herrera@gmail.com','$2b$10$nz8PYcD2o.flnJg9RqHtyexsFQZuthYhf/PG0hY6CzgVsBLfn7otC','socio','3814001037','2026-11-19 00:28:23',NULL,NULL,'activo',2,0),(48,'Macarena Bravo','maca.bravo@gmail.com','$2b$10$h479BIdAsNf86ux.l5qz9OiQd7wE60jYsXPoXr0RpG3wxNLKAIBoy','socio','3814001038','2026-11-19 00:28:45',NULL,NULL,'activo',2,0),(49,'Leonardo Paz','leo.paz@gmail.com','$2b$10$1k4pM4clkcldZ2yHuK9SHe04J7IOLms.JDwJMWd5jLipJI698RKhm','socio','3814001039','2026-11-19 00:29:00',NULL,NULL,'activo',2,0),(50,'Milagros Duarte','mili.duarte@gmail.com','$2b$10$lIMSPb67zrSI/bN8TkdGEurHNQD75gGaZtecg/2jKRr/YSCXmojYO','socio','3814001040','2026-11-19 00:29:18',NULL,NULL,'activo',2,0),(51,'Ignacio Navarro','nacho.navarro@gmail.com','$2b$10$iFiPlkonSD4hSUl64ty9Rux4IMT1pY4IyqMVr6zBe3AWWuopRuGHa','socio','3814001041','2026-11-19 00:29:36',NULL,NULL,'activo',2,0),(52,'Cecilia Morales','ceci.morales@gmail.com','$2b$10$iQVIu3v.LrJM76biupbI2eq8R00NPaNlnHObVod8GrLSIR5WoHXC2','socio','3814001042','2026-11-19 00:29:52',NULL,NULL,'activo',2,0),(53,'Bruno Villalba','bruno.villalba@gmail.com','$2b$10$MTwKdhtlAb5KXK0E1o2JWeeYJHIQwtTRo9Vrfjy5PuOz3BpbzQTv6','socio','3814001043','2026-11-19 00:30:09',NULL,NULL,'activo',2,0),(54,'Aldana Quiroga','aldana.quiroga@gmail.com','$2b$10$APo8gh6oI9hhcF04c.n5geSbQOwpUrvljrkD/9xSGG7vHd8MNNUyy','socio','3814001044','2026-11-19 00:30:30',NULL,NULL,'activo',2,0),(55,'Sebastián Coronel','seba.coronel@gmail.com','$2b$10$6oOCExPaaa71uURXcmT2tO8FQ./b77UYQ.7ERbMRHpCAVFE2LYdVu','socio','3814001045','2026-11-19 00:30:52',NULL,NULL,'activo',2,0),(56,'Jimena Leiva','jime.leiva@gmail.com','$2b$10$uLGmZUVlcHkVaruTytZTmuy.QGGAGHVIo2iTaYMikfl2VxqqVNM/q','socio','3814001046','2026-11-19 00:31:14',NULL,NULL,'activo',2,0),(57,'Lautaro Giménez','lautaro.gimenez@gmail.com','$2b$10$DmZ3i57ayZecpLZ.a/IpWuKMm2Q.CcJpE01uvBiZrwoCcAhGM0aj6','socio','3814001047','2026-11-19 00:31:32',NULL,NULL,'activo',2,0),(58,'Noelia Farías','noe.farias@gmail.com','$2b$10$hDnMRKz5BiUXS5AVIqXy..rsDrvjjatA/hFwKmpd7rokQdGSsVmwa','socio','3814001048','2026-11-19 00:31:48',NULL,NULL,'activo',2,0),(59,'Damián Salas','damian.salas@gmail.com','$2b$10$7DxtfRzuA28h5ibj20xu9O8ZTFivOKCiO.6JHZKMIPAOGxZB9HeuG','socio','3814001049','2026-11-19 00:32:05',NULL,NULL,'activo',2,0),(60,'Fernanda Miranda','fer.miranda@gmail.com','$2b$10$o/a.qTFDAVIz5CBKWoLjnu8K/QLeJUW08XHIGw8MPurFDniqMEkuW','socio','3814001050','2026-11-19 00:32:21',NULL,NULL,'activo',2,0),(61,'Alejandro Ruiz','alejandro.ruiz@gmail.com','$2b$10$D8B607Fw8uJQX0NoGRm3VOQfSDC4TlLu4Jwz.BhIrso/4mopsPtKe','empleado','3815002001','2026-11-19 00:35:23',NULL,NULL,'activo',1,0),(62,'Gabriela Flores','gabriela.flores@gmail.com','$2b$10$iRL0MMxP8bHnqRnu3H.grOexp8Bpn1/8XYN3RWqKVmA/XzU9ynuPK','empleado','3815002002','2026-11-19 00:35:49',NULL,NULL,'activo',1,0),(63,'Hernán Delgado','hernan.delgado@gmail.com','$2b$10$JZDWp0Vcv7HO0nXL2fUay.8mME2eqnbnZXWMocKOPcedt6.uuQ7eO','empleado','3815002003','2026-11-19 00:36:10',NULL,NULL,'activo',1,0),(64,'Laura Medina','laura.medina@gmail.com','$2b$10$eQzDHwS5Ey3QnaxZFc2btuawkYuZxF74PIjQWKxV1/o7Jowm8KkaS','empleado','3815002004','2026-11-19 00:36:35',NULL,NULL,'activo',1,0),(65,'Cristian Vera','cristian.vera@gmail.com','$2b$10$nZGLQiPuvleUYpMomgZDZ.Z3njq3KfQCbg0wiZSN7OvA0urLLAHNW','empleado','3815002005','2026-11-19 00:36:59',NULL,NULL,'activo',1,0),(66,'Marcela Sosa','marcela.sosa@gmail.com','$2b$10$LmjsI0NALKzovGjnc.vlk.J3ZeQRqo9G8.LM5dmZmQUITimJIh2RW','empleado','3815002006','2026-11-19 00:37:25',NULL,NULL,'activo',1,0),(67,'Rodrigo Peña','rodrigo.pena@gmail.com','$2b$10$qPI7HKFTQejJ26418r44jukiBBDniLAf7V3OQ1HReQn7iKcnL0Dt6','empleado','3815002007','2026-11-19 00:37:51',NULL,NULL,'activo',1,0),(68,'Vanesa Castro','vanesa.castro@gmail.com','$2b$10$6V.gId.n/p1jFoFfapBaa.dpk8uFMZVxJkbcNQ1a6AJVmMyAZOdjm','empleado','3815002008','2026-11-19 00:38:16',NULL,NULL,'activo',1,0),(69,'Oscar Benítez','oscar.benitez@gmail.com','$2b$10$AM351zH/O/iNL.a6c0KrX.GiH/VnZEEwq10AzdmUxWlnVNOTyVH.O','empleado','3815002009','2026-11-19 00:38:37',NULL,NULL,'activo',2,0),(70,'Silvana Ortiz','silvana.ortiz@gmail.com','$2b$10$jUtz8dyN.g2AsckDgj1.Qe78mE8UK1U7F.NCIJIAUqmrXYqYxi5JC','empleado','3815002010','2026-11-19 00:38:55',NULL,NULL,'activo',2,0),(71,'Patricia Luna','patricia.luna@gmail.com','$2b$10$xtQZBL1RV4cxVyzHvMvdi.4e4O3DF6UfkNnmZ3U0kopyMk.EEEKWq','empleado','3815002011','2026-11-19 00:39:18',NULL,NULL,'activo',2,0),(72,'Diego Fernández','diego.fernandez@gmail.com','$2b$10$FmR.7dfS7QUdT161NycBxOGMenwzBVqjAtC9cOC2KW7V5YrPzBbv.','empleado','3815002012','2026-11-19 00:41:26',NULL,NULL,'activo',2,0),(73,'Natalia Castro','natalia.castro@gmail.com','$2b$10$ovnNetXCuEG.BaWj0F1SZuvcvpUTKecfPYJkHQvG.csDSYH7N/RXa','empleado','3815002013','2026-11-19 00:41:45',NULL,NULL,'activo',2,0),(74,'Martín Herrera','martin.herrera@gmail.com','$2b$10$BKQhkjwmRRAepRgMGBaiwuVe3vEBjE17M4Na/a70f6yI9n.zFftdm','empleado','3815002014','2026-11-19 00:42:05',NULL,NULL,'activo',2,0),(75,'Claudia Ríos','claudia.rios@gmail.com','$2b$10$KK7JZ2LJmFuP4Xpfsmz9h.Dq9/tI/FKAC3CLZ.XHKjsirm6wViI9K','empleado','3815002015','2026-11-19 00:42:22',NULL,NULL,'activo',2,0),(76,'Javier Morales','javier.morales@gmail.com','$2b$10$amKgUmd3xhBysI2fDJVmPud/1rPVgEO34aRmScyjaMVPZ23n2ZiFi','empleado','3815002016','2026-11-19 00:42:42',NULL,NULL,'activo',2,0);
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

-- Dump completed on 2026-11-22 23:34:45
