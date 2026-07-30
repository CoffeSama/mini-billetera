# Mini Billetera — Desafío Técnico BeePay

App web donde usuarios registrados ven su saldo, se envían dinero entre ellos y consultan su historial de movimientos.

**Demo en línea:** https://mini-billetera.onrender.com (plan gratuito de Render: la primera request puede tardar ~1 minuto mientras el backend despierta).

## Stack

- **Backend:** Laravel 13 (PHP 8.4) — API REST con Laravel Sanctum para autenticación por tokens.
- **Frontend:** React 19 con Vite.
- **Base de datos:** PostgreSQL 16 (vía Docker).

Elegí Laravel porque resuelve de forma segura las partes críticas del desafío (hashing de contraseñas, validación, migraciones y transacciones de base de datos) y me permite concentrarme en la lógica de negocio. React para un frontend reactivo simple, y PostgreSQL por ser la opción relacional más robusta, levantada con Docker para que el entorno sea reproducible.

## Cómo levantar el proyecto

**Requisitos previos:** PHP >= 8.2 con extensión `pdo_pgsql`, Composer, Node.js >= 20, Docker Desktop.

```bash
git clone https://github.com/CoffeSama/mini-billetera.git
cd mini-billetera

# 1. Base de datos (Postgres en Docker)
docker compose up -d

# 2. Backend
cd backend
composer install
cp .env.example .env        # en Windows: copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve           # queda en http://localhost:8000

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm run dev                 # queda en http://localhost:5173
```

Abrir **http://localhost:5173** en el navegador.

## Usuarios de prueba (seeder)

| Email | Contraseña | Saldo inicial |
|---|---|---|
| ana@beepay.test | password123 | Bs 1000 |
| beto@beepay.test | password123 | Bs 1000 |

Con ellos se puede probar una transferencia de inmediato. Todo usuario nuevo también arranca con Bs 1000.

## Endpoints de la API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /api/register | Crea un usuario y devuelve token | No |
| POST | /api/login | Devuelve token si las credenciales son válidas | No |
| POST | /api/logout | Revoca el token actual | Sí |
| GET | /api/me | Usuario autenticado con su saldo | Sí |
| POST | /api/transfers | Ejecuta una transferencia (email, amount, description opcional) | Sí |
| GET | /api/transfers | Historial de movimientos, más recientes primero | Sí |

Los endpoints protegidos esperan el header `Authorization: Bearer <token>`. Los errores de negocio y validación responden 422 con `{"message": "..."}`.

## Decisiones de diseño

- **Transferencia atómica:** toda la operación corre dentro de `DB::transaction` con `lockForUpdate` sobre las filas de ambos usuarios (ver `backend/app/Services/TransferService.php`). El lock se toma en orden ascendente de id para evitar deadlocks entre transferencias cruzadas concurrentes, y el saldo se verifica después de obtener el lock, por lo que el saldo nunca puede quedar negativo ni puede perderse o duplicarse dinero a mitad de camino. El débito y crédito los ejecuta la base de datos sobre columnas `decimal`, no PHP con floats.
- **Modelo de datos:** columna `balance` en `users` más una tabla `transfers` como registro inmutable de movimientos. Para un sistema real evolucionaría a un ledger de doble entrada, pero para este alcance esta estructura es más simple de razonar y verificar.
- **`balance` fuera de la asignación masiva:** el saldo solo se modifica a través del servicio de transferencias, nunca desde un request.
- **Auth con tokens Bearer de Sanctum:** más simple de configurar y razonar que cookies de sesión SPA (sin CSRF ni CORS con credenciales), suficiente para el alcance de la demo.
- **Emails normalizados a minúsculas** en registro, login y transferencias, para evitar duplicados o "destinatario no existe" por diferencias de mayúsculas.
- **Validación en backend:** todas las reglas de negocio viven en el servidor (FormRequests + servicio); el frontend solo muestra los mensajes que devuelve la API.

## Tests

Las reglas de negocio están cubiertas por tests de integración que ejecutan la API real (`backend/tests/Feature/TransferTest.php`). Usan una base de datos separada para no tocar los datos de desarrollo. Para correrlos:

```bash
docker exec beepay-db psql -U beepay -d beepay -c "CREATE DATABASE beepay_testing;"
cd backend
php artisan test
```

## Qué quedó fuera y por qué

- Paginación y filtros del historial — el enunciado indica que una lista simple alcanza.
- Recuperación de contraseña y verificación por email — excluidos por el enunciado.
- Expiración de tokens — mejora de seguridad que prioricé por debajo de las reglas de negocio.
- Docker Compose para la app completa — en desarrollo solo la base corre en Docker; el backend igual se construye con Dockerfile para el deploy.

## Ramas

- `main`: rama entregable, siempre en estado funcional.
- `develop`: rama de trabajo.
