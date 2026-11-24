-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: vitacare_db
-- ------------------------------------------------------
-- Server version	8.0.45

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,12,1,'2026-11-25 10:00:00','Consulta General','Dolor de cabeza',30,'Presencial','Consultorio 1','PENDIENTE','2026-11-21 16:50:50','2026-11-21 16:50:50'),(2,12,1,'2026-11-23 09:00:00','Consulta general','dolor de panza',30,'Presencial','Consultorio 1','PENDIENTE','2026-11-23 01:24:32','2026-11-23 01:24:32');
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_cita_validar_horario_insert` BEFORE INSERT ON `citas` FOR EACH ROW BEGIN
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_cita_validar_horario_update` BEFORE UPDATE ON `citas` FOR EACH ROW BEGIN
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expedientes`
--

LOCK TABLES `expedientes` WRITE;
/*!40000 ALTER TABLE `expedientes` DISABLE KEYS */;
INSERT INTO `expedientes` VALUES (1,12,'Sin antecedentes registrados.','No conocidas','Sin padecimientos crónicos registrados','Sin medicamentos de uso continuo','Sin antecedentes quirúrgicos registrados','Sin antecedentes familiares relevantes','2026-11-21 23:07:53','2026-11-21 23:07:53'),(2,21,'Sin antecedentes registrados.','No conocidas','Sin padecimientos crónicos registrados','Sin medicamentos de uso continuo','Sin antecedentes quirúrgicos registrados','Sin antecedentes familiares relevantes','2026-11-21 23:12:22','2026-11-21 23:12:22'),(3,13,'Sin antecedentes registrados.','No conocidas','Sin padecimientos crónicos registrados','Sin medicamentos de uso continuo','Sin antecedentes quirúrgicos registrados','Sin antecedentes familiares relevantes','2026-11-23 08:00:24','2026-11-23 08:00:24');
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
INSERT INTO `flyway_schema_history` VALUES (1,'1','esquema inicial','SQL','V1__esquema_inicial.sql',91962027,'vitacare_app','2026-11-21 19:25:55',416,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicos`
--

LOCK TABLES `medicos` WRITE;
/*!40000 ALTER TABLE `medicos` DISABLE KEYS */;
INSERT INTO `medicos` VALUES (1,19,'CEDULA-1',5,NULL,'Consultorio 1',NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(2,20,'CEDULA-2',10,NULL,'Consultorio 2',NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(3,21,'CEDULA-3',15,NULL,'Consultorio 3',NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14');
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_medico_rol_insert` BEFORE INSERT ON `medicos` FOR EACH ROW BEGIN
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_medico_rol_update` BEFORE UPDATE ON `medicos` FOR EACH ROW BEGIN
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,22,2,'EMAIL','paciente1@vitacare.com','VITACARE: tu cita quedó registrada','Hola Paciente de Prueba 1, tu cita de Consulta general con Dr. Prueba 1 quedó registrada para el lunes 23 de noviembre de 2026, 09:00 h. Estado: PENDIENTE.','FALLIDO',NULL,'Correo sin configurar: define spring.mail.host','2026-11-23 01:24:33',NULL),(2,22,2,'SMS','+525598765431',NULL,'Hola Paciente de Prueba 1, tu cita de Consulta general con Dr. Prueba 1 quedó registrada para el lunes 23 de noviembre de 2026, 09:00 h. Estado: PENDIENTE.','FALLIDO',NULL,'Twilio sin configurar: revisa twilio.account-sid, twilio.auth-token y twilio.numero-sms','2026-11-23 01:24:33',NULL),(3,22,2,'WHATSAPP','whatsapp:+525598765431',NULL,'Hola Paciente de Prueba 1, tu cita de Consulta general con Dr. Prueba 1 quedó registrada para el lunes 23 de noviembre de 2026, 09:00 h. Estado: PENDIENTE.','FALLIDO',NULL,'Twilio sin configurar: revisa twilio.account-sid, twilio.auth-token y twilio.numero-whatsapp','2026-11-23 01:24:33',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (12,22,'1991-05-15','Femenino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678901',NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(13,23,'1992-05-15','Masculino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678902',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(14,24,'1993-05-15','Femenino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678903',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(15,25,'1994-05-15','Masculino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678904',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(16,26,'1995-05-15','Femenino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678905',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(17,27,'1996-05-15','Masculino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678906',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(18,28,'1997-05-15','Femenino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678907',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(19,29,'1998-05-15','Masculino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678908',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(20,30,'1999-05-15','Femenino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678909',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(21,31,'2000-05-15','Masculino',NULL,NULL,NULL,'O+',NULL,NULL,NULL,'12345678910',NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(22,32,'2003-11-07','M',NULL,NULL,NULL,'A+',NULL,NULL,'13','24422',NULL,1,'2026-11-23 01:26:13','2026-11-23 01:26:13'),(23,33,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-11-23 13:38:04','2026-11-23 13:38:04'),(24,34,'1995-08-20','Femenino','Soltero','Estudiante','Oaxaca, México','O+','Contacto de prueba','5512345679','Privado','98765432101',NULL,0,'2026-11-23 19:50:51','2026-11-23 21:15:47');
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_paciente_rol_insert` BEFORE INSERT ON `pacientes` FOR EACH ROW BEGIN
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_paciente_rol_update` BEFORE UPDATE ON `pacientes` FOR EACH ROW BEGIN
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
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_tokrec_usuario` (`usuario_id`,`usado`),
  CONSTRAINT `fk_tokrec_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_recuperacion`
--

LOCK TABLES `tokens_recuperacion` WRITE;
/*!40000 ALTER TABLE `tokens_recuperacion` DISABLE KEYS */;
INSERT INTO `tokens_recuperacion` VALUES (1,18,'bc80c8f1d0408c67cad285841e2ae8066d01e2d10760b30e570c1f359251ff2c','2026-11-23 14:00:17',0,'2026-11-23 13:30:18'),(2,33,'9619a44719548663af42c2e0f16115c7e968cbe24f2ea00a52f9ed668223d848','2026-11-23 14:09:42',1,'2026-11-23 13:39:42'),(3,33,'99bb3206a8e047b10f5ecf80a2375117a6089777a670e109a1297c8457ba3a25','2026-11-23 17:06:41',1,'2026-11-23 16:36:41'),(4,33,'5c5abb343c2909441cfafeebe504bb7323f34bea54f00ffa8aa6402d501b2b70','2026-11-23 17:32:37',1,'2026-11-23 17:02:37'),(5,33,'9e468e2a55d08e8830e2363ed2a939c79d541d11638a66f79e7cf5641d80cf1f','2026-11-23 17:48:36',1,'2026-11-23 17:18:36'),(6,33,'5f23c3f45f6e2c69e3dddb9481834767e01e6fc21ef4b06ed546f6723ba7f2ad','2026-11-23 19:42:02',0,'2026-11-23 19:12:02');
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
INSERT INTO `tokens_revocados` VALUES ('0beab2e6-e89f-4630-8f49-05a4026ed8ba','2026-11-23 14:59:22','2026-11-23 14:03:34'),('21fb7d06-43f0-4066-a03f-08a48532d27b','2026-11-23 09:02:04','2026-11-23 08:02:22'),('364bef72-485b-4939-9689-fb1c5b494e8c','2026-11-23 09:16:42','2026-11-23 08:16:53'),('3fe04104-fafb-4233-b642-f739e4563cc6','2026-11-23 08:42:08','2026-11-23 07:43:30'),('4d5d28c2-a0bd-4013-b489-ea149f2bd3c0','2026-11-23 09:00:12','2026-11-23 08:01:02'),('5750dcc2-6a78-465e-9fd4-3359e2301f7c','2026-11-23 08:40:53','2026-11-23 07:41:18'),('68c61b0f-7c66-478e-beea-64528dec2233','2026-11-24 01:18:21','2026-11-24 00:22:18'),('8c076fc1-41a3-4a2d-ba57-dcfd4059a3a4','2026-11-23 12:42:37','2026-11-23 11:45:10'),('96f8e383-b4e1-48e8-9e8f-ea3e065fbb31','2026-11-23 22:05:15','2026-11-23 21:06:35'),('cfba0846-0f88-46d1-9f3d-602864c45a7e','2026-11-24 00:42:17','2026-11-24 00:16:58'),('e6eab49f-0e13-451b-8e2d-cbe14281bf60','2026-11-23 12:51:56','2026-11-23 11:52:31'),('fa8eb01c-058a-4345-b20f-9eabac870b4a','2026-11-23 08:52:03','2026-11-23 07:53:51'),('fc71528f-bee0-4790-877d-e4af6cc62f96','2026-11-23 08:36:46','2026-11-23 07:40:06');
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
  `foto_url` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol_id` bigint NOT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario_rol` (`rol_id`,`activo`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (18,'Administrador VITACARE','admin@vitacare.com','$2a$10$rl6D/MXfupLdhVvpHTxEnOxmR6Rk5r9tnBa4qxMn4/pq3ZJnYd.GW','5512345678','administrador de medico','',1,NULL,1,'2026-11-21 16:37:14','2026-11-22 12:33:46'),(19,'Dr. Prueba 1','doctor1@vitacare.com','$2a$10$yjtKrE9hg0TyVDuU2vIX4O17ZOZ6zd6fbsu7I4goddkxO23GmAZBC','5512345671',NULL,NULL,2,NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(20,'Dr. Prueba 2','doctor2@vitacare.com','$2a$10$uh9ZVEMm/bdv.Y78XPDal.QmPWbAWl/F9gV9tk6xNhBeExlI8M30S','5512345672',NULL,NULL,2,NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(21,'Dr. Prueba 3','doctor3@vitacare.com','$2a$10$fapJUVJt7ktpgtDWbqPYTeH2kXsY/zHs2JmI4lA.aM7JsemzkIX.6','5512345673',NULL,NULL,2,NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(22,'Paciente de Prueba 1','paciente1@vitacare.com','$2a$10$zAcZJmtcyoEYl.8w2GZX0.p5SJP/BNK/zptG1O/GbDFFLm3arc5j6','5598765431',NULL,NULL,3,NULL,1,'2026-11-21 16:37:14','2026-11-21 16:37:14'),(23,'Paciente de Prueba 2','paciente2@vitacare.com','$2a$10$H0lqodeh0SiFFXzPaNR90OwQSrqsI7fe9i3dHOnlyNgEf364uaGZK','5598765432',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(24,'Paciente de Prueba 3','paciente3@vitacare.com','$2a$10$EOMDI5cBzeH6rc4WrXZEFuYmcZCOXrH/B8eUXOaoJ7N9F1Y8R4V3C','5598765433',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(25,'Paciente de Prueba 4','paciente4@vitacare.com','$2a$10$RkmqVhO3qun/cgiZFzFoZ.FjTMQjZJ9yJa2HHCyC5qzW/Rdo9gBsW','5598765434',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(26,'Paciente de Prueba 5','paciente5@vitacare.com','$2a$10$B/7P8nrJV9h4lyQH2ov72eI29nugcBPufOEUEWY91DVAgpjSVqUPm','5598765435',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(27,'Paciente de Prueba 6','paciente6@vitacare.com','$2a$10$Ez/UX988DA6HwBWTHpJg8u96Y7IPRzWYXkM1pFumn6r8CpSHWX2wC','5598765436',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(28,'Paciente de Prueba 7','paciente7@vitacare.com','$2a$10$oN8l.vectl2HVQuPH3N/7unGU14e2LMbKKprgoT6P/HMz4iUxo5UW','5598765437',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(29,'Paciente de Prueba 8','paciente8@vitacare.com','$2a$10$yyo4Ea0fYHRR9YzyCjUxzexqr3dvtwx9AIwpYQPcEa5I0f0RIrC/W','5598765438',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(30,'Paciente de Prueba 9','paciente9@vitacare.com','$2a$10$zhWcR5gRs791VP0Szlkw1uau5A5kCGsYF29LYz4ewpET.G9nWeKRK','5598765439',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(31,'Paciente de Prueba 10','paciente10@vitacare.com','$2a$10$XKUQyNAS/h7Okl1HoBVYKOIghSQKd6gw.jge6MVs0Pe12v/elIuuK','55987654310',NULL,NULL,3,NULL,1,'2026-11-21 16:37:15','2026-11-21 16:37:15'),(32,'zeferino velasco','zvelasco799@gmail.com','$2a$10$a4Ij.yUbAP4lx8IlfqZs1.BmG7fNRzQUwMKgvPjejTiIeGeM/60oi','9515301149',NULL,NULL,3,NULL,1,'2026-11-23 01:26:13','2026-11-23 01:26:13'),(33,'Usuario Prueba','velascoangela984@gmail.com','$2a$10$56rBPmWipfLYUtveCXaqq.vv16kofGhcIcd7/.4RoUHBcW93BYQ0C','9515301149',NULL,NULL,3,NULL,1,'2026-11-23 13:38:04','2026-11-23 17:36:37'),(34,'zeferino Actualizado','paciente.bruno.prueba@vitacare.com','$2a$10$P00CVHVBBkqFfP4DS6p/3eoSj6X7lfdwLtFATI6i.JcYBgfV5mbde','5512345680',NULL,NULL,3,NULL,1,'2026-11-23 19:50:51','2026-11-23 20:00:07');
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
/*!50003 CREATE*/ /*!50017 DEFINER=`vitacare_app`@`localhost`*/ /*!50003 TRIGGER `trg_usuario_validar_rol` BEFORE UPDATE ON `usuarios` FOR EACH ROW BEGIN
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-24  1:16:33
