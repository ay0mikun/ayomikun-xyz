"""Validate local page links, stylesheet assets and module imports without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit, urljoin
import re

ROOT = Path(__file__).resolve().parents[1]
errors = []

def check(source, reference):
    if not reference or '${' in reference:
        return
    url = urlsplit(reference)
    if url.scheme or url.netloc or not url.path:
        return
    mounted_source = 'https://example.com/ayomikun-xyz/' + source.relative_to(ROOT).as_posix()
    if not urljoin(mounted_source, reference).startswith('https://example.com/ayomikun-xyz/'):
        errors.append(f'{source.relative_to(ROOT)}: path escapes GitHub Pages subdirectory: {reference}')
    target = ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else source.parent / unquote(url.path)
    target = target.resolve()
    if not target.exists():
        errors.append(f'{source.relative_to(ROOT)}: missing {reference}')

class PageLinks(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        for name in ('src', 'href'):
            check(self.source, attrs.get(name))
        for candidate in attrs.get('srcset', '').split(','):
            if candidate.strip():
                check(self.source, candidate.strip().split()[0])
        if tag == 'a' and attrs.get('href') and not urlsplit(attrs['href']).scheme and not urlsplit(attrs['href']).netloc and attrs.get('target') == '_blank':
            errors.append(f'{self.source.relative_to(ROOT)}: internal navigation opens a new tab')

for source in [ROOT / 'index.html', ROOT / 'trepa-case-study/index.html']:
    PageLinks(source).feed(source.read_text())
for source in (ROOT / 'assets/css').rglob('*.css'):
    for reference in re.findall(r'url\([\'"]?([^\)\'"\s]+)', source.read_text()):
        check(source, reference)
for source in (ROOT / 'assets/js').rglob('*.js'):
    content = source.read_text()
    for reference in re.findall(r'import\s+[\'"]([^\'"]+)', content):
        check(source, reference)
    for reference in re.findall(r'new URL\([\'"]([^\'"]+)', content):
        # Footer asset URLs resolve from its explicit site root, not its module directory.
        if reference.startswith('assets/'):
            check(ROOT / 'index.html', reference)
        else:
            check(source, reference)
if errors:
    raise SystemExit('\n'.join(errors))
print('Both pages, CSS asset references, module imports and same-tab internal links passed.')
