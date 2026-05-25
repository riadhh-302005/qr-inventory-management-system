#!/bin/bash
set -e

PHP_INI="/home/runner/workspace/artifacts/laravel-api/php.ini"
APP_DIR="/home/runner/workspace/artifacts/laravel-api"
SERVER_PHP="$APP_DIR/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"

# Ensure MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "Starting MongoDB..."
    mkdir -p /tmp/mongodb/data
    mongod --dbpath /tmp/mongodb/data --port 27017 --bind_ip 127.0.0.1 \
        --fork --logpath /tmp/mongodb/mongod.log
    sleep 2
    echo "MongoDB started."
fi

cd "$APP_DIR"

# Clear config cache
php -c "$PHP_INI" artisan config:clear --quiet 2>/dev/null || true

PORT=${PORT:-8080}
echo "Starting Laravel on port $PORT..."

# server.php uses getcwd() as the document root, so cd to public/ first
cd "$APP_DIR/public"
exec php -c "$PHP_INI" -S 0.0.0.0:"$PORT" "$SERVER_PHP"
