#!/usr/bin/env python3
from __future__ import annotations
import os, json, re, sys, hashlib, html
from datetime import datetime, timezone
from typing import Any, Dict, List
import feedparser, yaml, requests
from bs4 import BeautifulSoup
from dateutil import parser as dateparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
SOURCES_YML = os.path.join(DATA_DIR, "sources.yml")
OUTPUT_JSON = os.path.join(DATA_DIR, "feeds.json")

GET_IMAGES = os.getenv("GET_IMAGES", "true").lower() == "true"
MAX_PER_FEED = int(os.getenv("MAX_PER_FEED", "20"))
MAX_TOTAL = int(os.getenv("MAX_TOTAL", "120"))
HTTP_TIMEOUT = 7

def iso_utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

def parse_time(entry: Dict[str, Any]) -> datetime:
    for key in ("published", "updated"):
        val = entry.get(key) or entry.get(f"{key}_parsed")
        if val:
            try:
                if isinstance(val, str): return dateparse.parse(val)
                from datetime import datetime as _dt
                return _dt(*val[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return datetime.now(timezone.utc)

def clean_text(s: str | None) -> str | None:
    if not s: return None
    soup = BeautifulSoup(s, "lxml")
    s = soup.get_text(" ", strip=True)
    return html.unescape(re.sub(r"\s+", " ", s)).strip()

def first_image_from_entry(e: Dict[str, Any]) -> str | None:
    media_thumb = e.get("media_thumbnail") or e.get("media_content")
    if isinstance(media_thumb, list) and media_thumb:
        for m in media_thumb:
            url = m.get("url")
            if url: return url
    if "links" in e:
        for link in e["links"]:
            if link.get("rel") == "enclosure" and link.get("type", "").startswith("image/"):
                return link.get("href")
    return None

def og_image_from_page(url: str) -> str | None:
    try:
        r = requests.get(url, timeout=HTTP_TIMEOUT, headers={"User-Agent":"Mozilla/5.0 TNL/feeds"})
        if r.status_code != 200 or not r.text: return None
        soup = BeautifulSoup(r.text, "lxml")
        for prop in ("og:image", "twitter:image", "og:image:url"):
            tag = soup.find("meta", property=prop) or soup.find("meta", attrs={"name":prop})
            if tag and tag.get("content"): return tag["content"].strip()
        first_img = soup.find("img", src=True)
        if first_img: return first_img["src"]
    except Exception:
        return None
    return None

def make_id(source: str, url: str) -> str:
    return f"{source}-{hashlib.sha1(url.encode('utf-8')).hexdigest()[:10]}"

def load_sources() -> List[Dict[str, Any]]:
    with open(SOURCES_YML, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    return data.get("feeds", [])

def build_items() -> List[Dict[str, Any]]:
    feeds = load_sources()
    items: List[Dict[str, Any]] = []
    seen_urls = set()

    for rec in feeds:
        feed_url = rec.get("url")
        source_name = rec.get("source") or rec.get("title") or feed_url
        limit = rec.get("limit", MAX_PER_FEED)
        if not feed_url: continue

        parsed = feedparser.parse(feed_url)
        entries = parsed.entries[:limit] if getattr(parsed, "entries", None) else []

        for e in entries:
            url = e.get("link") or e.get("id") or ""
            if not url or url in seen_urls: continue
            seen_urls.add(url)

            published_dt = parse_time(e)
            title = clean_text(e.get("title")) or "(untitled)"
            summary = clean_text(e.get("summary")) or clean_text(e.get("subtitle")) or None

            image_url = first_image_from_entry(e)
            if not image_url and GET_IMAGES:
                image_url = og_image_from_page(url)

            items.append({
                "id": make_id(source_name, url),
                "source": source_name,
                "title": title,
                "summary": summary,
                "url": url,
                "published": iso_utc(published_dt),
                "image_url": image_url,
                "thumb_url": None,
                "category": rec.get("category") or None,
                "cluster_id": None
            })

    items.sort(key=lambda x: x["published"], reverse=True)
    return items[:MAX_TOTAL]

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    items = build_items()
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(items)} items → {OUTPUT_JSON}")

if __name__ == "__main__":
    sys.exit(main())
