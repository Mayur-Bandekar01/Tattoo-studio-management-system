import base64
import os
import re

def embed_fonts(css_path, output_path):
    if not os.path.exists(css_path):
        print(f"File not found: {css_path}")
        return

    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()

    css_dir = os.path.dirname(css_path)

    def replacer(match):
        rel_path = match.group(1).strip("'\"")
        abs_path = os.path.normpath(os.path.join(css_dir, rel_path))
        
        if os.path.exists(abs_path):
            ext = os.path.splitext(abs_path)[1].lower()
            mime_type = "font/woff2" if ext == ".woff2" else "font/ttf" if ext == ".ttf" else "application/font-woff"
            
            with open(abs_path, 'rb') as font_file:
                b64_data = base64.b64encode(font_file.read()).decode('utf-8')
                return f"url('data:{mime_type};base64,{b64_data}')"
        else:
            print(f"Font file not found: {abs_path}")
            return match.group(0)

    # Replace url(...) with base64 version
    new_content = re.sub(r'url\((.*?)\)', replacer, content)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Embedded fonts into: {output_path}")

# Target paths
font_awesome_css = r'e:\TatooStudioProject\frontend\static\font-awesome\css\all.min.css'
fonts_css = r'e:\TatooStudioProject\frontend\static\css\core\fonts.css'

# Output paths
embedded_fa = r'e:\TatooStudioProject\frontend\static\css\core\font-awesome-embedded.css'
embedded_fonts = r'e:\TatooStudioProject\frontend\static\css\core\fonts-embedded.css'

embed_fonts(font_awesome_css, embedded_fa)
embed_fonts(fonts_css, embedded_fonts)
