import os
import urllib.request
import ssl
import socket

# Bypass SSL verification
ssl._create_default_https_context = ssl._create_unverified_context
socket.setdefaulttimeout(30) # 30 second timeout

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, 'frontend', 'static')

ASSETS = {
    'css': [
        ('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', 'font-awesome/css/all.min.css'),
    ],
    'js': [
        ('https://cdn.tailwindcss.com', 'js/tailwind.js'),
        ('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', 'js/chart.min.js'),
    ],
    'fonts': [
        ('https://fonts.gstatic.com/s/cinzel/v19/8vLecRE6zO22O9T-0A_vO7GZ.woff2', 'fonts/Cinzel-Bold.woff2'),
        ('https://fonts.gstatic.com/s/cinzel/v19/8vLecRE6zO22O9T-0A_vO7I.woff2', 'fonts/Cinzel-Regular.woff2'),
        ('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.woff2', 'fonts/Inter-Regular.woff2'),
        ('https://fonts.gstatic.com/s/outfit/v11/Q_QS9S_J97257j0ee8p1_.woff2', 'fonts/Outfit-Regular.woff2'),
    ],
    'webfonts': [
        'fa-brands-400.woff2', 'fa-brands-400.ttf',
        'fa-regular-400.woff2', 'fa-regular-400.ttf',
        'fa-solid-900.woff2', 'fa-solid-900.ttf',
        'fa-v4compatibility.woff2', 'fa-v4compatibility.ttf'
    ]
}

FA_BASE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/'


def setup():
    print("Starting Offline Asset Setup...")
    print(f"Base Directory: {BASE_DIR}")
    
    # 1. Download CSS
    for url, path in ASSETS['css']:
        dest = os.path.join(STATIC_DIR, path)
        download_file(url, dest)

    # 2. Download JS
    for url, path in ASSETS['js']:
        dest = os.path.join(STATIC_DIR, path)
        download_file(url, dest)

    # 3. Download Google Fonts
    for url, path in ASSETS['fonts']:
        dest = os.path.join(STATIC_DIR, path)
        download_file(url, dest)

    # 4. Download Font Awesome Webfonts
    for font_file in ASSETS['webfonts']:
        url = FA_BASE_URL + font_file
        dest = os.path.join(STATIC_DIR, 'font-awesome', 'webfonts', font_file)
        download_file(url, dest)

    print("\n" + "="*40)
    print("OFFLINE SETUP COMPLETE!")
    print("="*40)
    print("The following assets are now local:")
    print(" - Tailwind CSS (Play CDN)")
    print(" - Font Awesome 6.0.0 (CSS & Webfont binaries)")
    print(" - Google Fonts (Cinzel, Inter, Outfit .woff2 files)")
    print(" - Chart.js")
    print("\nNext steps:")
    print("1. Ensure you have run this script while connected to the internet.")
    print("2. Test the application by disabling your internet connection.")
    print("3. Check the console for any 404 errors.")

if __name__ == '__main__':
    setup()
