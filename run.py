# run.py
# Root-level starter for the Tattoo Studio app.
import sys
import os

# Add backend directory to path so imports work correctly
sys.path.append(os.path.abspath("backend"))

from app import app

if __name__ == "__main__":
    app.run(debug=True)
