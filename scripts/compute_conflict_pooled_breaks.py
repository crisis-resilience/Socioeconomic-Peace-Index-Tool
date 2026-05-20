"""
Build pooled conflict color scales (2nd–98th percentiles on transform space).

Sources match live pillar layers: Apr_28 GeoJSON per supported country.

Run from repo root:
  python scripts/compute_conflict_pooled_breaks.py
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "conflict_pooled_breaks.json"

# Same files as js getCountryPath() when loading sepi_with_pillars_9_2.geojson.
GEOJSONS = [
    ROOT / "data" / "Kenya" / "sepi_with_pillars_May_04_Kenya.geojson",
    ROOT / "data" / "Somalia" / "sepi_with_pillars_May_04_Somalia.geojson",
    ROOT / "data" / "South_Sudan" / "sepi_with_pillars_May_04_South_Sudan.geojson",
]

Q_LOW = 0.02
Q_HIGH = 0.98

RE_EVENTS_YEAR = re.compile(r"^count_conflict_events_(\d{4})$")
RE_FATAL_YEAR = re.compile(r"^total_fatalities_(\d{4})$")
RE_EV_PER1K_YEAR = re.compile(r"^count_conflicts_events_per_1k_(\d{4})$")
RE_FAT_PER1K_YEAR = re.compile(r"^total_fatalities_per_1k_(\d{4})$")


def as_float(x) -> float | None:
    if x is None or x == "":
        return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(v):
        return None
    return v


def quantile_sorted(sorted_vals: list[float], q: float) -> float:
    if not sorted_vals:
        return 0.0
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    pos = q * (len(sorted_vals) - 1)
    base = int(math.floor(pos))
    rest = pos - base
    a = sorted_vals[base]
    b = sorted_vals[base + 1] if base + 1 < len(sorted_vals) else a
    return a + rest * (b - a)


def collect_events(props: dict) -> list[float]:
    out: list[float] = []
    for k, raw in props.items():
        m = RE_EVENTS_YEAR.match(k)
        if m:
            v = as_float(raw)
            if v is not None and v >= 0:
                out.append(v)
    if out:
        return out
    for k in ("ACLED_count_conflict_events", "count_conflict_events"):
        v = as_float(props.get(k))
        if v is not None and v >= 0:
            out.append(v)
    return out


def collect_fatalities(props: dict) -> list[float]:
    out: list[float] = []
    for k, raw in props.items():
        if RE_FATAL_YEAR.match(k):
            v = as_float(raw)
            if v is not None and v >= 0:
                out.append(v)
    if out:
        return out
    v = as_float(props.get("total_fatalities"))
    if v is not None and v >= 0:
        out.append(v)
    return out


def collect_ev_per_1k(props: dict) -> list[float]:
    out: list[float] = []
    for k, raw in props.items():
        if RE_EV_PER1K_YEAR.match(k):
            v = as_float(raw)
            if v is not None and v >= 0:
                out.append(v)
    if out:
        return out
    for k in ("ACLED_conflict_events_per_1k_pop", "count_conflicts_events_per_1k"):
        v = as_float(props.get(k))
        if v is not None and v >= 0:
            out.append(v)
    return out


def collect_fat_per_1k(props: dict) -> list[float]:
    out: list[float] = []
    for k, raw in props.items():
        if RE_FAT_PER1K_YEAR.match(k):
            v = as_float(raw)
            if v is not None and v >= 0:
                out.append(v)
    if out:
        return out
    for k in ("total_fatalities_per_1k_pop", "total_fatalities_per_1k"):
        v = as_float(props.get(k))
        if v is not None and v >= 0:
            out.append(v)
    return out


COLLECTORS = {
    "conflict_events": collect_events,
    "conflict_fatalities": collect_fatalities,
    "conflict_events_per_1k": collect_ev_per_1k,
    "conflict_fatalities_per_1k": collect_fat_per_1k,
}

USE_LOG1P = {
    "conflict_events": True,
    "conflict_fatalities": True,
    "conflict_events_per_1k": False,
    "conflict_fatalities_per_1k": False,
}


def load_feature_collections() -> list[dict]:
    fcs = []
    for path in GEOJSONS:
        if not path.exists():
            raise FileNotFoundError(f"Missing GeoJSON (expected pillar source): {path}")
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("type") != "FeatureCollection":
            raise ValueError(f"Not a FeatureCollection: {path}")
        fcs.append(data)
    return fcs


def pooled_raw_values(fcs: list[dict], metric_id: str) -> list[float]:
    collector = COLLECTORS[metric_id]
    out: list[float] = []
    for fc in fcs:
        for feat in fc.get("features") or []:
            props = feat.get("properties") or {}
            out.extend(collector(props))
    return out


def build_scale(metric_id: str, fcs: list[dict]) -> dict:
    raw = pooled_raw_values(fcs, metric_id)
    use_log1p = USE_LOG1P[metric_id]
    transformed = [math.log1p(v) if use_log1p else v for v in raw]
    transformed.sort()
    t_low = quantile_sorted(transformed, Q_LOW)
    t_high = quantile_sorted(transformed, Q_HIGH)
    if t_high <= t_low:
        t_high = t_low + 1e-9
    return {
        "quantileLow": Q_LOW,
        "quantileHigh": Q_HIGH,
        "useLog1p": use_log1p,
        "transformLow": t_low,
        "transformHigh": t_high,
        "sampleCount": len(transformed),
    }


def main() -> None:
    fcs = load_feature_collections()
    pillar_scales = {mid: build_scale(mid, fcs) for mid in COLLECTORS}

    payload = {
        "version": 1,
        "quantileAnchors": [Q_LOW, Q_HIGH],
        "sourceGeojsons": [str(p.relative_to(ROOT)).replace("\\", "/") for p in GEOJSONS],
        "pillarScales": pillar_scales,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    for k, v in pillar_scales.items():
        print(f"  {k}: n={v['sampleCount']} log1p={v['useLog1p']} "
              f"transform=[{v['transformLow']:.6g}, {v['transformHigh']:.6g}]")


if __name__ == "__main__":
    main()
