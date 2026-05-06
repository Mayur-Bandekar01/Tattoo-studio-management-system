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
            user_role = session.get("role")
            if user_role != role:
                if user_role:
                    # User is logged in but has the wrong role
                    flash(f"Access denied. Your {user_role} account cannot access {role} areas.", "error")
                    return redirect(f"/{user_role}/dashboard")
                else:
                    # User is not logged in at all
                    flash(f"Please login as a {role.capitalize()} to access this page.", "info")
                    return redirect("/login")
            return f(*args, **kwargs)

        return decorated_function

    return decorator
