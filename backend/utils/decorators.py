from functools import wraps
from flask import session, redirect, flash


def role_required(role):
    """
    Enforces that only a specific user role (e.g., 'owner', 'artist', 'customer')
     can access a particular route.
    Usage: @role_required('owner')
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check the role stored in the user's session
            if session.get("role") != role:
                flash(f"Access denied. {role.capitalize()} role required.", "error")
                return redirect("/login")
            return f(*args, **kwargs)

        return decorated_function

    return decorator
