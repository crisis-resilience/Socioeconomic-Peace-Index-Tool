/**
 * Country SEPI / Conflict report builder for Analysis → Report Results.
 * SEPI report: country report docx. Conflict report: conflict PDF UI + Conflict Context.docx when conflict layer active.
 */

import { getSepiDistrictGeoJSONPathForAdm1Labels, PILLAR_CONFIG } from './layer_config.js';
import { getCountryDisplayLabel, getConflictContextContent } from './conflict_context_content.js';
import { getCountryReportNarrative } from './country_report_narrative.js';

const CONFLICT_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const DEFAULT_CONFLICT_YEAR = 2025;

const TABLE_PILLARS = [
    { key: 'pillar_education', label: 'Education' },
    { key: 'pillar_health', label: 'Health Access' },
    { key: 'pillar_food_security', label: 'Food Security' },
    { key: 'pillar_economic', label: 'Poverty Reduction' },
    { key: 'pillar_climate', label: 'Climate' }
];

const SEPI_VALUE_KEYS = ['sepi', 'peacebuilding_index', 'index', 'peace_index'];

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function parseRankingValue(raw) {
    if (raw == null || raw === '') return null;
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : null;
}

function getDistrictName(properties) {
    const p = properties || {};
    return (
        p.ADM1_EN ||
        p.adm1_name ||
        p.NAME_1 ||
        p.admin1_name ||
        p.region ||
        p.district ||
        'Unknown District'
    );
}

function detectSepiKey(properties) {
    for (const key of SEPI_VALUE_KEYS) {
        if (properties[key] != null && properties[key] !== '') return key;
    }
    return 'sepi';
}

function getConflictValue(properties, pillarId, year) {
    const config = PILLAR_CONFIG[pillarId];
    if (!config) return null;
    const candidates = [];
    if (year) candidates.push(`${config.property}_${year}`);
    if (config.fallbackProperty) candidates.push(config.fallbackProperty);
    candidates.push(config.property);
    for (const key of candidates) {
        if (!key) continue;
        if (properties[key] != null && properties[key] !== '') {
            const v = parseRankingValue(properties[key]);
            if (v != null) return v;
        }
    }
    return null;
}

function getConflictPer100k(properties, year = DEFAULT_CONFLICT_YEAR) {
    const keys = [
        `count_conflicts_events_per_1k_${year}`,
        'ACLED_conflict_events_per_1k_pop',
        'count_conflicts_events_per_1k'
    ];
    for (const key of keys) {
        const v = parseRankingValue(properties[key]);
        if (v != null) return v;
    }
    return null;
}

function formatScore(value) {
    if (value == null) return 'N/A';
    const n = Number(value);
    if (!Number.isFinite(n)) return 'N/A';
    return n.toFixed(3);
}

function formatConflictMetric(value, perCapita = false) {
    if (value == null) return '—';
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    if (perCapita) return n.toFixed(3);
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function collectAllRegionRows(geojson) {
    const sepiKey = geojson.features?.[0]?.properties
        ? detectSepiKey(geojson.features[0].properties)
        : 'sepi';

    const rows = [];
    for (const feature of geojson.features || []) {
        const props = feature.properties || {};
        const sepi = parseRankingValue(props[sepiKey]);
        if (sepi == null) continue;
        const name = getDistrictName(props);
        if (String(name).trim().toLowerCase() === 'unknown district') continue;

        const pillars = {};
        TABLE_PILLARS.forEach(({ key }) => {
            pillars[key] = parseRankingValue(props[key]);
        });

        rows.push({
            name,
            sepi,
            pillars,
            conflictPer100k: getConflictPer100k(props),
            properties: props
        });
    }

    rows.sort((a, b) => b.sepi - a.sepi);
    rows.forEach((row, idx) => {
        row.rank = idx + 1;
    });
    return rows;
}

function collectConflictRanking(geojson, pillarId, year) {
    const rows = [];
    const perCapita = pillarId?.includes('_per_1k');
    for (const feature of geojson.features || []) {
        const props = feature.properties || {};
        const value = getConflictValue(props, pillarId, year);
        if (value == null || value <= 0) continue;
        const sepiKey = detectSepiKey(props);
        rows.push({
            name: getDistrictName(props),
            value,
            sepi: parseRankingValue(props[sepiKey])
        });
    }
    rows.sort((a, b) => b.value - a.value);
    return rows;
}

function collectSepiConflictData(geojson) {
    const sepiKey = geojson.features?.[0]?.properties
        ? detectSepiKey(geojson.features[0].properties)
        : 'sepi';
    const data = [];
    for (const feature of geojson.features || []) {
        const p = feature.properties || {};
        const name = getDistrictName(p);
        if (!name || name === 'Unknown District') continue;
        const sepi = parseRankingValue(p[sepiKey]);
        if (sepi == null) continue;
        const conflictVals = CONFLICT_YEARS
            .map(y => parseRankingValue(p[`count_conflicts_events_per_1k_${y}`]))
            .filter(v => v != null);
        if (conflictVals.length === 0) continue;
        const avgConflict = conflictVals.reduce((a, b) => a + b, 0) / conflictVals.length;
        data.push({ name, sepi, avgConflictPer100k: avgConflict });
    }
    return data;
}

function aggregateConflictSeries(geojson) {
    const events = {};
    const fatalities = {};
    CONFLICT_YEARS.forEach((y) => {
        events[y] = 0;
        fatalities[y] = 0;
    });

    for (const feature of geojson.features || []) {
        const props = feature.properties || {};
        CONFLICT_YEARS.forEach((year) => {
            const ev = parseRankingValue(props[`count_conflict_events_${year}`]);
            const fat = parseRankingValue(props[`total_fatalities_${year}`]);
            if (ev != null) events[year] += ev;
            if (fat != null) fatalities[year] += fat;
        });
    }

    return {
        years: CONFLICT_YEARS,
        events: CONFLICT_YEARS.map((y) => events[y]),
        fatalities: CONFLICT_YEARS.map((y) => fatalities[y])
    };
}

function renderRegionTableHtml(rows, { bottom = false } = {}) {
    const sorted = [...rows].sort((a, b) => (bottom ? a.sepi - b.sepi : b.sepi - a.sepi));
    const slice = sorted.slice(0, 5);
    if (!slice.length) {
        return '<p class="report-muted">No district scores available.</p>';
    }

    const head = `
        <thead>
            <tr>
                <th>#</th>
                <th>Region</th>
                <th>SEPI</th>
                ${TABLE_PILLARS.map((p) => `<th>${escapeHtml(p.label)}</th>`).join('')}
                <th>Events /100k (${DEFAULT_CONFLICT_YEAR})</th>
            </tr>
        </thead>`;

    const body = slice
        .map(
            (row) => `
            <tr>
                <td>${row.rank}</td>
                <td>${escapeHtml(row.name)}</td>
                <td>${formatScore(row.sepi)}</td>
                ${TABLE_PILLARS.map((p) => `<td>${formatScore(row.pillars[p.key])}</td>`).join('')}
                <td>${row.conflictPer100k != null ? formatScore(row.conflictPer100k) : '—'}</td>
            </tr>`
        )
        .join('');

    return `
        <div class="data-table-container report-region-table cr-ranking-table">
            <table class="data-table">
                ${head}
                <tbody>${body}</tbody>
            </table>
        </div>`;
}

function renderActorsHtml(actors, conflictStyle = false) {
    if (!actors?.length) return '';
    if (conflictStyle) {
        return `
            <div class="cr-actors-grid">
                ${actors
                    .map(
                        (a) => `
                    <div class="cr-actor-card">
                        <div class="cr-actor-name">${escapeHtml(a.name)}</div>
                        <p class="cr-actor-desc">${escapeHtml(a.description)}</p>
                    </div>`
                    )
                    .join('')}
            </div>`;
    }
    return `
        <ul class="report-actors-list">
            ${actors
                .map(
                    (a) => `
                <li>
                    <strong>${escapeHtml(a.name)}:</strong>
                    ${escapeHtml(a.description)}
                </li>`
                )
                .join('')}
        </ul>`;
}

function renderParagraphs(paragraphs) {
    if (!paragraphs?.length) return '';
    return paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');
}

function renderCallouts(callouts) {
    if (!callouts?.length) return '';
    return `
        <div class="cr-callout-grid">
            ${callouts
                .map(
                    (c) => `
                <div class="cr-region-callout">
                    <div class="cr-callout-title">${escapeHtml(c.title)}</div>
                    <p>${escapeHtml(c.body)}</p>
                </div>`
                )
                .join('')}
        </div>`;
}

function renderConflictContextSection(ctx) {
    if (!ctx) return '';
    const renderP = (p) => escapeHtml(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const renderBlock = (section) => {
        if (!section?.paragraphs?.length) return '';
        return `
            <div class="cr-context-block">
                ${section.paragraphs
                    .map(
                        (p) => `
                    <div class="cr-intensive-item">
                        <p>${renderP(p)}</p>
                    </div>`
                    )
                    .join('')}
            </div>`;
    };

    return `
        <div class="cr-context-panel">
            <div class="cr-context-panel-header">
                <span class="cr-context-panel-label">ACLED · 2016–2025</span>
                <span class="cr-context-panel-title">Conflict context</span>
            </div>
            ${renderBlock(ctx.profile)}
            ${renderBlock(ctx.trends)}
            ${renderBlock(ctx.intensive)}
        </div>`;
}

function renderPeacebuildingSections(narrative, regionRows, conflictStyle = false) {
    if (!narrative) return '';

    const sectionLabel = (text) =>
        conflictStyle
            ? `<div class="cr-section-banner">${escapeHtml(text)}</div>`
            : `<h6>${escapeHtml(text)}</h6>`;

    const rankingBanner = (text) =>
        conflictStyle ? `<div class="cr-ranking-subtitle">${escapeHtml(text)}</div>` : '';

    return `
        <div class="report-section cr-peacebuilding-block">
            ${sectionLabel('REGIONS WITH STRONG PEACEBUILDING CAPACITY')}
            ${renderCallouts(narrative.strongRegions?.callouts)}
            ${narrative.strongRegions?.intro ? `<p>${escapeHtml(narrative.strongRegions.intro)}</p>` : ''}
            ${rankingBanner('SEPI RANKINGS — STRONG PEACEBUILDING CAPACITY')}
            ${renderRegionTableHtml(regionRows, { bottom: false })}
            ${renderParagraphs(narrative.strongRegions?.paragraphs)}
        </div>

        <div class="report-section cr-peacebuilding-block">
            ${sectionLabel('REGIONS WITH WEAK PEACEBUILDING CAPACITY')}
            ${
                narrative.weakRegions?.tableFirst !== false
                    ? `${rankingBanner('SEPI RANKINGS — WEAK PEACEBUILDING CAPACITY')}${renderRegionTableHtml(regionRows, { bottom: true })}${renderCallouts(narrative.weakRegions?.callouts)}${renderParagraphs(narrative.weakRegions?.paragraphs)}`
                    : `${renderCallouts(narrative.weakRegions?.callouts)}${rankingBanner('SEPI RANKINGS — WEAK PEACEBUILDING CAPACITY')}${renderRegionTableHtml(regionRows, { bottom: true })}${renderParagraphs(narrative.weakRegions?.paragraphs)}`
            }
        </div>

        <div class="report-section cr-peacebuilding-block">
            ${sectionLabel(narrative.resilience?.title || 'SOURCES OF RESILIENCE')}
            <div class="cr-resilience-panel">
                ${renderParagraphs(narrative.resilience?.paragraphs)}
            </div>
        </div>`;
}

function renderNarrativeHtml(narrative, regionRows) {
    if (!narrative) {
        return '<p class="report-muted">Country narrative is not available for this selection.</p>';
    }
    const conflictTitle = narrative.conflictAnalysisTitle
        ? `<div class="report-section"><h6>${escapeHtml(narrative.conflictAnalysisTitle)}</h6></div>`
        : '';
    return `${conflictTitle}${renderPeacebuildingSections(narrative, regionRows, false)}`;
}

function renderConflictMetricTable(rows, metricLabel, year, perCapita) {
    if (!rows.length) {
        return '<p class="report-muted">No districts with values for this metric and year.</p>';
    }
    const slice = rows.slice(0, 12);
    return `
        <div class="data-table-container report-region-table cr-conflict-rank-table">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Region</th>
                        <th>${escapeHtml(metricLabel)} (${year})</th>
                        <th>SEPI</th>
                    </tr>
                </thead>
                <tbody>
                    ${slice
                        .map(
                            (row, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td>${escapeHtml(row.name)}</td>
                            <td>${formatConflictMetric(row.value, perCapita)}</td>
                            <td>${row.sepi != null ? formatScore(row.sepi) : '—'}</td>
                        </tr>`
                        )
                        .join('')}
                </tbody>
            </table>
        </div>`;
}

export function renderConflictReportHTML(report) {
    const {
        countryLabel,
        timestamp,
        narrative,
        regionRows,
        conflictContext,
        conflictSeries,
        conflictLayer,
        conflictRanking,
        districtCount
    } = report;

    const pillarId = conflictLayer?.selectedAttribute || 'conflict_events';
    const year = conflictLayer?.year || DEFAULT_CONFLICT_YEAR;
    const metricName = conflictLayer?.name?.replace(/^Conflict:\s*/i, '') || PILLAR_CONFIG[pillarId]?.name || 'Conflict metric';
    const perCapita = pillarId.includes('_per_1k');

    return `
        <div class="report-container country-report conflict-report">
            <div class="report-header conflict-report-header">
                <h5>${escapeHtml(countryLabel)} Conflict Analysis</h5>
            </div>

            <div class="report-body">
                <div class="report-section cr-charts-section">
                    <div class="cr-section-banner">CONFLICT DATA · NATIONAL TRENDS</div>
                    <p class="report-muted">Totals aggregated from district-level ACLED fields (2016–2025).</p>
                    <div class="report-chart-grid cr-chart-grid">
                        <div class="report-chart-cell">
                            <label>Conflict events by year (national sum)</label>
                            <canvas id="report-conflict-events-chart" width="480" height="220"></canvas>
                        </div>
                        <div class="report-chart-cell">
                            <label>Fatalities by year (national sum)</label>
                            <canvas id="report-conflict-fatalities-chart" width="480" height="220"></canvas>
                        </div>
                    </div>
                </div>

                ${narrative?.mainActors?.length ? `
                <div class="report-section cr-peacebuilding-block">
                    <div class="cr-section-banner">MAIN CONFLICT ACTORS</div>
                    ${renderActorsHtml(narrative.mainActors, true)}
                </div>` : ''}

                ${renderConflictContextSection(conflictContext)}


            </div>
        </div>
    `;
}

function renderSepiReportHTML(report) {
    const { countryLabel, timestamp, narrative, districtCount } = report;
    return `
        <div class="report-container country-report">
            <div class="report-header">
                <h5>${escapeHtml(countryLabel)} Report</h5>
                <button type="button" class="download-btn" onclick="window.infoPanelInstance.downloadReport()">
                    Download PDF
                </button>
            </div>
            <div class="report-body">
                <div class="sepi-conflict-chart-section">
                    <div class="cr-section-banner">SEPI – CONFLICT EVENTS CORRELATION</div>
                    <canvas id="sepi-conflict-scatter" width="480" height="260" style="width:100%; max-width:100%; height:auto; border-radius:4px; display:block;"></canvas>
                </div>
                ${renderNarrativeHtml(narrative, report.regionRows)}
            </div>
        </div>
    `;
}

/**
 * @param {{ country: string, activeLayers: Map<string, object> }} options
 */
export async function buildCountryReport({ country, activeLayers }) {
    const geojsonPath = getSepiDistrictGeoJSONPathForAdm1Labels(country);
    const response = await fetch(geojsonPath);
    if (!response.ok) {
        throw new Error(`Could not load district data for ${getCountryDisplayLabel(country)}`);
    }
    const geojson = await response.json();
    const countryLabel = country.replace(/_/g, ' ');
    geojson.features = geojson.features.filter(
        f => f.properties?.country === countryLabel
    );
    const regionRows = collectAllRegionRows(geojson);
    const narrative = getCountryReportNarrative(country);

    return {
        country,
        countryLabel: getCountryDisplayLabel(country),
        timestamp: new Date().toLocaleString(),
        geojsonPath,
        regionRows,
        narrative,
        districtCount: regionRows.length,
        mode: 'sepi',
        sepiConflictData: collectSepiConflictData(geojson)
    };
}

export async function buildConflictReport({ country, activeLayers }) {
    const geojsonPath = getSepiDistrictGeoJSONPathForAdm1Labels(country);
    const response = await fetch(geojsonPath);
    if (!response.ok) {
        throw new Error(`Could not load district data for ${getCountryDisplayLabel(country)}`);
    }
    const geojson = await response.json();
    const countryLabel = country.replace(/_/g, ' ');
    geojson.features = geojson.features.filter(
        f => f.properties?.country === countryLabel
    );
    const narrative = getCountryReportNarrative(country);
    const conflictLayer = activeLayers?.get?.('conflict') || null;
    const pillarId = conflictLayer?.selectedAttribute || 'conflict_events';
    const year = Number(conflictLayer?.year) || DEFAULT_CONFLICT_YEAR;

    return {
        country,
        countryLabel: getCountryDisplayLabel(country),
        timestamp: new Date().toLocaleString(),
        mode: 'conflict',
        narrative,
        conflictContext: getConflictContextContent(country),
        conflictSeries: aggregateConflictSeries(geojson),
        conflictLayer: {
            ...(conflictLayer || {}),
            pillarId,
            year,
            selectedAttribute: pillarId
        },
        conflictRanking: collectConflictRanking(geojson, pillarId, year)
    };
}

export function renderCountryReportHTML(report) {
    return renderSepiReportHTML(report);
}

function drawLineChart(canvasId, labels, values, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 44;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxVal = Math.max(...values, 1);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e9ecef';
    ctx.fillStyle = '#666';
    ctx.font = '11px "Proxima Nova", Calibri';
    for (let i = 0; i <= 4; i++) {
        const y = padding + chartHeight - (i / 4) * chartHeight;
        const val = (i / 4) * maxVal;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(val).toLocaleString(), padding - 6, y + 4);
    }

    ctx.strokeStyle = options.color || '#b71c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
        const x = padding + (i / Math.max(labels.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - (v / maxVal) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    values.forEach((v, i) => {
        const x = padding + (i / Math.max(labels.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - (v / maxVal) * chartHeight;
        ctx.fillStyle = options.color || '#b71c1c';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText(String(labels[i]), x, height - 12);
    });

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px "Proxima Nova", Calibri';
    ctx.textAlign = 'center';
    ctx.fillText(options.title || '', width / 2, 18);
}

export function drawCountryReportCharts(report) {
    if (report.mode !== 'conflict' || !report.conflictSeries) return;

    const yearLabels = report.conflictSeries.years.map(String);
    drawLineChart('report-conflict-events-chart', yearLabels, report.conflictSeries.events, {
        title: 'Conflict events (national sum)',
        color: '#b71c1c'
    });
    drawLineChart('report-conflict-fatalities-chart', yearLabels, report.conflictSeries.fatalities, {
        title: 'Fatalities (national sum)',
        color: '#6a1b9a'
    });
}

export function drawSepiConflictScatter(canvasId, data, highlightedName) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const padL = 56, padR = 24, padT = 12, padB = 50;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    const xVals = data.map(d => d.avgConflictPer100k);
    const xMax = (Math.max(...xVals) || 1) * 1.1;
    const xMin = 0;
    const yMin = 0;
    const yMax = 1;

    const toX = v => padL + ((v - xMin) / (xMax - xMin)) * plotW;
    const toY = v => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    // Y gridlines
    const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    ctx.strokeStyle = '#ebebeb';
    ctx.lineWidth = 1;
    yTicks.forEach(t => {
        const y = toY(t);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '10px "Proxima Nova", Calibri, sans-serif';
    ctx.textAlign = 'right';
    yTicks.forEach(t => {
        ctx.fillText(t.toFixed(1), padL - 6, toY(t) + 4);
    });

    // X-axis labels
    ctx.textAlign = 'center';
    const xTickCount = 5;
    for (let i = 0; i <= xTickCount; i++) {
        const v = xMin + (xMax - xMin) * i / xTickCount;
        ctx.fillText(v.toFixed(1), toX(v), padT + plotH + 14);
    }

    // X-axis title
    ctx.fillStyle = '#555';
    ctx.font = '11px "Proxima Nova", Calibri, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Avg. Conflict Events per 100k (2016–2025)', padL + plotW / 2, H - 6);

    // Y-axis title (rotated)
    ctx.save();
    ctx.translate(13, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('SEPI Score (2025)', 0, 0);
    ctx.restore();

    // Linear regression line
    if (data.length >= 2) {
        const n = data.length;
        const sumX = data.reduce((s, d) => s + d.avgConflictPer100k, 0);
        const sumY = data.reduce((s, d) => s + d.sepi, 0);
        const sumXY = data.reduce((s, d) => s + d.avgConflictPer100k * d.sepi, 0);
        const sumX2 = data.reduce((s, d) => s + d.avgConflictPer100k * d.avgConflictPer100k, 0);
        const denom = n * sumX2 - sumX * sumX;
        if (denom !== 0) {
            const slope = (n * sumXY - sumX * sumY) / denom;
            const intercept = (sumY - slope * sumX) / n;
            const clamp = v => Math.max(yMin, Math.min(yMax, v));
            const y0 = clamp(intercept + slope * xMin);
            const y1 = clamp(intercept + slope * xMax);
            ctx.save();
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = 'rgba(180, 80, 30, 0.55)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(toX(xMin), toY(y0));
            ctx.lineTo(toX(xMax), toY(y1));
            ctx.stroke();
            ctx.restore();
        }
    }

    // Non-highlighted dots first
    data.forEach(d => {
        if (d.name === highlightedName) return;
        ctx.beginPath();
        ctx.arc(toX(d.avgConflictPer100k), toY(d.sepi), 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(70, 130, 180, 0.55)';
        ctx.fill();
    });

    // Highlighted dot on top with label
    const hl = data.find(d => d.name === highlightedName);
    if (hl) {
        const hx = toX(hl.avgConflictPer100k);
        const hy = toY(hl.sepi);
        ctx.beginPath();
        ctx.arc(hx, hy, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#e05c2e';
        ctx.fill();
        ctx.strokeStyle = '#b33a10';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const labelRight = hx > padL + plotW * 0.72;
        ctx.fillStyle = '#b33a10';
        ctx.font = 'bold 11px "Proxima Nova", Calibri, sans-serif';
        ctx.textAlign = labelRight ? 'right' : 'left';
        ctx.fillText(hl.name, hx + (labelRight ? -10 : 10), hy + 4);
    }
}
