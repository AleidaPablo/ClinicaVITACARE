<div align="center">

#  VITACARE — Sistema de Gestión de Clínica Médica

**Plataforma web full stack para la administración integral de clínicas: pacientes, médicos, citas, expedientes clínicos, consultas, recetas, estudios y notificaciones multicanal automatizadas.**

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

**Equipo 12:** Velasco Martínez Zeferino · Evelin Aleida Pablo Delgado 

</div>

---

##  Enlaces del proyecto

| Recurso | Enlace / Ubicación |
|---|---|
| **Servidor / Despliegue en VPS** | [`https://clinica-vitacare.duckdns.org`](https://clinica-vitacare.duckdns.org) |
| **Repositorio en GitHub** | [github.com/AleidaPablo/ClinicaVITACARE](https://github.com/AleidaPablo/ClinicaVITACARE.git) |
| **Prototipo en Figma** | [Mockup Clínica · Figma](https://www.figma.com/proto/hg8gvs3T7mGauy7oNG8s1R/Mockup-Clinica?node-id=171-182&t=2aDGGwF0ZnWUZJmp-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=171%3A182&show-proto-sidebar=1) |
| **Tablero GitHub Projects** | [Projects · ClinicaVITACARE](https://github.com/AleidaPablo/ClinicaVITACARE/projects) |
| **Diagrama Entidad-Relación** |[Descargar PDF](docs/Database%20Schema.pdf)|



---

##  Funcionalidades por rol

El control de acceso se aplica en dos capas: validación estricta en el servidor mediante **Spring Security + JWT** y protección de rutas en la interfaz con **React Router**.

| Rol | Permisos y capacidades |
|---|---|
| **ADMIN** *(Administrador)* | Control total del sistema: administración de usuarios, médicos y pacientes (altas, ediciones y bajas), gestión global de citas, supervisión de expedientes y métricas en el dashboard. |
| **DOCTOR** *(Médico)* | Consulta de directorio de pacientes, gestión de su agenda de citas, apertura y actualización de expedientes clínicos, registro de consultas, emisión de recetas y solicitud de estudios. |
| **PATIENT** *(Paciente)* | Portal personal con acceso aislado exclusivamente a su información: agendamiento y consulta de sus propias citas, revisión de su expediente clínico y edición de su perfil. |

### Características transversales
* Autenticación segura mediante correo electrónico y contraseña, autorregistro de pacientes y flujo completo de recuperación y restablecimiento de contraseña.
* Listados optimizados con **paginación y búsqueda en el servidor** (`page`, `size`, `search`).
* Validaciones en tiempo real debajo de cada campo del formulario, modales de confirmación para acciones críticas, indicadores de estado de carga y diseño responsivo.

---

##  Stack tecnológico

| Capa | Tecnologías y herramientas |
|---|---|
| **Backend** | Java 21, Spring Boot 3.5, Spring Web, Spring Data JPA (Hibernate), Spring Security, JWT (`jjwt`), Bean Validation, Maven |
| **Base de datos** | MySQL 8.0, Flyway (migraciones versionadas) |
| **Frontend** | React, Vite, React Router, Axios, JavaScript (ES6+), HTML5, CSS3 |
| **Mensajería** | `JavaMailSender` + SMTP (Postfix / Gmail), API de Twilio (SMS y WhatsApp) |
| **DevOps y QA** | VPS Ubuntu (`178.128.155.105`), Nginx (proxy inverso), `systemd`, Certbot (Let's Encrypt), Bruno, Figma, Git & GitHub Projects |

---
## Ejecución local y despliegue


### 1. Backend (Spring Boot + Maven)
```bash
cd backend
mvn spring-boot:run
```
*(Para generar el paquete `.jar` de producción: `mvn clean package -DskipTests`)*

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*(Para compilar la versión de producción: `npm run build`)*

### 3. Producción en VPS (Ubuntu + Nginx + systemd)
- La aplicación se expone mediante **Nginx** como proxy inverso con HTTPS en `https://clinica-vitacare.duckdns.org`.
- El backend se ejecuta en segundo plano como servicio gestionado por **`systemd`** (`vitacare-backend.service`), lo que permite mantenerlo activo y recuperarse automáticamente ante reinicios o cierres inesperados.