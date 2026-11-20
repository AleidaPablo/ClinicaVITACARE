# Backend de VITACARE

API REST construida con Java 21, Spring Boot y Maven. Este proyecto contiene únicamente la base técnica; todavía no incluye módulos clínicos ni autenticación.

## Tecnologías preparadas

- Spring Web para exponer endpoints REST.
- Spring Data JPA para el acceso a datos relacional.
- MySQL Connector/J para conectar con MySQL.
- Flyway para versionar y aplicar cambios futuros al esquema.
- Bean Validation para validar datos de entrada cuando se creen los endpoints.

## Configuración local

La aplicación lee las variables `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`. `DB_URL` usa por defecto `jdbc:mysql://localhost:3306/vitacare_db`; el usuario y la contraseña deben definirse en el entorno local. No guardes credenciales reales en Git.

Flyway buscará migraciones en `src/main/resources/db/migration`. Las migraciones se agregarán cuando se diseñe y apruebe el modelo de datos.

## Ejecutar

Con Java 21 y Maven 3.6.3 o posterior instalados, desde esta carpeta:

```powershell
mvn spring-boot:run
```

La aplicación requiere que MySQL esté disponible y que las variables de conexión estén configuradas.
