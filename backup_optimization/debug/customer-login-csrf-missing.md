---
status: investigating
trigger: 'Bad Request The CSRF token is missing.' after clicking on customer login
symptoms:
  - expected_behavior: 'Successful login and redirection to dashboard'
  - actual_behavior: 'Error message: Bad Request The CSRF token is missing.'
  - reproduction: 'Fill out the login form on /login and click LOGIN'
  - timeline: 'Reported by user as a current blocker'
  - environment: 'Flask backend with CSRFProtect enabled'
current_focus:
  hypothesis: 'The login.html template is missing the CSRF token hidden field required by Flask-WTF CSRFProtect'
  next_action: 'Add {{ csrf_token() }} to the login form in frontend/templates/auth/login.html'
---

# Debug Session: customer-login-csrf-missing

## Initial Discovery
Found that `backend/app.py` has global CSRF protection enabled via `CSRFProtect(app)`.
Inspected `frontend/templates/auth/login.html` and confirmed the `<form>` lacks the `csrf_token` input.
Checked `frontend/templates/auth/register.html` and noticed it correctly includes `<input type="hidden" name="csrf_token" value="{{ csrf_token() }}">`.

## Evidence
- `backend/app.py:33`: `csrf = CSRFProtect(app)`
- `frontend/templates/auth/login.html:787`: `<form id="loginForm" method="POST" action="/login" autocomplete="off">` (Missing CSRF)

## Next Steps
- [ ] Add CSRF token to `login.html`
- [ ] Verify if other auth forms (forgot password, reset password) have the CSRF token.
