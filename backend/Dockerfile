# Imagen para desplegar el backend en Render (u otro host de contenedores).
# Para desarrollo local no hace falta: se usa php artisan serve.
FROM php:8.4-cli-alpine

# Extensión de Postgres
RUN apk add --no-cache postgresql-dev \
    && docker-php-ext-install pdo_pgsql

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

# Render inyecta PORT; 10000 es su default
ENV PORT=10000
EXPOSE 10000

# Migra (y siembra los usuarios demo) al arrancar, luego sirve la API.
CMD php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=${PORT}
