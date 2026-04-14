#!/usr/bin/env python3
"""정적 파일 제공 + Yahoo Finance v8 API 프록시 (CORS 우회)."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import HTTPServer, SimpleHTTPRequestHandler

DIR = os.path.dirname(os.path.abspath(__file__))
UA = "Mozilla/5.0 (compatible; StockApp/1.0)"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, format, *args):
        if not self.path.startswith("/api/"):
            super().log_message(format, *args)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/quote":
            qs = urllib.parse.parse_qs(parsed.query)
            sym = (qs.get("symbol") or [""])[0].strip()
            if not sym:
                self._json({"error": "symbol required"}, 400)
                return
            self._handle_quote(sym)
            return
        if parsed.path == "/api/history":
            qs = urllib.parse.parse_qs(parsed.query)
            sym = (qs.get("symbol") or [""])[0].strip()
            range_ = (qs.get("range") or ["1mo"])[0]
            interval = (qs.get("interval") or ["1d"])[0]
            if not sym:
                self._json({"error": "symbol required"}, 400)
                return
            self._handle_history(sym, range_, interval)
            return
        return super().do_GET()

    def _fetch_yahoo(self, symbol: str, interval: str, range_: str) -> dict:
        q = urllib.parse.urlencode({"interval": interval, "range": range_})
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?{q}"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def _handle_quote(self, symbol: str) -> None:
        try:
            data = self._fetch_yahoo(symbol, "1d", "5d")
        except urllib.error.HTTPError as e:
            self._json({"error": f"HTTP {e.code}"}, 502)
            return
        except Exception as e:
            self._json({"error": str(e)}, 502)
            return

        result = (data.get("chart") or {}).get("result") or []
        if not result:
            err = (data.get("chart") or {}).get("error") or {}
            self._json({"error": err.get("description") or "데이터 없음"}, 404)
            return

        r = result[0]
        meta = r.get("meta") or {}
        price = meta.get("regularMarketPrice")
        if price is None:
            price = meta.get("previousClose")
        prev = meta.get("previousClose") or meta.get("chartPreviousClose")
        change = None
        change_pct = None
        if price is not None and prev:
            change = round(price - prev, 4)
            change_pct = round((change / prev) * 100, 4) if prev else None

        self._json(
            {
                "symbol": meta.get("symbol", symbol),
                "name": meta.get("longName") or meta.get("shortName") or symbol,
                "price": price,
                "change": change,
                "changePct": change_pct,
                "currency": meta.get("currency", ""),
            }
        )

    def _handle_history(self, symbol: str, range_: str, interval: str) -> None:
        try:
            data = self._fetch_yahoo(symbol, interval, range_)
        except Exception as e:
            self._json({"error": str(e)}, 502)
            return

        result = (data.get("chart") or {}).get("result") or []
        if not result:
            self._json({"error": "데이터 없음"}, 404)
            return

        r = result[0]
        ts = r.get("timestamp") or []
        quotes = ((r.get("indicators") or {}).get("quote") or [{}])[0]
        closes = quotes.get("close") or []
        pairs = []
        for i, t in enumerate(ts):
            if i < len(closes) and closes[i] is not None:
                pairs.append({"t": t, "c": closes[i]})
        self._json({"symbol": symbol, "points": pairs})

    def _json(self, obj: dict, status: int = 200) -> None:
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8765"))
    httpd = HTTPServer(("", port), Handler)
    print(f"http://127.0.0.1:{port} — 종료: Ctrl+C")
    httpd.serve_forever()
