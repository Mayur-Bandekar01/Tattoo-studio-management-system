# Project Architecture Analysis: Dragon Tattoos

## Overview
Dragon Tattoos is a high-fidelity, role-based Studio Management System built with **Flask**. It follows a modular architecture designed for scalability, security, and a premium "Vibrant Obsidian" user experience.

## Core Architecture

### 1. Backend (Modular Logic)
The backend is organized into a clean directory structure to separate concerns:
- **`backend/app.py`**: The application factory. Handles global configurations (Security, Mail, Uploads) and registers blueprints.
- **`backend/routes/`**: Decentralized route management using Flask Blueprints.
    - `public.py`: Landing pages and static content.
    - `auth.py`: Centralized authentication, registration, and password recovery.
    - `customer.py`, `artist.py`, `owner.py`: Role-specific dashboard logic.
    - `chat.py`: Real-time communication endpoints.
- **`backend/db.py`**: Database abstraction layer using connection pooling for high-performance MySQL interactions.

### 2. Frontend (Vibrant Obsidian Design System)
The frontend uses a custom-built, framework-free design system optimized for aesthetics and performance.
- **Engine**: Jinja2 Server-Side Rendering.
- **Styling**: Vanilla CSS3 with CSS Variables for theming (**Scarlet Obsidian** / **Ivory**).
    - Located in `frontend/static/css/<role>/`.
    - Uses an `@import` architecture for component-level modularity.
- **Interactions**: Vanilla JavaScript (`frontend/static/js/`) for dashboard reactivity and theme management.

### 3. Data Integrity & Security
- **RBAC**: Role-Based Access Control enforced at the route level.
- **CSRF**: Global Cross-Site Request Forgery protection.
- **Connection Pooling**: Efficient database resource management.
- **Validation**: Strict server-side input validation for emails (inclusive of all providers), phones, and passwords.
- **Unified Auth**: Intelligent credential matching supporting alphanumeric Artist IDs and primary email identifiers across a singular `email` parameter.

## File Structure

| Layer | Path | Description |
| :--- | :--- | :--- |
| **Logic** | `backend/routes/` | Role-based blueprints. |
| **Data** | `backend/db.py` | Connection pooling. |
| **UI** | `frontend/templates/` | Modular Jinja2 templates. |
| **Assets** | `frontend/static/` | CSS, JS, and Brand Assets. |
| **Spec** | `design-system/` | Design tokens and visual guides. |

## Development Workflow
The project utilizes the **GSD (Get Stuff Done)** methodology:
- `.planning/`: Contains milestones, task manifests, and architectural decisions.
- `.agent/`: Houses specialized AI agent instructions for Frontend, Backend, and Security.

---
*Last Updated: 2026-05-05*
