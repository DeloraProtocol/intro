#!/usr/bin/env python3
"""Local-only static preview that serves a branded page on HTML 404 responses."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse

ROOT = Path(__file__).resolve().parent.parent / 'website-redesign'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_error(self, code, message=None, explain=None):
        path = urlsplit(self.path).path
        accept = self.headers.get('Accept', '')
        is_document = 'text/html' in accept and Path(path).suffix.lower() in ('', '.html', '.htm')
        if code != 404 or not is_document:
            return super().send_error(code, message, explain)
        body = (ROOT / '404.html').read_bytes()
        self.send_response(404, 'Not Found')
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8772)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Preview: http://127.0.0.1:{server.server_port}/missing-page', flush=True)
    server.serve_forever()
