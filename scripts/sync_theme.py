import re
import os

# Updated to use relative path if possible, but keeping absolute for now to ensure consistency with original
base_path = 'e:/TatooStudioProject'

with open(f'{base_path}/static/css/owner_dashboard.css', 'r', encoding='utf-8') as f:
    owner_css = f.read()

light_theme_match = re.search(r'/\*\s*LIGHT THEME.*?$', owner_css, re.DOTALL)

if light_theme_match:
    with open(f'{base_path}/static/css/customer_dashboard.css', 'a', encoding='utf-8') as f:
        f.write('\n\n' + light_theme_match.group(0))
    print("Light theme appended to customer_dashboard.css")
else:
    print("Could not find LIGHT THEME block in owner_dashboard.css")
