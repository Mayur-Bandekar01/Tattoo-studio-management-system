import sys, re

with open('e:/TatooStudioProject/frontend/templates/customer/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Modify body tag to include customer name
content = content.replace('<body>', '<body data-customer-name="{{ name }}">')

# Extract all scripts
scripts = []
def script_repl(match):
    scripts.append(match.group(1))
    return ''

content = re.sub(r'<script>(.*?)</script>', script_repl, content, flags=re.DOTALL)

# Write to customer_dashboard.js (we'll just rewrite it entirely because the extracted scripts have what we need, but we need to adjust TAB_META)
combined_script = "\n".join(scripts)

# Adjust TAB_META to use data attribute
combined_script = combined_script.replace('{{ name }}', "' + (document.body.getAttribute('data-customer-name') || 'Guest') + '")

with open('e:/TatooStudioProject/frontend/static/js/customer_dashboard.js', 'w', encoding='utf-8') as f:
    f.write(combined_script)

# Save dashboard.html
with open('e:/TatooStudioProject/frontend/templates/customer/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
