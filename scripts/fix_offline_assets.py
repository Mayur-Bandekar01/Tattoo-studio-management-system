import os
import urllib.request
import ssl

# Bypass SSL
ssl._create_default_https_context = ssl._create_unverified_context

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, 'frontend', 'static')

# We'll use a static CSS fallback for Tailwind if the Play CDN fails or isn't enough
ASSETS = {
    'css': [
        ('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', 'font-awesome/css/all.min.css'),
        # Stable Tailwind 2.2.19 as a fallback CSS (v3 doesn't have a single-file minified CSS)
        ('https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css', 'css/tailwind_fallback.min.css'),
    ],
    'js': [
        ('https://cdn.tailwindcss.com', 'js/tailwind.js'),
        ('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', 'js/chart.min.js'),
    ],
    'fonts': [
        ('https://fonts.gstatic.com/s/cinzel/v19/8vLecRE6zO22O9T-0A_vO7GZ.woff2', 'fonts/Cinzel-Bold.woff2'),
        ('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.woff2', 'fonts/Inter-Regular.woff2'),
        ('https://fonts.gstatic.com/s/outfit/v11/Q_QS9S_J97257j0ee8p1_.woff2', 'fonts/Outfit-Regular.woff2'),
    ],
    'webfonts': [
        'fa-brands-400.woff2', 'fa-regular-400.woff2', 'fa-solid-900.woff2'
    ]
}

def download(url, path):
    dest = os.path.join(STATIC_DIR, path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print(f"Downloading {url}...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as f:
            f.write(response.read())
        print(f"DONE: {path}")
    except Exception as e:
        print(f"FAILED {path}: {e}")

def run():
    for url, path in ASSETS['css']: download(url, path)
    for url, path in ASSETS['js']: download(url, path)
    for url, path in ASSETS['fonts']: download(url, path)
    
    fa_url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/"
    for wf in ASSETS['webfonts']:
        download(fa_url + wf, "font-awesome/webfonts/" + wf)

if __name__ == "__main__":
    run()
