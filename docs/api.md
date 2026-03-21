# API Reference

This document outlines the core internal routes used by the Dragon Tattoos web application built on Flask.

## Authentication Routes

### GET /login
Render the login portal.

### POST /login
Process user authentication.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Response:**
- `302`: Redirect to respective dashboard on success (Owner, Artist, or Customer)
- `401` / Flash: Invalid credentials

### GET /register
Render the registration form.

### POST /register
Process new user registration.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Full name |
| email | string | Yes | Email address |
| password | string | Yes | Password |
| phone | string | Yes | Phone number |

### GET /logout
Destroy session and redirect to home.

## Public Pages

### GET /
Home landing page.

### GET /gallery
View the tattoo and studio gallery.

### GET /services
View offered services.

### GET /about
View the studio's about information.

### GET /contact
View studio contact details or submit an inquiry.

## Dashboards

### GET /customer_dashboard
View the unified customer hub for appointments and status tracking.

*Requires Authentication (Session Role: Customer)*

*(Note: Additional routing paths for Owner and Artist dashboards exist internally, adhering to similar parameter and RBAC guidelines.)*
