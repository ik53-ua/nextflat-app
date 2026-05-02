# Project: NextFlat App

## [North Star]
**Proyecto 3: NextFlat App**
Aplicación para encontrar compañeros de piso y viviendas (Tinder-style for flats).

**Arquitectura:**
1. **Frontend**: React + Vite + Tailwind CSS.
2. **Backend**: Spring Boot (Java).
3. **Database**: PostgreSQL (presumiblemente, por las entidades JPA).

## [Esquema de Datos]
### Inmueble (Detalle)
- **id**: Long
- **propietario**: Usuario (nombre, fotoPerfil, bio)
- **precio**: BigDecimal
- **direccion**: String
- **municipio**: String
- **latitud/longitud**: Double
- **descripcion**: String
- **specs**: {habitaciones, baños, ascensor, mascotas, compartido}
- **fotos**: List<String> (URLs)
- **createdAt**: LocalDateTime

## [Service Inventory] (Backend)
- **FeedController**: `/api/feed/{usuarioId}`, `/api/feed/swipe`
- **InmuebleController [NEW]**: `/api/inmuebles/{id}` (Detalle del inmueble)

## [Reglas de Comportamiento]
- **B.L.A.S.T.**:Blueprint (Plan), Link (API connectivity), Architect (3-layer A.N.T.), Stylize (Premium UI), Trigger (Deployment).
- **A.N.T. Architecture**:
    - **Architecture**: SOPs in `architecture/`.
    - **Navigation**: Planning and routing.
    - **Tools**: Implementation scripts/code.

## [Bitácora de Vuelo]
### [2026-04-21] Inicialización
- Clonación del repositorio y revisión de estructura.
### [2026-04-21] Implementación Vista Detallada
- **Backend**: Creado `DetalleInmuebleDTO`, `InmuebleService` y `InmuebleController`.
- **Frontend**: Añadida página `PropertyDetails.jsx` con diseño premium y galería.
- **Navegación**: Integrado acceso a detalles desde `HoverPropertyCard`.
- **Estado**: Feature completada y verificada.
