from functools import wraps
from flask import session, redirect, flash

def role_required(role):
    """Decorator to enforce role-based access control."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if session.get('role') != role:
                flash(f"Access denied. {role.capitalize()} role required.", "error")
                return redirect('/login')
            return f(*args, **kwargs)
        return decorated_function
    return decorator
