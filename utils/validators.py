# utils/validators.py
# Helper functions to validate user inputs (Files, Images, etc.)
import os

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    """
    Checks if a file has a supported image extension (PNG, JPG, JPEG).
    Used during booking and gallery uploads.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_size(file_obj, max_size_mb=5):
    """
    Ensures that uploaded images are not too large (default 5MB).
    This prevents the server from running out of disk space.
    """
    file_obj.seek(0, os.SEEK_END)
    file_size = file_obj.tell()
    file_obj.seek(0)
    return file_size <= max_size_mb * 1024 * 1024
