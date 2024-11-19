# GhostChat

**GhostChat** es una aplicación de mensajería privada diseñada para garantizar la máxima seguridad y privacidad. Ofrece cifrado de extremo a extremo y mensajes efímeros, asegurando que, al salir de un chat, no quede ningún dato almacenado en los servidores.

La aplicación ha sido desarrollada utilizando **Django** y **Angular**, con el backend implementado como una API REST mediante **Django Rest Framework**.


https://github.com/user-attachments/assets/ff6b7d07-aeb0-4163-8a5d-4db4d3d1a079


## Características principales

- **Mensajes privados y efímeros**: Los mensajes se eliminan al finalizar la sesión del chat.
- **Cifrado de extremo a extremo**: Garantiza que la comunicación sea segura y privada.
- **Sistema de amigos**: Enviar y recibir solicitudes de amistad.
- **Salas privadas**: Creación de salas únicas accesibles solo para los usuarios que las han creado.
- **Notificaciones en tiempo real**: Los usuarios son informados de eventos importantes.
- **Gestión de usuario**: Cambio de contraseña, gestión de información privada y cierre de sesión.

## Tecnologías

- **Backend**: API REST utilizando Django Rest Framework, con un sistema de sesiones que guarda y valida tokens mediante cookies en el navegador. La funcionalidad de chat en tiempo real se ha logrado utilizando Django Channels junto con un servidor Redis.
- **Frontend**: Angular, con componentes organizados, servicios para llamadas a la API, `auth guards` para control de permisos y WebSockets para mantener la conexión del chat en tiempo real.


## Instalación

### Instalación de dependencias (Frontend)

```bash
cd ./frontend/
npm install
```

### Instalación de dependencias (Backend)

```bash
  cd ./backend/

  python -m venv .env

  .env/Scripts/activate

  pip install -r requirements.txt
```

#### Migrar la base de datos

```bash
  python manage.py makemigrations

  python manage.py migrate
```

#### Genera un .config para la información delicada

```
EMAIL_FROM_USER=""
EMAIL_HOST_PASSWORD=""
REDIS_URL=""
DATABASE_NAME=""
DATABASE_USER=""
DATABASE_PASSWORD=""
DATABASE_HOST=""
DATABASE_PORT=""
SECRET_KEY=""
```

## Ejecutar el proyecto

### Frontend
```bash
  ng serve
```
### Backend
```bash
  python manage.py runserver
```


#### Desarrollador por Sebastian Diez
