# NextFlat 🏠❤️

> Plataforma de matching inmobiliario inspirada en Tinder. Conectamos inquilinos y propietarios mediante un sistema de doble confirmación (Match).

**Monorepo:** `NEXTFLAT-APP` · **Backend:** Spring Boot · **Frontend:** React · **Base de datos:** Supabase (PostgreSQL)

---

## 📋 Descripción del Proyecto

NextFlat es una plataforma donde el propietario publica su piso y el inquilino hace swipe. Solo se genera contacto cuando **ambas partes confirman su interés** (match). Inspirado en la dinámica visual de Tinder aplicada al sector inmobiliario.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
|------|-----------|-------------|
| Backend | Spring Boot 3.x | Framework Java para la API REST |
| Backend | Maven (mvnw) | Gestor de dependencias y build |
| Frontend | React + Vite | Interfaz de usuario SPA |
| Frontend | npm | Gestor de paquetes JavaScript |
| Base de datos | Supabase (PostgreSQL) | BaaS con auth, storage y realtime |
| Control de versiones | Git + GitHub | Repositorio y flujo de ramas |

---

## 📋 Prerrequisitos

Asegúrate de tener instalado lo siguiente antes de ejecutar el proyecto:

- **Java 21** o superior → `java -version`
- **Node.js 18** o superior → `node -v`
- **npm** → `npm -v`
- **Git** → `git --version`
- **Cuenta en Supabase** (gratuita) → https://supabase.com

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-org/NEXTFLAT-APP.git
cd NEXTFLAT-APP
```

### 2. Configuración de Supabase

1. Entra en https://supabase.com y crea un proyecto nuevo.
2. Ve a **Settings → API** y copia tu `URL` y tu `anon key`.
3. Ve a **Settings → Database** y copia la cadena de conexión PostgreSQL.

---

### 3. Configuración del Backend (Spring Boot)

1. Entra en la carpeta del backend:

```bash
cd backend
```

2. Copia el fichero de propiedades de entorno:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.yaml
```

3. Edita `application.yaml` y rellena tus credenciales:

```properties
spring.datasource.url=jdbc:postgresql://db.<TU-REF>.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=<TU-PASSWORD>
supabase.url=https://<TU-REF>.supabase.co
supabase.anon-key=<TU-ANON-KEY>
spring.jpa.hibernate.ddl-auto=update
```

4. Ejecuta el backend con el wrapper de Maven:

```bash
# Linux/Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

5. El backend arrancará en: **http://localhost:8080**

---

### 4. Configuración del Frontend (React)

1. Abre una nueva terminal y entra en la carpeta del frontend:

```bash
cd frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. Copia el fichero de variables de entorno:

```bash
cp .env.example .env
```

4. Edita `.env` con tus credenciales:

```env
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=https://<TU-REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<TU-ANON-KEY>
```

5. Arranca el servidor de desarrollo:

```bash
npm run dev
```

6. El frontend estará disponible en: **http://localhost:5173**

---

## 🗂️ Jerarquía de Archivos

### Backend (Spring Boot)

El orden correcto para entender el código es:
**base de datos → entidades → DTOs → repositorios → servicios → seguridad → controladores**

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/ua/nextflat/
│   │   │       ├── config/
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   └── SupabaseConfig.java
│   │   │       ├── controller/
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── PisoController.java
│   │   │       │   ├── MatchController.java
│   │   │       │   └── UsuarioController.java
│   │   │       ├── dto/
│   │   │       │   ├── PisoRequestDTO.java
│   │   │       │   ├── PisoResponseDTO.java
│   │   │       │   └── UsuarioDTO.java
│   │   │       ├── model/
│   │   │       │   ├── Piso.java
│   │   │       │   ├── Match.java
│   │   │       │   └── Usuario.java
│   │   │       ├── repository/
│   │   │       │   ├── PisoRepository.java
│   │   │       │   ├── MatchRepository.java
│   │   │       │   └── UsuarioRepository.java
│   │   │       ├── service/
│   │   │       │   ├── PisoService.java
│   │   │       │   ├── MatchService.java
│   │   │       │   └── UsuarioService.java
│   │   │       └── NextflatApplication.java
│   │   └── resources/
│   │       └── application.yaml       
│   └── test/
│       └── java/com/nextflat/
│           └── ...Tests.java
├── .gitignore
├── pom.xml                    ← Dependencias Maven
└── mvnw / mvnw.cmd            ← Wrapper Maven (no hace falta instalar Maven)
```

| Carpeta / Archivo | Descripción |
|-------------------|-------------|
| `model/` | Clases Java que mapean las tablas de Supabase. **Punto de partida**: aquí se define la estructura de datos. |
| `dto/` | Data Transfer Objects. Filtran qué datos se exponen en la API. Separan la lógica interna de la respuesta al cliente. |
| `repository/` | Interfaces JPA que hablan con la base de datos. Spring genera las queries automáticamente. |
| `service/` | La lógica de negocio: algoritmo de match, validaciones, reglas del dominio. |
| `config/SecurityConfig` | Configura Spring Security: rutas públicas y validación de tokens JWT de Supabase. |
| `config/SupabaseConfig` | Bean con la URL y la clave de Supabase, leído desde `application.properties`. |
| `controller/` | Expone los endpoints REST. Solo orquesta: recibe petición → llama al service → devuelve respuesta. |
| `NextflatApplication` | Clase principal. Arranca todo. No tocar salvo caso justificado. |
| `application.yaml` | Credenciales y config local. 
| `pom.xml` | Declara todas las dependencias (Spring Data JPA, Security, Web, etc.). |

---

### Frontend (React)

El orden para entender el código es:
**punto de entrada → enrutado → páginas → componentes → servicios/hooks → estilos**

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/              ← Imágenes, logos, iconos estáticos
│   ├── components/          ← Componentes reutilizables (botones, cards, navbar...)
│   │   ├── SwipeCard.jsx
│   │   ├── MatchModal.jsx
│   │   └── Navbar.jsx
│   ├── pages/               ← Una carpeta/archivo por pantalla de la app
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Swipe.jsx
│   │   └── Matches.jsx
│   ├── services/            ← Llamadas a la API del backend (fetch/axios)
│   │   ├── api.js           ← Instancia base con la URL del backend
│   │   ├── authService.js
│   │   └── pisoService.js
│   ├── hooks/               ← Custom hooks de React (lógica reutilizable)
│   │   └── useAuth.js
│   ├── context/             ← Context API para estado global (usuario autenticado...)
│   │   └── AuthContext.jsx
│   ├── App.jsx              ← Componente raíz, monta el router
│   └── main.jsx             ← Punto de entrada, monta App en el DOM
├── .env                     ← Variables de entorno locales (NO subir a Git)
├── .env.example             ← Plantilla pública (SÍ subir a Git)
├── .gitignore
├── index.html               ← HTML base donde se inyecta React
├── package.json             ← Dependencias npm y scripts
└── vite.config.js           ← Configuración del bundler Vite
```

| Carpeta / Archivo | Descripción |
|-------------------|-------------|
| `main.jsx` | Punto de entrada. Renderiza `<App />` en el `div#root` de `index.html`. No tocar. |
| `App.jsx` | Monta el router y los providers de contexto global. Todo pasa por aquí. |
| `pages/` | Una página = una pantalla completa. Las páginas llaman a services y usan componentes. |
| `components/` | Piezas de UI reutilizables. No contienen lógica de negocio ni llamadas directas a la API. |
| `services/` | Toda llamada HTTP al backend pasa por aquí. Centraliza la URL base y los headers de auth. |
| `hooks/` | Custom hooks para encapsular lógica de estado compleja y reutilizarla entre componentes. |
| `context/` | Estado global con Context API. Ejemplo: saber en cualquier componente si el usuario está logueado. |
| `assets/` | Recursos estáticos importados en el código. Los que no se importan van en `public/`. |
| `.env` | Variables de entorno (URLs, API keys). En `.gitignore`, **NUNCA se sube al repo**. |
| `package.json` | Dependencias y scripts: `npm run dev` (desarrollo), `npm run build` (producción). |
| `vite.config.js` | Configuración del bundler. Aquí se configura el proxy para evitar CORS en desarrollo. |

---

## 🌱 Flujo de Trabajo Git

### Ramas principales

| Rama | Descripción |
|------|-------------|
| `main` | Producción. Código estable y listo para entregar. Solo recibe merges de `develop` o `hotfix`. |
| `develop` | Desarrollo. Punto de integración de todas las funcionalidades probadas. |

### Ramas de soporte

Formato: `IdTarjeta/tipo-nombre-breve` (todo en minúsculas, separado por guiones)

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feature` | Nueva funcionalidad | `101/feature-swipe-pisos` |
| `fix` | Corrección de bug en desarrollo | `204/fix-login-token` |
| `hotfix` | Corrección crítica en producción | `500/hotfix-crash-servidor` |

### Comandos paso a paso

**1. Empezar una tarea**

```bash
git checkout develop                              # Ir a la rama base
git pull origin develop                           # Actualizar cambios de los compañeros
git checkout -b 101/feature-registro-usuario      # Crear tu rama
```

**2. Guardar cambios**

```bash
git add .
git commit -m "Implementado el formulario de registro con validaciones"
git push origin 101/feature-registro-usuario
```

**3. Integrar y subir a develop (Merge local)**
 
```bash
git checkout develop                              # Cambiar a la rama principal de desarrollo
git pull origin develop                           # Descargar los últimos cambios del equipo
git merge 101/feature-registro-usuario            # Fusionar los cambios de tu rama en develop
git push origin develop                           # Subir el código integrado a GitHub
```

## ⚡ Scripts Útiles

### Backend

| Comando | Descripción |
|---------|-------------|
| `./mvn spring-boot:run` | Arranca el servidor en modo desarrollo (puerto 8080) |
| `./mvn test` | Ejecuta los tests unitarios |
| `./mvn package` | Genera el `.jar` de producción en `target/` |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload (puerto 5173) |
| `npm run build` | Genera la build de producción en `dist/` |
| `npm run preview` | Previsualiza la build de producción localmente |

---

## 🔗 Enlaces del Proyecto

- 📋 [Tablero Trello](https://trello.com/invite/b/699f3e06e323b1ae66595881/ATTI42184610c24206d97aaf03add4ab81eaEECD7DC6/tablero-taes)

---

## ✒️ Equipo NextFlat

- Luis Almero Mut
- Iván Khomutov Vishnevsky
- Georg Usin Osipov
- Álvaro Coronado Ordóñez
- Enrique Mira-Perceval Lillo
- Jorge Enrique Merino Maza
- Pablo Bejarano Escolano
