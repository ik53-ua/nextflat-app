# NextFlat 🏠❤️

> Plataforma inspirada en la dinámica visual de Tinder aplicada al sector inmobiliario. Conectamos inquilinos y propietarios mediante un sistema de doble confirmación (Match).

## 🚀 Flujo de trabajo

Este documento define la nomenclatura de ramas y el flujo de trabajo decidido por el equipo para el desarrollo de NextFlat.

### 🌱 Ramas principales
* **main** → Rama de producción (Código estable y listo para entregar).
* **develop** → Rama de desarrollo (Donde se integran las funcionalidades probadas).

### 🌿 Ramas de soporte (todo en minúsculas y separado por guiones)
El formato será: `IdTarjeta/tipo-nombre-breve` (El ID corresponde al número de la tarjeta en Trello/Jira).

* **feature** → Para desarrollar una nueva funcionalidad.
    * *Ejemplo:* `101/feature-swipe-pisos`
    * *Ejemplo:* `102/feature-chat-socket`
* **fix** → Para corregir errores o bugs detectados en desarrollo.
    * *Ejemplo:* `204/fix-login-token`
* **hotfix** → Para corregir errores críticos en producción (main).
    * *Ejemplo:* `500/hotfix-crash-servidor`

### 🔧 Guía de Comandos (Paso a paso)

1.  **Empezar una tarea:**
    ```bash
    git checkout develop             # Ir a la rama base
    git pull origin develop          # Actualizar cambios de los compañeros
    git checkout -b 101/feature-registro-usuario # Crear tu rama
    ```

2.  **Guardar cambios:**
    ```bash
    git add .
    git commit -m "Implementado el formulario de registro con validaciones"
    git push origin 101/feature-registro-usuario
    ```

3.  **Integrar cambios (Pull Request):**
    * Ir al repositorio en GitHub.
    * Crear **Pull Request (PR)** desde tu rama hacia `develop`.
    * **Importante:** Asignar a un compañero como "Reviewer".
    * Una vez aprobado por el compañero, hacer **Squash and Merge**.

---

## 📋 Requisitos del Sistema (Prerrequisitos)

Herramientas necesarias para ejecutar el proyecto (A definir en la primera reunión):

* **Lenguaje/Framework:** 
* **Gestor de Paquetes:** 
* **Base de Datos:** 

## 🚀 Instalación y Despliegue Local

### 1. Configuración del Backend

### 2. Configuración del Frontend

---
## Enlace tablero trello
https://trello.com/invite/b/699f3e06e323b1ae66595881/ATTI42184610c24206d97aaf03add4ab81eaEECD7DC6/tablero-taes

## ✒️ Autores (Equipo NextFlat)

Luis Almero Mut

Iván Khomutov Vishnevsky

Georg Usin Osipov

Álvaro Coronado Ordóñez

Enrique Mira-Perceval Lillo

Jorge Enrique Merino Maza

Pablo Bejarano Escolano
