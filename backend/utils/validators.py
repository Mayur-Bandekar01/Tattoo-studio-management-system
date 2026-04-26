import os
import math

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename):
    """
    Checks if a file has a supported image extension (PNG, JPG, JPEG).
    Used during booking and gallery uploads.
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_image_size(file_obj, max_size_mb=5):
    """
    Ensures that uploaded images are not too large (default 5MB).
    This prevents the server from running out of disk space.
    """
    file_obj.seek(0, os.SEEK_END)
    file_size = file_obj.tell()
    file_obj.seek(0)
    return file_size <= max_size_mb * 1024 * 1024


def is_valid_numeric(value):
    """
    Strictly validates if a value is a finite number.
    Prevents 'inf', '-inf', and 'NaN' from bypassing checks.
    """
    try:
        val = float(value)
        return not (math.isinf(val) or math.isnan(val))
    except (ValueError, TypeError):
        return False


def validate_fields(form_data, required_fields):
    """
    Standardized helper to verify that all required fields are present and not empty.
    Returns a list of missing/empty field names.
    """
    missing = []
    for field in required_fields:
        val = form_data.get(field, "").strip()
        if not val:
            missing.append(field)
    return missing
