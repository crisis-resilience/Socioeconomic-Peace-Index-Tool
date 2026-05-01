"""
Merge normalized sub-indicator scores from SOM_SSD_KEN_SUB_INDICATOR_MASTER.xlsx
into country sepi_with_pillars GeoJSON files.

- Country sheets: Kenya, Somalia, South Sudan
- Label sheet: label_pol (if present) else Sheet4
- Only updates columns that have at least one non-null value in that country's sheet.
- GeoJSON property names match `indicator` (values from `<indicator>_norm` in Excel).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "data" / "SOM_SSD_KEN_SUB_INDICATOR_MASTER.xlsx"

SHEET_BY_FOLDER = {
    "Kenya": "Kenya",
    "Somalia": "Somalia",
    "South_Sudan": "South Sudan",
}

GEOJSON_TARGETS = {
    "Kenya": [
        ROOT / "data" / "Kenya" / "sepi_with_pillars_9_2.geojson",
        ROOT / "data" / "Kenya" / "sepi_with_pillars_Apr_28_Kenya.geojson",
    ],
    "Somalia": [
        ROOT / "data" / "Somalia" / "sepi_with_pillars_9_2.geojson",
        ROOT / "data" / "Somalia" / "sepi_with_pillars_Apr_28_Somalia.geojson",
    ],
    "South_Sudan": [
        ROOT / "data" / "South_Sudan" / "sepi_with_pillars_9_2.geojson",
        ROOT / "data" / "South_Sudan" / "sepi_with_pillars_9_3.geojson",
        ROOT / "data" / "South_Sudan" / "sepi_with_pillars_Apr_28_South_Sudan.geojson",
    ],
}


def read_label_sheet(xl: pd.ExcelFile) -> pd.DataFrame:
    for name in ("label_pol", "Sheet4"):
        if name in xl.sheet_names:
            return pd.read_excel(xl, name)
    raise ValueError("No label sheet found (expected 'label_pol' or 'Sheet4')")


def feature_pcode(props: dict) -> str | None:
    return (
        props.get("ADM1_PCODE")
        or props.get("adm1_pcode")
        or props.get("adm1_pcode_2")
        or props.get("adm1_pcode_3")
    )


def merge_country(folder: str, df_country: pd.DataFrame, indicators: list[str]) -> None:
    colmap = {f"{ind}_norm": ind for ind in indicators}

    lookup: dict[str, dict] = {}
    for _, row in df_country.iterrows():
        pcode = row.get("adm1_pcode")
        if pcode is None or (isinstance(pcode, float) and pd.isna(pcode)):
            continue
        lookup[str(pcode).strip()] = row.to_dict()

    for path in GEOJSON_TARGETS[folder]:
        if not path.exists():
            print(f"  skip missing {path.relative_to(ROOT)}", file=sys.stderr)
            continue

        gj = json.loads(path.read_text(encoding="utf-8"))
        updated = 0
        for feat in gj.get("features", []):
            props = feat.setdefault("properties", {})
            pcode = feature_pcode(props)
            row = lookup.get(str(pcode)) if pcode else None
            if not row:
                for ind in indicators:
                    props.setdefault(ind, None)
                continue
            for src_col, ind in colmap.items():
                if src_col not in row:
                    continue
                v = row.get(src_col)
                if pd.isna(v):
                    props[ind] = None
                else:
                    props[ind] = float(v)
            updated += 1

        path.write_text(json.dumps(gj, ensure_ascii=False), encoding="utf-8")
        print(f"  wrote {path.relative_to(ROOT)} (matched rows: {updated})")


def main() -> None:
    xl = pd.ExcelFile(XLSX)
    labels = read_label_sheet(xl)

    for folder, sheet_name in SHEET_BY_FOLDER.items():
        df = pd.read_excel(xl, sheet_name)

        excel_country_key = SHEET_BY_FOLDER[folder].replace("_", " ")  # noqa: F841
        if folder == "South_Sudan":
            label_country = "South Sudan"
        else:
            label_country = folder

        country_labels = labels[labels["country"] == label_country]
        cand_indicators = country_labels["indicator"].astype(str).tolist()

        use_indicators: list[str] = []
        for ind in cand_indicators:
            col = f"{ind}_norm"
            if col not in df.columns:
                print(f"[{folder}] skip {ind}: column {col} missing", file=sys.stderr)
                continue
            series = pd.to_numeric(df[col], errors="coerce")
            if series.notna().sum() == 0:
                print(f"[{folder}] skip {ind}: all NA", file=sys.stderr)
                continue
            use_indicators.append(ind)

        print(f"{folder}: merging {len(use_indicators)} indicators")
        merge_country(folder, df, use_indicators)


if __name__ == "__main__":
    main()
