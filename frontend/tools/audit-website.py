#!/usr/bin/env python3
"""Check crawlable metadata and local links in a built Delora website."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

root = Path(sys.argv[1] if len(sys.argv) > 1 else 'website-redesign').resolve()
origin = 'https://delora.build'
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.base = path, None
        self.titles, self.descriptions, self.canonicals, self.h1s = [], [], [], 0
        self.urls, self.json_blocks, self.inside_title, self.inside_json = [], [], False, False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'base': self.base = a.get('href')
        if tag == 'title': self.inside_title = True; self.titles.append('')
        if tag == 'h1': self.h1s += 1
        if tag == 'meta' and a.get('name', '').lower() == 'description': self.descriptions.append(a.get('content', ''))
        if tag == 'meta' and a.get('name', '').lower() == 'robots' and 'noindex' in a.get('content', '').lower(): errors.append(f'{self.path}: noindex')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonicals.append(a.get('href', ''))
        if tag == 'script' and a.get('type') == 'application/ld+json': self.inside_json = True; self.json_blocks.append('')
        if tag in ('a', 'link', 'script', 'img'):
            value = a.get('href') if tag in ('a', 'link') else a.get('src')
            if value: self.urls.append(value)
    def handle_data(self, text):
        if self.inside_title: self.titles[-1] += text
        if self.inside_json: self.json_blocks[-1] += text
    def handle_endtag(self, tag):
        if tag == 'title': self.inside_title = False
        if tag == 'script': self.inside_json = False

sitemap = ElementTree.parse(root / 'sitemap.xml')
urls = [x.text for x in sitemap.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if len(urls) != len(set(urls)): errors.append('Duplicate URLs in sitemap')
agent_index = root / 'llms.txt'
if not agent_index.is_file():
    errors.append('Missing llms.txt')
else:
    for link in re.findall(r'\]\((https://delora\.build/[^)]+)\)', agent_index.read_text(encoding='utf-8')):
        if link not in urls:
            errors.append(f'llms.txt: link is not a canonical sitemap URL: {link}')
titles = set()
for url in urls:
    if not url or not url.startswith(origin + '/'): errors.append(f'Invalid sitemap URL: {url}'); continue
    route = urlsplit(url).path
    path = root / route.lstrip('/') / 'index.html'
    if not path.is_file(): errors.append(f'Missing page: {route}'); continue
    p = Page(path.relative_to(root)); p.feed(path.read_text(encoding='utf-8'))
    if len(p.titles) != 1 or not p.titles[0].strip(): errors.append(f'{route}: title')
    elif p.titles[0] in titles: errors.append(f'{route}: duplicate title')
    else: titles.add(p.titles[0])
    if len(p.descriptions) != 1 or not p.descriptions[0].strip(): errors.append(f'{route}: description')
    if p.canonicals != [url]: errors.append(f'{route}: canonical {p.canonicals}')
    if p.h1s != 1: errors.append(f'{route}: expected one h1, found {p.h1s}')
    for block in p.json_blocks:
        try: json.loads(block)
        except ValueError: errors.append(f'{route}: invalid structured data')
    for value in p.urls:
        link = urlsplit(value)
        if link.scheme or link.netloc or not link.path: continue
        destination = (root / link.path.lstrip('/')) if link.path.startswith('/') or p.base == '/' else path.parent / link.path
        if not destination.exists(): errors.append(f'{route}: missing {value}')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'OK: {len(urls)} sitemap pages, metadata, structured data and local links')
