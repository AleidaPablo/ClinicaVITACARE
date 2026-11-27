-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: vitacare_db
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '68b52e91-b3c1-11f0-ab51-012dded48934:1-665';

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paciente_id` bigint NOT NULL,
  `medico_id` bigint NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `tipo_consulta` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` int NOT NULL DEFAULT '30',
  `modalidad` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_citas_medico_fecha` (`medico_id`,`fecha_hora`),
  KEY `idx_citas_paciente_fecha` (`paciente_id`,`fecha_hora`),
  KEY `idx_citas_estado` (`estado`),
  CONSTRAINT `fk_cita_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_cita_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_cita_duracion` CHECK ((`duracion` > 0)),
  CONSTRAINT `chk_cita_estado` CHECK ((`estado` in (_utf8mb4'PENDIENTE',_utf8mb4'CONFIRMADA',_utf8mb4'COMPLETADA',_utf8mb4'CANCELADA'))),
  CONSTRAINT `chk_cita_modalidad` CHECK (((`modalidad` is null) or (`modalidad` in (_utf8mb4'Presencial',_utf8mb4'Teleconsulta'))))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,1,1,'2026-11-11 09:00:00','Consulta general','Revisión general anual',30,'Presencial','Consultorio 1','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(2,2,2,'2026-11-12 10:00:00','Seguimiento','Dolor de cabeza persistente',30,'Presencial','Consultorio 2','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(3,3,3,'2026-11-13 11:00:00','Consulta general','Control de presión arterial',30,'Presencial','Consultorio 3','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(4,4,4,'2026-11-14 12:00:00','Seguimiento','Chequeo dermatológico',30,'Presencial','Consultorio 4','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(5,5,5,'2026-11-15 13:00:00','Consulta general','Consulta de seguimiento',30,'Presencial','Consultorio 5','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(6,6,6,'2026-11-16 14:00:00','Seguimiento','Molestia muscular en hombro',30,'Presencial','Consultorio 6','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(7,7,7,'2026-11-17 15:00:00','Consulta general','Valoración preventiva',30,'Presencial','Consultorio 7','COMPLETADA','2026-11-26 23:52:46','2026-11-26 23:52:46'),(8,8,8,'2026-11-18 09:00:00','Seguimiento','Revisión de estudios de laboratorio',30,'Presencial','Consultorio 8','COMPLETADA','2026-11-26 23:52:47','2026-11-26 23:52:47'),(9,9,9,'2026-11-19 10:00:00','Consulta general','Alergia estacional',30,'Presencial','Consultorio 9','COMPLETADA','2026-11-26 23:52:47','2026-11-26 23:52:47'),(10,10,10,'2026-11-20 11:00:00','Seguimiento','Control metabólico',30,'Presencial','Consultorio 10','COMPLETADA','2026-11-26 23:52:47','2026-11-26 23:52:47'),(11,11,1,'2026-11-28 12:00:00','Consulta general','Dolor lumbar leve',30,'Presencial','Consultorio 1','CONFIRMADA','2026-11-26 23:52:47','2026-11-26 23:52:47'),(12,12,2,'2026-11-29 13:00:00','Seguimiento','Chequeo general',30,'Presencial','Consultorio 2','PENDIENTE','2026-11-26 23:52:47','2026-11-26 23:52:47');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cita_validar_horario_insert` BEFORE INSERT ON `citas` FOR EACH ROW BEGIN
    IF NEW.estado <> 'CANCELADA' THEN
        IF EXISTS (
            SELECT 1
            FROM citas c
            WHERE c.estado <> 'CANCELADA'
              AND (c.medico_id = NEW.medico_id OR c.paciente_id = NEW.paciente_id)
              AND c.fecha_hora < DATE_ADD(NEW.fecha_hora, INTERVAL NEW.duracion MINUTE)
              AND DATE_ADD(c.fecha_hora, INTERVAL c.duracion MINUTE) > NEW.fecha_hora
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El medico o paciente ya tiene una cita en ese horario';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cita_validar_horario_update` BEFORE UPDATE ON `citas` FOR EACH ROW BEGIN
    IF NEW.estado <> 'CANCELADA' THEN
        IF EXISTS (
            SELECT 1
            FROM citas c
            WHERE c.id <> NEW.id
              AND c.estado <> 'CANCELADA'
              AND (c.medico_id = NEW.medico_id OR c.paciente_id = NEW.paciente_id)
              AND c.fecha_hora < DATE_ADD(NEW.fecha_hora, INTERVAL NEW.duracion MINUTE)
              AND DATE_ADD(c.fecha_hora, INTERVAL c.duracion MINUTE) > NEW.fecha_hora
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El medico o paciente ya tiene una cita en ese horario';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `consulta_estudios`
--

DROP TABLE IF EXISTS `consulta_estudios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consulta_estudios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `consulta_id` bigint NOT NULL,
  `estudio_id` bigint NOT NULL,
  `fecha_solicitud` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SOLICITADO',
  `resultado` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_ce_consulta` (`consulta_id`),
  KEY `idx_ce_estudio` (`estudio_id`),
  KEY `idx_ce_estado` (`estado`),
  CONSTRAINT `fk_ce_consulta` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ce_estudio` FOREIGN KEY (`estudio_id`) REFERENCES `estudios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_ce_estado` CHECK ((`estado` in (_utf8mb4'SOLICITADO',_utf8mb4'EN_PROCESO',_utf8mb4'COMPLETADO',_utf8mb4'CANCELADO')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consulta_estudios`
--

LOCK TABLES `consulta_estudios` WRITE;
/*!40000 ALTER TABLE `consulta_estudios` DISABLE KEYS */;
/*!40000 ALTER TABLE `consulta_estudios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expediente_id` bigint NOT NULL,
  `medico_id` bigint NOT NULL,
  `cita_id` bigint DEFAULT NULL,
  `fecha_consulta` date NOT NULL,
  `motivo_consulta` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnostico` text COLLATE utf8mb4_unicode_ci,
  `tratamiento` text COLLATE utf8mb4_unicode_ci,
  `proxima_revision` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `presion_arterial` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pulso` int DEFAULT NULL,
  `temperatura` decimal(4,2) DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `estatura` decimal(5,2) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cita_id` (`cita_id`),
  KEY `idx_consultas_expediente_fecha` (`expediente_id`,`fecha_consulta`),
  KEY `idx_consultas_medico_fecha` (`medico_id`,`fecha_consulta`),
  CONSTRAINT `fk_consulta_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_consulta_expediente` FOREIGN KEY (`expediente_id`) REFERENCES `expedientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_consulta_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_consulta_estatura` CHECK (((`estatura` is null) or (`estatura` > 0))),
  CONSTRAINT `chk_consulta_peso` CHECK (((`peso` is null) or (`peso` > 0))),
  CONSTRAINT `chk_consulta_pulso` CHECK (((`pulso` is null) or (`pulso` > 0))),
  CONSTRAINT `chk_consulta_temperatura` CHECK (((`temperatura` is null) or (`temperatura` > 0)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
INSERT INTO `consultas` VALUES (1,1,1,1,'2026-11-11','Revisión general anual','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-11','Signos vitales dentro de parámetros normales.','120/80',72,36.60,68.50,1.68,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(2,2,2,2,'2026-11-12','Dolor de cabeza persistente','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-12','Signos vitales dentro de parámetros normales.','120/80',73,36.60,68.50,1.68,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(3,3,3,3,'2026-11-13','Control de presión arterial','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-13','Signos vitales dentro de parámetros normales.','120/80',74,36.60,68.50,1.68,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(4,4,4,4,'2026-11-14','Chequeo dermatológico','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-14','Signos vitales dentro de parámetros normales.','120/80',75,36.60,68.50,1.68,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(5,5,5,5,'2026-11-15','Consulta de seguimiento','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-15','Signos vitales dentro de parámetros normales.','120/80',76,36.60,68.50,1.68,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(6,6,6,6,'2026-11-16','Molestia muscular en hombro','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-16','Signos vitales dentro de parámetros normales.','120/80',77,36.60,68.50,1.68,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(7,7,7,7,'2026-11-17','Valoración preventiva','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-17','Signos vitales dentro de parámetros normales.','120/80',78,36.60,68.50,1.68,'2026-11-26 23:52:47','2026-11-26 23:52:47'),(8,8,8,8,'2026-11-18','Revisión de estudios de laboratorio','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-18','Signos vitales dentro de parámetros normales.','120/80',79,36.60,68.50,1.68,'2026-11-26 23:52:47','2026-11-26 23:52:47'),(9,9,9,9,'2026-11-19','Alergia estacional','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-19','Signos vitales dentro de parámetros normales.','120/80',80,36.60,68.50,1.68,'2026-11-26 23:52:47','2026-11-26 23:52:47'),(10,10,10,10,'2026-11-20','Control metabólico','Paciente estable, evolución favorable.','Hidratación adecuada, reposo relativo y seguimiento en 30 días.','2026-12-20','Signos vitales dentro de parámetros normales.','120/80',81,36.60,68.50,1.68,'2026-11-26 23:52:47','2026-11-26 23:52:47');
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_receta`
--

DROP TABLE IF EXISTS `detalle_receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_receta` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receta_id` bigint NOT NULL,
  `medicamento_id` bigint NOT NULL,
  `dosis` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion_dias` int DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `instrucciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_detalle_receta` (`receta_id`),
  KEY `idx_detalle_medicamento` (`medicamento_id`),
  CONSTRAINT `fk_detalle_medicamento` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamentos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_detalle_receta` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_receta_cantidad` CHECK (((`cantidad` is null) or (`cantidad` > 0))),
  CONSTRAINT `chk_receta_duracion` CHECK (((`duracion_dias` is null) or (`duracion_dias` > 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_receta`
--

LOCK TABLES `detalle_receta` WRITE;
/*!40000 ALTER TABLE `detalle_receta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudios`
--

DROP TABLE IF EXISTS `estudios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudios`
--

LOCK TABLES `estudios` WRITE;
/*!40000 ALTER TABLE `estudios` DISABLE KEYS */;
/*!40000 ALTER TABLE `estudios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expedientes`
--

DROP TABLE IF EXISTS `expedientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expedientes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paciente_id` bigint NOT NULL,
  `antecedentes_personales` text COLLATE utf8mb4_unicode_ci,
  `alergias` text COLLATE utf8mb4_unicode_ci,
  `padecimientos_cronicos` text COLLATE utf8mb4_unicode_ci,
  `medicamentos_uso_continuo` text COLLATE utf8mb4_unicode_ci,
  `cirugias_previas` text COLLATE utf8mb4_unicode_ci,
  `antecedentes_familiares` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `fk_expediente_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expedientes`
--

LOCK TABLES `expedientes` WRITE;
/*!40000 ALTER TABLE `expedientes` DISABLE KEYS */;
INSERT INTO `expedientes` VALUES (1,1,'Sin hospitalizaciones recientes.','Ninguna conocida','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:45','2026-11-26 23:52:45'),(2,2,'Sin hospitalizaciones recientes.','Ninguna conocida','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:45','2026-11-26 23:52:45'),(3,3,'Sin hospitalizaciones recientes.','Penicilina','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:45','2026-11-26 23:52:45'),(4,4,'Sin hospitalizaciones recientes.','Ninguna conocida','Hipertensión leve controlada','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:45','2026-11-26 23:52:45'),(5,5,'Sin hospitalizaciones recientes.','Ninguna conocida','Ninguno','Ninguno','Apendicectomía','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(6,6,'Sin hospitalizaciones recientes.','Penicilina','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(7,7,'Sin hospitalizaciones recientes.','Ninguna conocida','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(8,8,'Sin hospitalizaciones recientes.','Ninguna conocida','Hipertensión leve controlada','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(9,9,'Sin hospitalizaciones recientes.','Penicilina','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(10,10,'Sin hospitalizaciones recientes.','Ninguna conocida','Ninguno','Ninguno','Apendicectomía','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(11,11,'Sin hospitalizaciones recientes.','Ninguna conocida','Ninguno','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46'),(12,12,'Sin hospitalizaciones recientes.','Penicilina','Hipertensión leve controlada','Ninguno','Ninguna','Diabetes tipo 2 en rama materna','2026-11-26 23:52:46','2026-11-26 23:52:46');
/*!40000 ALTER TABLE `expedientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','esquema inicial','SQL','V1__esquema_inicial.sql',1332870104,'root','2026-11-27 05:52:37',964,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamentos`
--

DROP TABLE IF EXISTS `medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamentos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `presentacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `concentracion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_medicamento` (`nombre`,`presentacion`,`concentracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamentos`
--

LOCK TABLES `medicamentos` WRITE;
/*!40000 ALTER TABLE `medicamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicos`
--

DROP TABLE IF EXISTS `medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `cedula_profesional` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anos_experiencia` int DEFAULT NULL,
  `idiomas` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultorio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disponibilidad` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `cedula_profesional` (`cedula_profesional`),
  CONSTRAINT `fk_medico_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_medico_experiencia` CHECK (((`anos_experiencia` is null) or (`anos_experiencia` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicos`
--

LOCK TABLES `medicos` WRITE;
/*!40000 ALTER TABLE `medicos` DISABLE KEYS */;
INSERT INTO `medicos` VALUES (1,2,'10456321',12,'Español, Inglés','Consultorio 1','Lunes a viernes, 9:00 a 15:00',1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(2,3,'9823417',18,'Español, Inglés','Consultorio 2','Lunes a jueves, 10:00 a 16:00',1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(3,4,'11234908',9,'Español','Consultorio 3','Martes a sábado, 9:00 a 14:00',1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(4,5,'8745216',21,'Español, Francés','Consultorio 4','Lunes, miércoles y viernes, 11:00 a 18:00',1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(5,6,'10987345',14,'Español, Inglés','Consultorio 5','Lunes a viernes, 12:00 a 18:00',1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(6,7,'10567890',16,'Español, Inglés','Consultorio 6','Lunes a viernes, 8:00 a 14:00',1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(7,8,'11456789',11,'Español','Consultorio 7','Martes a viernes, 10:00 a 17:00',1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(8,9,'9654321',19,'Español, Inglés','Consultorio 8','Lunes, miércoles y viernes, 9:00 a 16:00',1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(9,10,'11876543',8,'Español','Consultorio 9','Lunes a jueves, 11:00 a 17:00',1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(10,11,'10234567',15,'Español, Inglés','Consultorio 10','Martes a sábado, 9:00 a 15:00',1,'2026-11-26 23:52:45','2026-11-26 23:52:45');
/*!40000 ALTER TABLE `medicos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_medico_rol_insert` BEFORE INSERT ON `medicos` FOR EACH ROW BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM usuarios u
        JOIN roles r ON r.id = u.rol_id
        WHERE u.id = NEW.usuario_id
          AND r.nombre = 'DOCTOR'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario debe tener el rol DOCTOR';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_medico_rol_update` BEFORE UPDATE ON `medicos` FOR EACH ROW BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM usuarios u
        JOIN roles r ON r.id = u.rol_id
        WHERE u.id = NEW.usuario_id
          AND r.nombre = 'DOCTOR'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario debe tener el rol DOCTOR';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `medicos_especialidades`
--

DROP TABLE IF EXISTS `medicos_especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicos_especialidades` (
  `medico_id` bigint NOT NULL,
  `especialidad_id` bigint NOT NULL,
  PRIMARY KEY (`medico_id`,`especialidad_id`),
  KEY `idx_me_especialidad` (`especialidad_id`),
  CONSTRAINT `fk_me_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_me_medico` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicos_especialidades`
--

LOCK TABLES `medicos_especialidades` WRITE;
/*!40000 ALTER TABLE `medicos_especialidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicos_especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `cita_id` bigint DEFAULT NULL,
  `canal` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destino` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asunto` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `proveedor_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `enviado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_usuario` (`usuario_id`,`creado_en`),
  KEY `idx_notif_cita` (`cita_id`),
  KEY `idx_notif_estado` (`estado`),
  CONSTRAINT `fk_notif_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_notif_canal` CHECK ((`canal` in (_utf8mb4'EMAIL',_utf8mb4'SMS',_utf8mb4'WHATSAPP'))),
  CONSTRAINT `chk_notif_estado` CHECK ((`estado` in (_utf8mb4'PENDIENTE',_utf8mb4'ENVIADO',_utf8mb4'FALLIDO')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_civil` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocupacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_sangre` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_emergencia_nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_emergencia_telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_seguro` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nss` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultima_visita` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `nss` (`nss`),
  CONSTRAINT `fk_paciente_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,12,'1994-03-12','Femenino','Soltera','Diseñadora gráfica','Col. Reforma, Oaxaca de Juárez, Oax.','O+','Rosa Morales (madre)','9512348192','IMSS','75129400001',NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(2,13,'1988-07-25','Masculino','Casado','Ingeniero civil','Col. Volcanes, Oaxaca de Juárez, Oax.','A+','Patricia Ruiz (esposa)','9513894720','Privado','75129400002',NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(3,14,'2001-11-02','Femenino','Soltera','Estudiante','Col. Del Maestro, Oaxaca de Juárez, Oax.','B+','Guadalupe Herrera (madre)','9511765409','IMSS','75129400003',NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(4,15,'1975-01-30','Masculino','Casado','Comerciante','Col. Centro, Oaxaca de Juárez, Oax.','O-','Elena Castillo (esposa)','9512904815','Ninguno','75129400004',NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(5,16,'1990-09-18','Femenino','Casada','Docente','Col. Estrella, Oaxaca de Juárez, Oax.','A-','Héctor Vargas (esposo)','9514129038','ISSSTE','75129400005',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(6,17,'1983-05-09','Masculino','Divorciado','Contador','Col. Jalatlaco, Oaxaca de Juárez, Oax.','AB+','Teresa Fuentes (madre)','9515382910','Privado','75129400006',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(7,18,'1997-12-21','Femenino','Soltera','Enfermera','Col. Santa Rosa, Santa Lucía del Camino, Oax.','O+','Itzel Santiago (madre)','9516472019','IMSS','75129400007',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(8,19,'2004-04-14','Masculino','Soltero','Estudiante','Col. Cinco Señores, Oaxaca de Juárez, Oax.','B-','Martha Bautista (madre)','9511509384','ISSSTE','75129400008',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(9,20,'1986-08-03','Femenino','Casada','Administradora','Fracc. Los Ángeles, Santa Cruz Xoxocotlán, Oax.','A+','Ramón Díaz (esposo)','9512684713','Privado','75129400009',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(10,21,'1969-10-27','Masculino','Casado','Jubilado','Col. Reforma, Oaxaca de Juárez, Oax.','O+','Carmen Pérez (esposa)','9513920471','IMSS','75129400010',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(11,22,'1999-02-16','Femenino','Soltera','Abogada','Col. Ex Marquesado, Oaxaca de Juárez, Oax.','AB-','Luis Cortés (padre)','9514873120','Privado','75129400011',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(12,23,'1992-06-05','Masculino','Soltero','Chef','Col. Xochimilco, Oaxaca de Juárez, Oax.','A+','Julia Vásquez (madre)','9515910284','Ninguno','75129400012',NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_paciente_rol_insert` BEFORE INSERT ON `pacientes` FOR EACH ROW BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM usuarios u
        JOIN roles r ON r.id = u.rol_id
        WHERE u.id = NEW.usuario_id
          AND r.nombre = 'PATIENT'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario debe tener el rol PATIENT';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_paciente_rol_update` BEFORE UPDATE ON `pacientes` FOR EACH ROW BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM usuarios u
        JOIN roles r ON r.id = u.rol_id
        WHERE u.id = NEW.usuario_id
          AND r.nombre = 'PATIENT'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario debe tener el rol PATIENT';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `recetas`
--

DROP TABLE IF EXISTS `recetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recetas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `consulta_id` bigint NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `indicaciones_generales` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_receta_consulta` (`consulta_id`),
  CONSTRAINT `fk_receta_consulta` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recetas`
--

LOCK TABLES `recetas` WRITE;
/*!40000 ALTER TABLE `recetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `recetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Administrador: acceso total al sistema'),(2,'DOCTOR','Médico: gestiona sus citas, pacientes y expedientes'),(3,'PATIENT','Paciente: consulta únicamente sus propios datos');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_recuperacion`
--

DROP TABLE IF EXISTS `tokens_recuperacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_recuperacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_tokrec_usuario` (`usuario_id`,`usado`),
  CONSTRAINT `fk_tokrec_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_recuperacion`
--

LOCK TABLES `tokens_recuperacion` WRITE;
/*!40000 ALTER TABLE `tokens_recuperacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_recuperacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_revocados`
--

DROP TABLE IF EXISTS `tokens_revocados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_revocados` (
  `jti` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_en` datetime NOT NULL,
  `revocado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`jti`),
  KEY `idx_tokrev_expira` (`expira_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_revocados`
--

LOCK TABLES `tokens_revocados` WRITE;
/*!40000 ALTER TABLE `tokens_revocados` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_revocados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_url` longtext COLLATE utf8mb4_unicode_ci,
  `rol_id` bigint NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario_rol` (`rol_id`,`activo`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Laura Beatriz Ortega Salinas','admin@vitacare.com','$2a$10$/witTm.wREdSE81SXDKSTewsqLzI7gh83/9HH0SKd.Y.sjg8.OZlq','9511047283','Dirección administrativa','data:image/jpeg;base64,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',1,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:53:22'),(2,'Dra. Mariana Hernández Cruz','dra.mariana.hernandez@vitacare.com','$2a$10$NxQ0JBvqzmh.oxAJyQ7tPOfaiBECo7egcCWSXNQDYxtiOuTPhshke','9511428390','Medicina General',NULL,2,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(3,'Dr. Alejandro Ramírez Torres','dr.alejandro.ramirez@vitacare.com','$2a$10$BLWsw0F9CrcU5UyW9DS3QuLkMqIIxV7HD5hjVJLCMS4aI9D3aJsoy','9512084715','Cardiología',NULL,2,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(4,'Dra. Sofía Martínez Aguilar','dra.sofia.martinez@vitacare.com','$2a$10$0G/Cs89w8OZwFdfFHTXTg.mT/juiIH5HlIKuR5kChJQsA5phjLEqy','9513196402','Pediatría',NULL,2,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(5,'Dr. Roberto Sánchez Vega','dr.roberto.sanchez@vitacare.com','$2a$10$mtCBHyVeqfZhhe/HAdrb2O8.WJMfU1QNqQoWhcEunojk.kOMN6Nui','9514279183','Dermatología',NULL,2,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(6,'Dra. Valeria Gómez Luna','dra.valeria.gomez@vitacare.com','$2a$10$hYelT7Bvy9U.sYDFbaZseOpWIXbGy1oSWSBBVmVVMzO4H0XbcJ1/m','9515830247','Ginecología',NULL,2,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(7,'Dr. Fernando Castro Mendoza','dr.fernando.castro@vitacare.com','$2a$10$82ajvll0b9aTwut6KLMEWOXcycxQTh5z6eQyNB3waucb7RkxIvrXO','9516401928','Neurología',NULL,2,NULL,1,'2026-11-26 23:52:44','2026-11-26 23:52:44'),(8,'Dra. Gabriela Domínguez Ríos','dra.gabriela.dominguez@vitacare.com','$2a$10$0EuahwWsZfIngmI9/bW5dOOIZsInYwJaA64n4.ogXIHBkJmH1dQs2','9511957364','Oftalmología',NULL,2,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(9,'Dr. Eduardo Morales Chávez','dr.eduardo.morales@vitacare.com','$2a$10$WYpSttXWECt5aB6iUmlJJO1plQevwIOxckCWoybtqTTEL5hz/P/TW','9512748509','Traumatología',NULL,2,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(10,'Dra. Patricia Navarro Silva','dra.patricia.navarro@vitacare.com','$2a$10$QidoA/Q8Lok.V.OsHe1JX.vUKKJaSfTDlLNP9oA74KU5XeG5gik3K','9513684021','Endocrinología',NULL,2,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(11,'Dr. Arturo Vázquez Peña','dr.arturo.vazquez@vitacare.com','$2a$10$CD4CzLbSgX3/NNqFgFR/7.CMSF2U/HEsEIpdbPUfiLHy/sP7UxDqG','9514927156','Neumología',NULL,2,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(12,'Ana Lucía Pérez Morales','analucia.perez94@gmail.com','$2a$10$gHui9FFxMkBXXMkeZGA1/.XdRNi2hs4T0oE5jxsXYnMlemGNRomB6','9511284930',NULL,NULL,3,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(13,'Carlos Eduardo Jiménez Ruiz','carlos.jimenez.ruiz@gmail.com','$2a$10$X1exKXzd6y21DJDpUWdviuewz4xa6jpZApFJnVRy9jocS.kdG4wzq','9512476018',NULL,NULL,3,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(14,'Fernanda Guadalupe López Herrera','fer.lopezherrera@gmail.com','$2a$10$OrBurxaXo7i1SNhSI59iwe9I769lD5qqgj4iGMYZTnHxWuiCvQZi.','9513509284',NULL,NULL,3,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(15,'Jorge Luis Mendoza Castillo','jorgeluis.mendoza75@gmail.com','$2a$10$vvMjZfbuYVuuSrJZHHdf6uVYHL/nz68QqmLbMYyQXlOB806gt77Ni','9514813627',NULL,NULL,3,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(16,'Daniela Alejandra Vargas Núñez','dani.vargas.nunez@gmail.com','$2a$10$SE/VhI4g66XaLzIQ0hYYOeqB.IceJLNyAVAxuhKL0KOFDCkqY8fzG','9515628491',NULL,NULL,3,NULL,1,'2026-11-26 23:52:45','2026-11-26 23:52:45'),(17,'Miguel Ángel Rojas Fuentes','miguelangel.rojas83@gmail.com','$2a$10$bDhBXy9uPEXsYyAMnw9xGusW9XNlExV6NaUPMaSkzF1MfXvKCBcti','9516194735',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(18,'Paola Itzel Cruz Santiago','paola.cruz.santiago@gmail.com','$2a$10$Kt.09t49hqXVkkMrEffQZeosOo3fdsKhdHiEtw8VeSsmMUc9HH35q','9511837492',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(19,'Luis Fernando Ortiz Bautista','luisfer.ortiz04@gmail.com','$2a$10$p9wDv2mXAxac7jsuU5ocZ.zMX6RVkrXRB6a2Q79RlV9Qj/veVYmWa','9512948160',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(20,'Karla Yesenia Morales Díaz','karla.morales.diaz@gmail.com','$2a$10$dD.0kZ4zNThtKa6SHjEEf.0UZMopjewiD6fpoc26KqEkIRgnHrdd.','9513762049',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(21,'Ricardo Alonso Gutiérrez Pérez','ricardo.gutierrez69@gmail.com','$2a$10$DDw3G/OncgnayYaT3SujuemGbBSw1CJuBuBnURSUN95c/KogQnmRa','9514590382',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(22,'Esmeralda Cortés Ramos','esme.cortes.ramos@gmail.com','$2a$10$2ixwt4OqXKEiC4HtOtGS6OLAoitED8ok8qOA7EmWjuw9mHTsQouZS','9515149276',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46'),(23,'Héctor Manuel Aguilar Vásquez','hector.aguilar.vasquez@gmail.com','$2a$10$XPxPwxoLJWlFFIHkSpkWy.1r/pg5.Qti2GXEsHonU5.jqP3nKQf0W','9516823941',NULL,NULL,3,NULL,1,'2026-11-26 23:52:46','2026-11-26 23:52:46');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_usuario_validar_rol` BEFORE UPDATE ON `usuarios` FOR EACH ROW BEGIN
    IF NEW.rol_id <> OLD.rol_id THEN
        IF EXISTS (SELECT 1 FROM medicos WHERE usuario_id = OLD.id)
           OR EXISTS (SELECT 1 FROM pacientes WHERE usuario_id = OLD.id) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede cambiar el rol de un usuario con perfil asociado';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-26 23:55:01
