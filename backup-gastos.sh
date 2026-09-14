#!/bin/bash

set -e

# =========================
# CONFIGURACIÓN
# =========================

PROYECTO="/home/javi/proyectos/gastos-perezbuseu"

GOOGLE_DRIVE="gastos-google-drive:Backups Gastos PerezBuseu"

FECHA=$(date +"%Y-%m-%d_%H-%M-%S")

BACKUP="/tmp/backup-gastos-perezbuseu-$FECHA"

ARCHIVO="/tmp/backup-$FECHA.tar.gz"


# =========================
# CREAR CARPETA TEMPORAL
# =========================

echo "================================="
echo " INICIANDO BACKUP"
echo "================================="

mkdir -p "$BACKUP"


# =========================
# BASE DE DATOS
# =========================

echo ""
echo "Copiando base de datos..."

docker exec gastos-perezbuseu-postgres \
pg_dump \
-U gastos_user \
-d gastos_db \
> "$BACKUP/database.sql"


# =========================
# ARCHIVOS SUBIDOS
# =========================

echo "Copiando archivos subidos..."

if [ -d "$PROYECTO/backend/uploads" ]; then

    cp -r \
    "$PROYECTO/backend/uploads" \
    "$BACKUP/uploads"

fi


# =========================
# CONFIGURACIÓN
# =========================

echo "Copiando configuración..."

cp "$PROYECTO/.env" \
"$BACKUP/.env"

cp "$PROYECTO/docker-compose.yml" \
"$BACKUP/docker-compose.yml"

cp "$PROYECTO/Caddyfile" \
"$BACKUP/Caddyfile"


# =========================
# INFORMACIÓN DEL BACKUP
# =========================

cat > "$BACKUP/INFO.txt" << EOF
Backup Gastos PérezBuseu

Fecha:
$FECHA

Contenido:

- database.sql
- uploads
- .env
- docker-compose.yml
- Caddyfile

EOF


# =========================
# COMPRIMIR
# =========================

echo "Comprimiendo backup..."

tar -czf \
"$ARCHIVO" \
-C "/tmp" \
"backup-gastos-perezbuseu-$FECHA"


# =========================
# SUBIR A GOOGLE DRIVE
# =========================

echo ""
echo "Subiendo backup a Google Drive..."

rclone copy \
"$ARCHIVO" \
"$GOOGLE_DRIVE" \
-P


# =========================
# COMPROBAR SUBIDA
# =========================

echo ""
echo "Comprobando subida a Google Drive..."

NOMBRE_ARCHIVO=$(basename "$ARCHIVO")

if rclone lsf "$GOOGLE_DRIVE" | grep -Fxq "$NOMBRE_ARCHIVO"; then

    echo ""
    echo "Backup subido correctamente a Google Drive."

else

    echo ""
    echo "ERROR: No se ha podido comprobar la subida a Google Drive."

    exit 1

fi


# =========================
# BORRAR ARCHIVOS TEMPORALES
# =========================

echo ""
echo "Borrando archivos temporales..."

rm -rf "$BACKUP"

rm -f "$ARCHIVO"


# =========================
# FINAL
# =========================

echo ""
echo "================================="
echo " BACKUP TERMINADO CORRECTAMENTE"
echo "================================="
echo ""

echo "Copia guardada en:"
echo "$GOOGLE_DRIVE/$NOMBRE_ARCHIVO"

echo ""
