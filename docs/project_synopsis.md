# Project Synopsis: Dragon Tattoos Studio Management System

## Overview
Dragon Tattoos Studio Management System is a role-based management application designed for tattoo studios. The portal brings client appointments, artist scheduling, inventory tracking, and billing operations into a unified platform.

## Objectives
- **Centralize Booking**: Provide clients with an intuitive appointment booking flow for tattoos, custom sketches, and removal services.
- **Artist Workflow**: Give artists direct access to their schedules, portfolio uploads, and material usage logs.
- **Business Operations**: Provide studio management with revenue tracking, inventory monitoring, and billing capabilities.

## System Modules

### 1. Customer Portal
- Browse public artist galleries and services.
- Submit appointment requests with placement and reference images.
- Track appointment status and view invoices.

### 2. Artist Portal
- View assigned appointments and daily schedule.
- Upload artwork to portfolio galleries.
- Log studio supply consumption (inks, needles, materials).

### 3. Studio Management (Owner)
- Comprehensive overview of studio appointments and revenue.
- Manage staff, artist profiles, and service rates.
- Inventory control with low-stock alerts.
- Issue invoices and record client payments.

### 4. Authentication & Security
- Role-Based Access Control (Owner, Artist, Customer).
- CSRF protection across all forms and state-changing actions.
- Connection pooling for MySQL database interactions.

## Technology Stack
- **Backend**: Python 3, Flask, Flask-WTF, Flask-Mail
- **Database**: MySQL with connection pooling
- **Frontend**: HTML5, Vanilla CSS3, JavaScript, Jinja2 Templates
- **Version Control**: Git & GitHub
