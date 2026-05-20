"""
Scale conflict per-1k fields to per-100k (multiply by 100) in CSV and GeoJSON files.

Run from repo root:
  python scripts/scale_conflict_per_100k.py
"""

from __future__ import annotations

import csv
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MULTIPLIER = 100

CSV_FILES = [
    ROOT / "data" / "conflict_kenya.csv",
    ROOT / "data" / "conflict_somalia.csv",
    ROOT / "data" / "conflict_SSD.csv",
]


def is_per_1k_key(key: str) -> bool:
    return "per_1k" in key


def scale_numeric(value):
    if value is None or value == "":
        return value
    try:
        num = float(value)
    except (TypeError, ValueError):
        return value
    if not math.isfinite(num):
        return value
    return num * MULTIPLIER


def update_csv(path: Path) -> int:
    with path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        rows = list(reader)

    changed = 0
    for row in rows:
        for key in fieldnames:
            if not is_per_1k_key(key):
                continue
            old = row.get(key)
            new = scale_numeric(old)
            if new != old and new is not None:
                row[key] = new
                changed += 1

    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    return changed


def update_geojson(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("type") != "FeatureCollection":
        return 0

    changed = 0
    for feat in data.get("features") or []:
        props = feat.get("properties")
        if not props:
            continue
        for key in list(props.keys()):
            if not is_per_1k_key(key):
                continue
            old = props[key]
            new = scale_numeric(old)
            if new != old and new is not None:
                props[key] = new
                changed += 1

    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return changed


def main() -> None:
    total_csv = 0
    for csv_path in CSV_FILES:
        if not csv_path.exists():
            print(f"Skip missing CSV: {csv_path}")
            continue
        n = update_csv(csv_path)
        total_csv += n
        print(f"CSV {csv_path.name}: {n} cell(s) updated")

    total_geo = 0
    geo_paths = sorted(ROOT.glob("data/**/*.geojson"))
    for geo_path in geo_paths:
        try:
            sample = json.loads(geo_path.read_text(encoding="utf-8"))
            props = (sample.get("features") or [{}])[0].get("properties") or {}
            if not any(is_per_1k_key(k) for k in props):
                continue
        except (json.JSONDecodeError, OSError, IndexError):
            continue

        n = update_geojson(geo_path)
        if n:
            total_geo += n
            print(f"GeoJSON {geo_path.relative_to(ROOT)}: {n} value(s) updated")

    print(f"Done. CSV cells: {total_csv}, GeoJSON values: {total_geo}")


if __name__ == "__main__":
    main()
