from datetime import date, datetime, timedelta

def sanitize_for_json(data):
    """
    Recursively convert timedelta, date, and datetime objects to strings 
    for JSON serialization in Flask templates via tojson.
    """
    if isinstance(data, list):
        return [sanitize_for_json(item) for item in data]
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    if isinstance(data, timedelta):
        # Convert timedelta to "HH:MM:SS" string
        total_seconds = int(data.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    if isinstance(data, (date, datetime)):
        return data.isoformat()
    return data
