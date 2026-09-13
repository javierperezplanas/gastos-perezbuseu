# Recuperación completa de Gastos PérezBuseu

Este documento explica cómo recuperar completamente la aplicación **Gastos PérezBuseu** en caso de pérdida total del ordenador o del disco duro.

La aplicación dispone de:

* Código fuente en Git.
* Backups de la base de datos.
* Backup de los archivos subidos.
* Copia local de los backups.
* Copia externa en Google Drive.

---

# 1. Instalar Debian

Instalar Debian en el nuevo ordenador.

Después actualizar el sistema:

```bash
sudo apt update
sudo apt upgrade -y
```

---

# 2. Instalar Git

Instalar Git:

```bash
sudo apt install -y git
```

Comprobar la instalación:

```bash
git --version
```

---

# 3. Instalar Docker

Instalar Docker y Docker Compose.

Comprobar que Docker funciona:

```bash
docker --version
docker compose version
```

---

# 4. Crear la carpeta de proyectos

Crear la carpeta:

```bash
mkdir -p ~/proyectos
```

Entrar en ella:

```bash
cd ~/proyectos
```

---

# 5. Recuperar el código fuente

Clonar el repositorio Git de Gastos PérezBuseu:

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar en el proyecto:

```bash
cd gastos-perezbuseu
```

Comprobar los archivos:

```bash
ls -la
```

---

# 6. Descargar el último backup

Los backups se guardan en:

## Copia local

```text
/mnt/disco/backups-gastos-perezbuseu
```

## Google Drive

```text
Backups Gastos PerezBuseu
```

Descargar o copiar el backup más reciente.

El backup tiene un nombre similar a:

```text
backup-2026-09-13_14-00-00.tar.gz
```

---

# 7. Descomprimir el backup

Crear una carpeta temporal:

```bash
mkdir -p ~/recuperar-gastos
```

Copiar el backup a esa carpeta.

Entrar en ella:

```bash
cd ~/recuperar-gastos
```

Descomprimir:

```bash
tar -xzf backup-AAAA-MM-DD_HH-MM-SS.tar.gz
```

Se creará una carpeta similar a:

```text
backup-AAAA-MM-DD_HH-MM-SS/
```

Entrar en ella:

```bash
cd backup-AAAA-MM-DD_HH-MM-SS
```

El contenido del backup será:

```text
database.sql
uploads/
.env
docker-compose.yml
Caddyfile
INFO.txt
```

---

# 8. Restaurar la configuración

Copiar los archivos de configuración al proyecto.

Desde la carpeta del backup:

```bash
cp .env ~/proyectos/gastos-perezbuseu/
```

```bash
cp docker-compose.yml ~/proyectos/gastos-perezbuseu/
```

```bash
cp Caddyfile ~/proyectos/gastos-perezbuseu/
```

---

# 9. Restaurar los archivos subidos

Copiar la carpeta `uploads`:

```bash
mkdir -p ~/proyectos/gastos-perezbuseu/backend/uploads
```

Después:

```bash
cp -r uploads/. ~/proyectos/gastos-perezbuseu/backend/uploads/
```

---

# 10. Levantar PostgreSQL

Ir al proyecto:

```bash
cd ~/proyectos/gastos-perezbuseu
```

Levantar únicamente PostgreSQL:

```bash
docker compose up -d postgres
```

Comprobar que está funcionando:

```bash
docker compose ps
```

Esperar unos segundos si PostgreSQL todavía está iniciándose.

---

# 11. Restaurar la base de datos

Restaurar la base de datos desde `database.sql`.

Desde la carpeta donde está el backup:

```bash
docker exec -i gastos-perezbuseu-postgres \
psql \
-U gastos_user \
-d gastos_db \
< database.sql
```

Si el nombre del contenedor cambia, comprobarlo con:

```bash
docker compose ps
```

---

# 12. Levantar toda la aplicación

Ir al proyecto:

```bash
cd ~/proyectos/gastos-perezbuseu
```

Construir e iniciar todos los servicios:

```bash
docker compose up -d --build
```

---

# 13. Comprobar los contenedores

Ejecutar:

```bash
docker compose ps
```

Deberían aparecer funcionando los servicios:

* PostgreSQL.
* Backend.
* Frontend.
* Caddy.

---

# 14. Comprobar los registros

Si algo no funciona:

```bash
docker compose logs
```

Para ver los últimos mensajes:

```bash
docker compose logs --tail=100
```

Para ver los registros en tiempo real:

```bash
docker compose logs -f
```

---

# 15. Comprobar la aplicación

Abrir la aplicación en el navegador.

Comprobar:

* Se puede iniciar sesión.
* Los usuarios existen.
* Los grupos existen.
* Los gastos están presentes.
* Los balances son correctos.
* Los archivos subidos están disponibles.

---

# Información importante

## Código fuente

El código fuente está guardado en Git.

Después de realizar cambios importantes:

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "Descripción de los cambios"
```

```bash
git push
```

---

## Backup diario

El script de backup es:

```text
/home/javi/proyectos/gastos-perezbuseu/backup-gastos.sh
```

El backup contiene:

* Base de datos PostgreSQL.
* Archivos subidos.
* Archivo `.env`.
* `docker-compose.yml`.
* `Caddyfile`.

Los backups se guardan localmente en:

```text
/mnt/disco/backups-gastos-perezbuseu
```

También se suben a:

```text
Google Drive → Backups Gastos PerezBuseu
```

---

# Comprobación de un backup

Para comprobar que existe un backup local:

```bash
ls -lh /mnt/disco/backups-gastos-perezbuseu
```

Para ejecutar manualmente el backup:

```bash
/home/javi/proyectos/gastos-perezbuseu/backup-gastos.sh
```

---

# Resumen de recuperación

En caso de pérdida total:

1. Instalar Debian.
2. Instalar Git.
3. Instalar Docker y Docker Compose.
4. Clonar el proyecto desde Git.
5. Descargar el último backup.
6. Descomprimir el backup.
7. Restaurar `.env`.
8. Restaurar `docker-compose.yml`.
9. Restaurar `Caddyfile`.
10. Restaurar `uploads`.
11. Levantar PostgreSQL.
12. Restaurar `database.sql`.
13. Levantar toda la aplicación.
14. Comprobar que todo funciona.

Con el repositorio Git y el último backup es posible recuperar la aplicación y sus datos.
