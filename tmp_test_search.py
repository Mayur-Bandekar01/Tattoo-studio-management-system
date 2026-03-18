import sys
from pathlib import Path
sys.path.append(str(Path("e:/TatooStudioProject/.agent/.shared/ui-ux-pro-max/scripts")))
from core import search

print("Starting search...")
try:
    res = search("tattoo")
    print(f"Found {res.get('count', 0)} results")
    if res['count'] > 0:
        print(f"Top result: {res['results'][0].get('Style Category', 'No Category')}")
except Exception as e:
    print(f"Error: {e}")
