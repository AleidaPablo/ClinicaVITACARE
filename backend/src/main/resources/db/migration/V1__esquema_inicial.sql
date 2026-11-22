-- =====================================================================
-- VITACARE - Migración Flyway V1: esquema inicial
-- Ubicación: backend/src/main/resources/db/migration/V1__esquema_inicial.sql
-- Motor: MySQL 8.0.16 o superior (no MariaDB)
-- La base de datos se crea aparte (ver 00_crear_base.sql).
-- Una vez aplicada en un servidor, NO editar este archivo: crear V2, V3...
-- =====================================================================


-- ---------------------------------------------------------------------
-- ROLES
-- ADMIN = Administrador, DOCTOR = Médico, PATIENT = Paciente
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
) ENGINE=InnoDB;

INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMIN',   'Administrador: acceso total al sistema'),
    ('DOCTOR',  'Médico: gestiona sus citas, pacientes y expedientes'),
    ('PATIENT', 'Paciente: consulta únicamente sus propios datos');


-- ---------------------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,          -- hash BCrypt, nunca texto plano
    telefono VARCHAR(20),                      -- formato internacional para Twilio, ej. +529511234567
    departamento VARCHAR(100),
    foto_url VARCHAR(300),                     -- avatar; NULL = avatar por defecto

    rol_id BIGINT NOT NULL,

    ultimo_acceso DATETIME,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT,

    INDEX idx_usuario_rol (rol_id, activo)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- RECUPERACIÓN DE CONTRASEÑA
-- Se guarda el hash (SHA-256 en hex) del token, no el token en claro.
-- ---------------------------------------------------------------------
CREATE TABLE tokens_recuperacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expira_en DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tokrec_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    INDEX idx_tokrec_usuario (usuario_id, usado)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- TOKENS JWT REVOCADOS (logout / invalidación)
-- jti = identificador único del JWT (claim "jti")
-- ---------------------------------------------------------------------
CREATE TABLE tokens_revocados (
    jti VARCHAR(64) PRIMARY KEY,
    expira_en DATETIME NOT NULL,
    revocado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_tokrev_expira (expira_en)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- ESPECIALIDADES
-- ---------------------------------------------------------------------
CREATE TABLE especialidades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500),
    activa BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- MÉDICOS
-- Cada médico debe tener una cuenta con rol DOCTOR en usuarios.
-- ---------------------------------------------------------------------
CREATE TABLE medicos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL UNIQUE,

    cedula_profesional VARCHAR(50) NOT NULL UNIQUE,
    anos_experiencia INT,
    idiomas VARCHAR(200),
    consultorio VARCHAR(100),
    disponibilidad VARCHAR(200),

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_medico_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_medico_experiencia
        CHECK (anos_experiencia IS NULL OR anos_experiencia >= 0)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- PACIENTES
-- Cada paciente debe tener una cuenta con rol PATIENT en usuarios.
-- ---------------------------------------------------------------------
CREATE TABLE pacientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL UNIQUE,

    fecha_nacimiento DATE,
    sexo VARCHAR(30),
    estado_civil VARCHAR(50),
    ocupacion VARCHAR(100),
    direccion VARCHAR(300),

    tipo_sangre VARCHAR(10),

    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(20),

    tipo_seguro VARCHAR(50),
    nss VARCHAR(50) UNIQUE,

    ultima_visita DATE,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_paciente_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- MÉDICOS Y ESPECIALIDADES (relación N:M)
-- ---------------------------------------------------------------------
CREATE TABLE medicos_especialidades (
    medico_id BIGINT NOT NULL,
    especialidad_id BIGINT NOT NULL,

    PRIMARY KEY (medico_id, especialidad_id),

    CONSTRAINT fk_me_medico
        FOREIGN KEY (medico_id)
        REFERENCES medicos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_me_especialidad
        FOREIGN KEY (especialidad_id)
        REFERENCES especialidades(id)
        ON DELETE RESTRICT,

    INDEX idx_me_especialidad (especialidad_id)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- CITAS
-- ---------------------------------------------------------------------
CREATE TABLE citas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    paciente_id BIGINT NOT NULL,
    medico_id BIGINT NOT NULL,

    fecha_hora DATETIME NOT NULL,

    tipo_consulta VARCHAR(100) NOT NULL,
    motivo VARCHAR(500),

    duracion INT NOT NULL DEFAULT 30,

    modalidad VARCHAR(50),
    ubicacion VARCHAR(200),

    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cita_paciente
        FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_cita_medico
        FOREIGN KEY (medico_id)
        REFERENCES medicos(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_cita_duracion
        CHECK (duracion > 0),

    CONSTRAINT chk_cita_estado
        CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA')),

    CONSTRAINT chk_cita_modalidad
        CHECK (modalidad IS NULL OR modalidad IN ('Presencial', 'Teleconsulta')),

    INDEX idx_citas_medico_fecha (medico_id, fecha_hora),
    INDEX idx_citas_paciente_fecha (paciente_id, fecha_hora),
    INDEX idx_citas_estado (estado)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- EXPEDIENTES MÉDICOS (uno por paciente)
-- ---------------------------------------------------------------------
CREATE TABLE expedientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    paciente_id BIGINT NOT NULL UNIQUE,

    antecedentes_personales TEXT,
    alergias TEXT,
    padecimientos_cronicos TEXT,
    medicamentos_uso_continuo TEXT,
    cirugias_previas TEXT,
    antecedentes_familiares TEXT,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_expediente_paciente
        FOREIGN KEY (paciente_id)
        REFERENCES pacientes(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- CONSULTAS MÉDICAS
-- ---------------------------------------------------------------------
CREATE TABLE consultas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    expediente_id BIGINT NOT NULL,
    medico_id BIGINT NOT NULL,

    cita_id BIGINT UNIQUE,

    fecha_consulta DATE NOT NULL,

    motivo_consulta VARCHAR(1000) NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,

    proxima_revision DATE,
    observaciones TEXT,

    presion_arterial VARCHAR(20),
    pulso INT,

    temperatura DECIMAL(4,2),
    peso DECIMAL(5,2),
    estatura DECIMAL(5,2),

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_consulta_expediente
        FOREIGN KEY (expediente_id)
        REFERENCES expedientes(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_consulta_medico
        FOREIGN KEY (medico_id)
        REFERENCES medicos(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_consulta_cita
        FOREIGN KEY (cita_id)
        REFERENCES citas(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_consulta_pulso
        CHECK (pulso IS NULL OR pulso > 0),

    CONSTRAINT chk_consulta_temperatura
        CHECK (temperatura IS NULL OR temperatura > 0),

    CONSTRAINT chk_consulta_peso
        CHECK (peso IS NULL OR peso > 0),

    CONSTRAINT chk_consulta_estatura
        CHECK (estatura IS NULL OR estatura > 0),

    INDEX idx_consultas_expediente_fecha (expediente_id, fecha_consulta),
    INDEX idx_consultas_medico_fecha (medico_id, fecha_consulta)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- CATÁLOGO DE MEDICAMENTOS
-- ---------------------------------------------------------------------
CREATE TABLE medicamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,
    presentacion VARCHAR(100),
    concentracion VARCHAR(100),
    descripcion TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_medicamento (nombre, presentacion, concentracion)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- RECETAS (una consulta puede tener varias recetas)
-- ---------------------------------------------------------------------
CREATE TABLE recetas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    consulta_id BIGINT NOT NULL,

    fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    indicaciones_generales TEXT,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_receta_consulta
        FOREIGN KEY (consulta_id)
        REFERENCES consultas(id)
        ON DELETE RESTRICT,

    INDEX idx_receta_consulta (consulta_id)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- DETALLE DE RECETAS (relación N:M recetas <-> medicamentos)
-- ---------------------------------------------------------------------
CREATE TABLE detalle_receta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    receta_id BIGINT NOT NULL,
    medicamento_id BIGINT NOT NULL,

    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(150),
    duracion_dias INT,
    cantidad INT,

    instrucciones TEXT,

    CONSTRAINT fk_detalle_receta
        FOREIGN KEY (receta_id)
        REFERENCES recetas(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_detalle_medicamento
        FOREIGN KEY (medicamento_id)
        REFERENCES medicamentos(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_receta_duracion
        CHECK (duracion_dias IS NULL OR duracion_dias > 0),

    CONSTRAINT chk_receta_cantidad
        CHECK (cantidad IS NULL OR cantidad > 0),

    INDEX idx_detalle_receta (receta_id),
    INDEX idx_detalle_medicamento (medicamento_id)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- CATÁLOGO DE ESTUDIOS
-- ---------------------------------------------------------------------
CREATE TABLE estudios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo VARCHAR(100),

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- ESTUDIOS SOLICITADOS POR CONSULTA (relación N:M consultas <-> estudios)
-- ---------------------------------------------------------------------
CREATE TABLE consulta_estudios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    consulta_id BIGINT NOT NULL,
    estudio_id BIGINT NOT NULL,

    fecha_solicitud DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    estado VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO',

    resultado TEXT,
    observaciones TEXT,

    CONSTRAINT fk_ce_consulta
        FOREIGN KEY (consulta_id)
        REFERENCES consultas(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ce_estudio
        FOREIGN KEY (estudio_id)
        REFERENCES estudios(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_ce_estado
        CHECK (estado IN ('SOLICITADO', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO')),

    INDEX idx_ce_consulta (consulta_id),
    INDEX idx_ce_estudio (estudio_id),
    INDEX idx_ce_estado (estado)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- NOTIFICACIONES (bitácora de correos, SMS y WhatsApp enviados)
-- ---------------------------------------------------------------------
CREATE TABLE notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL,
    cita_id BIGINT,

    canal VARCHAR(20) NOT NULL,
    destino VARCHAR(150) NOT NULL,
    asunto VARCHAR(200),
    mensaje TEXT NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    proveedor_id VARCHAR(100),                 -- SID de Twilio u otro identificador externo
    error VARCHAR(500),

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    enviado_en DATETIME,

    CONSTRAINT fk_notif_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_notif_cita
        FOREIGN KEY (cita_id)
        REFERENCES citas(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_notif_canal
        CHECK (canal IN ('EMAIL', 'SMS', 'WHATSAPP')),

    CONSTRAINT chk_notif_estado
        CHECK (estado IN ('PENDIENTE', 'ENVIADO', 'FALLIDO')),

    INDEX idx_notif_usuario (usuario_id, creado_en),
    INDEX idx_notif_cita (cita_id),
    INDEX idx_notif_estado (estado)
) ENGINE=InnoDB;


-- =====================================================================
-- TRIGGERS
-- =====================================================================
DELIMITER $$

-- ---------------------------------------------------------------------
-- El rol de la cuenta debe coincidir con el perfil (médico / paciente)
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_medico_rol_insert
BEFORE INSERT ON medicos
FOR EACH ROW
BEGIN
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
END$$


CREATE TRIGGER trg_medico_rol_update
BEFORE UPDATE ON medicos
FOR EACH ROW
BEGIN
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
END$$


CREATE TRIGGER trg_paciente_rol_insert
BEFORE INSERT ON pacientes
FOR EACH ROW
BEGIN
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
END$$


CREATE TRIGGER trg_paciente_rol_update
BEFORE UPDATE ON pacientes
FOR EACH ROW
BEGIN
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
END$$


-- ---------------------------------------------------------------------
-- No permitir cambiar el rol de un usuario que ya tiene perfil asociado
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_usuario_validar_rol
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.rol_id <> OLD.rol_id THEN
        IF EXISTS (SELECT 1 FROM medicos WHERE usuario_id = OLD.id)
           OR EXISTS (SELECT 1 FROM pacientes WHERE usuario_id = OLD.id) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede cambiar el rol de un usuario con perfil asociado';
        END IF;
    END IF;
END$$


-- ---------------------------------------------------------------------
-- Validar cruce de horarios de citas
-- Un médico o un paciente no pueden tener dos citas empalmadas.
-- Las citas canceladas no bloquean horarios.
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_cita_validar_horario_insert
BEFORE INSERT ON citas
FOR EACH ROW
BEGIN
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
END$$


CREATE TRIGGER trg_cita_validar_horario_update
BEFORE UPDATE ON citas
FOR EACH ROW
BEGIN
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
END$$

DELIMITER ;
