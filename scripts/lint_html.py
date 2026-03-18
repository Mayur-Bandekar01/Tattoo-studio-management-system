from html.parser import HTMLParser
import collections

class Linter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
        self.ids = collections.Counter()
        
    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        
        if 'id' in attr_dict:
            self.ids[attr_dict['id']] += 1
            if self.ids[attr_dict['id']] == 2:
                self.errors.append(f"Duplicate ID: {attr_dict['id']}")
                
        if tag == 'img' and 'alt' not in attr_dict:
            self.errors.append(f"Missing alt text on img: {attr_dict.get('src', 'no-src')}")
            
        if tag == 'a' and 'href' not in attr_dict:
            self.errors.append("Anchor tag missing href")

linter = Linter()
try:
    with open('templates/owner/dashboard.html', encoding='utf-8') as f:
        linter.feed(f.read())
        
    with open('out.txt', 'w', encoding='utf-8') as f:
        f.write("Errors found:\n")
        for e in linter.errors:
            f.write(f"- {e}\n")
        f.write(f"Total errors: {len(linter.errors)}\n")
except Exception as e:
    with open('out.txt', 'w', encoding='utf-8') as f:
        f.write(str(e))
