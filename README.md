# Socioeconomic Peace Index Tool

An interactive web mapping application for exploring the **Socio-Economic Peacebuilding Index (SEPI)** and related conflict indicators across Kenya, Somalia, and South Sudan at the sub-national (Admin-1) level.

SEPI helps researchers, policymakers, and practitioners visualize structural socioeconomic conditions associated with conflict vulnerability, compare regions within a country, and connect analysis to peacebuilding and development planning—especially in fragile contexts.

---

## About SEPI

The **Socio-Economic Peacebuilding Index (SEPI)** is a composite indicator developed by the United Nations Development Programme (UNDP) **Istanbul International Centre for Private Sector in Development (ICPSD)** to measure structural socio-economic conditions linked to conflict vulnerability in the Horn of Africa.

SEPI is grounded in **relative deprivation theory**: the gap between perceived entitlements and actual conditions can create grievances that escalate into collective violence under certain socioeconomic conditions. The index is designed to support development actors, government partners, and donors in identifying where integrated peacebuilding and development investments are most urgently needed.

Scores range from **0 to 1**, where higher values reflect stronger relative structural conditions and lower vulnerability. Scores are **min–max normalized within each country** and are **not comparable across countries**.

The overall SEPI score is a **geometric mean** of five equally weighted pillars. A very low score on any single pillar substantially depresses the composite score—a region cannot compensate for severe deprivation in one dimension with high performance in another.

> **Important:** SEPI is a structural baseline, not a real-time early warning tool. Results should be read alongside contextual knowledge and other data sources.

### The five pillars

| Pillar | What it captures |
|--------|------------------|
| **Education** | School attendance, literacy, school access, teacher presence |
| **Food security** | Share of population in IPC Crisis or Worse (Phase 3+) |
| **Poverty reduction** | Poverty headcount, income/expenditure per capita |
| **Health access** | Healthcare access, health facility density, hospital density |
| **Climate resilience** | Vegetation health (NDVI), soil moisture, drought severity (PDSI), FAPAR |

---

## What this tool provides

- **Interactive choropleth maps** of the Overall Peace Index and each pillar at Admin-1 level
- **Sub-indicator drill-down** — select any indicator under a pillar to map it directly and inspect district values
- **Regional detail panels** — click a region for SEPI score, pillar breakdown, rank, and district overview
- **Conflict overlays (ACLED)** — annual fatalities and events (2016–2025), including per-100k rates; display only, **not part of SEPI computation**
- **Analysis tools** — district rankings, time-series charts, contextual summaries, and exportable country reports
- **Supplementary raster layers** — climate, accessibility, population, and other geospatial context layers by country

Supported countries: **Somalia**, **South Sudan**, and **Kenya**.

---

## How to use the map

1. **Select a country** — use the country buttons in the left panel (Somalia, South Sudan, or Kenya).
2. **Choose a layer** — select *Overall Peace Index* for the composite score, or one of the five pillar indices.
3. **Read the map** — use the legend to interpret region colours by score range (red = deprivation, green = resilience).
4. **Click a region** — open district details with SEPI score, pillar scores, and overview.
5. **Drill into sub-indicators** — select any indicator listed under a pillar to map it and inspect values.

The **Welcome** tab in the analysis panel provides a full in-app guide, including conflict data usage.

For methodology, data sources, FAQs, and indicator definitions, see **[About SEPI](html/more.html)** in the application.

---

## Getting started

This is a static web application (HTML, CSS, JavaScript modules). It must be served over HTTP—opening `index.html` directly from the filesystem will not load GeoJSON and other data correctly.

### Prerequisites

- A modern web browser
- A local HTTP server (Python, Node.js, or any static file server)

### Run locally

From the repository root:

**Python 3**

```bash
python -m http.server 8080
```

**Python 2**

```bash
python -m SimpleHTTPServer 8080
```

**Node.js (npx)**

```bash
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Deploy

Host the repository contents on any static hosting service (e.g. GitHub Pages, Netlify, or an UNDP web server). No build step is required.

---

## Project structure

```
Socioeconomic-Peace-Index-Tool/
├── index.html              # Main map application
├── html/
│   ├── more.html           # About SEPI — methodology, sources, FAQ
│   └── about.html          # About the tool and team
├── js/                     # Application logic (Leaflet map, layers, panels)
├── css/                    # Styles
├── data/                   # GeoJSON, conflict CSV, raster assets by country
│   ├── Kenya/
│   ├── Somalia/
│   └── South_Sudan/
├── assets/                 # Logos and images
└── scripts/                # Python utilities for data preparation
```

Key dependencies (loaded via CDN in `index.html`): [Leaflet](https://leafletjs.com/), [GeoTIFF.js](https://geotiffjs.github.io/), [proj4js](https://github.com/proj4js/proj4js), [html2canvas](https://html2canvas.hertzen.com/), [jsPDF](https://github.com/parallax/jsPDF).

---

## Data sources

| Category | Source | Coverage |
|----------|--------|----------|
| Food security | IPC / HDX HAPI | 2024–2025 |
| Education | National censuses and surveys (Kenya, Somalia, South Sudan) | 2019–2022 |
| Health access | Government of Kenya; WHO health facility database | 2024–2025 |
| Poverty reduction | OPHI; national statistics bureaus; CLiMIS South Sudan | 2022–2024 |
| Accessibility | Heidelberg Institute for Geoinformation Technology | 2025–2026 |
| Climate / environment | Google Earth Engine Data Catalog | 2023–2024 |
| Administrative boundaries | UN OCHA COD | Current official releases |
| Conflict (display only) | [ACLED](https://acleddata.com/) | 2016–2025 |

Conflict data covers Battles, Explosions/Remote Violence, and Violence against Civilians. It is used for validation and contextual visualization, not in SEPI score calculation.

Full source tables and country-specific indicator lists are in **[About SEPI](html/more.html)**.

---

## Development and partners

The Socioeconomic Peace Index Tool was developed by the **UNDP ICPSD Crisis & Resilience Team** in collaboration with the **UNDP SDG AI Lab**, with support from **UNDP Regional Bureau for Africa (RBA)** and in-country partners including national statistical offices.

Partners and contributing units include:

- United Nations Development Programme (UNDP)
- Istanbul International Centre for Private Sector in Development (ICPSD)
- Sustainable Development Goals AI Lab (SDG AI Lab)
- UNDP Regional Bureau for Africa (RBA)
- Bureau for Programme and Policy Support (BPPS)
- National statistical offices and in-country data partners

Learn more about the team and mission on the **[About Us](html/about.html)** page.

---

## Related repositories

- **Methodology and index construction:** [github.com/crisis-resilience/sepi](https://github.com/crisis-resilience/sepi)
- **This repository:** interactive map, dashboards, and visualization code

---

## How to cite

> UNDP ICPSD Crisis Resilience Team. (2025). *Socio-Economic Peacebuilding Index (SEPI)*. Admin-1 level composite indicator for Kenya, Somalia, and South Sudan. United Nations Development Programme. Available at: https://github.com/m-szigeti/Socioeconomic-Peace-Index-Tool

---

## Contact

Questions about the tool, methodology, or data sources:

**[johannes.sahmland.bowling@undp.org](mailto:johannes.sahmland.bowling@undp.org)**

---

## License

Unless otherwise noted, content in this repository is provided by UNDP for public use in research and programming. Third-party libraries retain their respective licenses (see `js/libs/` where vendored).
