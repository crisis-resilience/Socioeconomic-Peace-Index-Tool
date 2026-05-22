/**
 * Country SEPI report builder for Analysis → Report Results.
 */

import { getSepiDistrictGeoJSONPathForAdm1Labels } from './layer_config.js';
import { getSepiDashboardContent, renderSepiDashboardHtml } from './sepi_dashboard_content.js';
import { getConflictContextContent, getCountryDisplayLabel } from './conflict_context_content.js';
import { renderSepiWorkedExampleSection } from './sepi_methodology_content.js';

const CONFLICT_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const PILLAR_KEYS = [
    { key: 'pillar_education', label: 'Education' },
    { key: 'pillar_health', label: 'Health Access' },
    { key: 'pillar_food_security', label: 'Food Security' },
    { key: 'pillar_economic', label: 'Poverty Reduction' },
    { key: 'pillar_climate', label: 'Climate Resilience' }
];

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

function collectRankingFromGeoJSON(geojson, valueKey = 'peacebuilding_index') {
    const rows = [];
    for (const feature of geojson.features || []) {
        const props = feature.properties || {};
        const value = parseRankingValue(props[valueKey]);
        if (value == null) continue;
        const name = getDistrictName(props);
        if (String(name).trim().toLowerCase() === 'unknown district') continue;
        rows.push({ name, value });
    }
    rows.sort((a, b) => b.value - a.value);
    return rows;
}

function collectRankingFromLayer(layerInfo) {
    const geojsonLayer = layerInfo?.layer;
    const valueKey = layerInfo?.rankingAttribute || layerInfo?.selectedAttribute || 'peacebuilding_index';
    if (!geojsonLayer?.eachLayer) return { rows: [], valueKey, layerName: layerInfo?.name || 'SEPI' };

    const rows = [];
    geojsonLayer.eachLayer((layer) => {
        const props = layer?.feature?.properties || {};
        const value = parseRankingValue(props[valueKey]);
        if (value == null) return;
        const name = getDistrictName(props);
        if (String(name).trim().toLowerCase() === 'unknown district') return;
        rows.push({ name, value });
    });
    rows.sort((a, b) => b.value - a.value);
    return {
        rows,
        valueKey,
        layerName: (layerInfo?.name || 'SEPI').replace(/^Pillar:\s*/i, '')
    };
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

function topConflictDistricts(geojson, year = 2025, limit = 10) {
    const key = `count_conflict_events_${year}`;
    const rows = [];
    for (const feature of geojson.features || []) {
        const props = feature.properties || {};
        const events = parseRankingValue(props[key]);
        if (events == null || events <= 0) continue;
        const fatalities = parseRankingValue(props[`total_fatalities_${year}`]) ?? 0;
        const sepi = parseRankingValue(props.peacebuilding_index);
        rows.push({
            name: getDistrictName(props),
            events,
            fatalities,
            sepi
        });
    }
    rows.sort((a, b) => b.events - a.events);
    return rows.slice(0, limit);
}

function averagePillarScores(geojson) {
    const sums = {};
    const counts = {};
    PILLAR_KEYS.forEach(({ key }) => {
        sums[key] = 0;
        counts[key] = 0;
    });

    for (const feature of geojson.features || []) {
        const props = feature.properties || {};
        PILLAR_KEYS.forEach(({ key }) => {
            const v = parseRankingValue(props[key]);
            if (v == null) return;
            sums[key] += v;
            counts[key] += 1;
        });
    }

    return PILLAR_KEYS.map(({ key, label }) => ({
        label,
        value: counts[key] ? sums[key] / counts[key] : null
    })).filter((p) => p.value != null);
}

function summarizeActiveLayers(activeLayers) {
    if (!activeLayers || typeof activeLayers.values !== 'function') return [];
    return Array.from(activeLayers.values()).map((layer) => ({
        name: layer.name || 'Layer',
        type: layer.type || '',
        details: [
            layer.selectedAttribute ? `Attribute: ${layer.selectedAttribute}` : null,
            layer.source ? `Source: ${layer.source}` : null,
            layer.year != null ? `Year: ${layer.year}` : null,
            layer.featureCount != null ? `Features: ${layer.featureCount}` : null
        ].filter(Boolean)
    }));
}

function renderConflictSection(section) {
    if (!section) return '';
    return `
        <h6>${escapeHtml(section.title)}</h6>
        ${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
    `;
}

function renderRankingBarsHtml(rows, maxRows = 20) {
    const slice = rows.slice(0, maxRows);
    if (!slice.length) {
        return '<p class="report-muted">No district scores available for the current layer.</p>';
    }
    const maxValue = Math.max(...slice.map((r) => r.value), 1);
    return slice
        .map((row, idx) => {
            const pct = Math.max(2, (row.value / maxValue) * 100);
            return `
                <div class="report-ranking-row">
                    <span class="report-ranking-rank">${idx + 1}.</span>
                    <span class="report-ranking-name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span>
                    <span class="report-ranking-bar-wrap"><span class="report-ranking-bar" style="width:${pct}%"></span></span>
                    <span class="report-ranking-value">${row.value.toFixed(2)}</span>
                </div>
            `;
        })
        .join('');
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

    const sepiLayerInfo = activeLayers?.get?.('sepi');
    const pillarLayerInfo = activeLayers?.get?.('pillar');
    const layerInfo = sepiLayerInfo || pillarLayerInfo;

    let ranking;
    if (layerInfo?.layer && !activeLayers?.has?.('conflict')) {
        ranking = collectRankingFromLayer(layerInfo);
    } else {
        const valueKey = layerInfo?.rankingAttribute || layerInfo?.selectedAttribute || 'peacebuilding_index';
        ranking = {
            rows: collectRankingFromGeoJSON(geojson, valueKey),
            valueKey,
            layerName: layerInfo?.name?.replace(/^Pillar:\s*/i, '') || 'Overall Peace Index'
        };
    }

    const dashboard = getSepiDashboardContent(country);
    const conflictContext = getConflictContextContent(country);
    const conflictSeries = aggregateConflictSeries(geojson);
    const topConflict = topConflictDistricts(geojson, 2025, 12);
    const pillarMeans = averagePillarScores(geojson);
    const activeLayerItems = summarizeActiveLayers(activeLayers);
    const showDashboard = Boolean(dashboard) && (sepiLayerInfo || !pillarLayerInfo);

    return {
        country,
        countryLabel: getCountryDisplayLabel(country),
        timestamp: new Date().toLocaleString(),
        geojsonPath,
        ranking,
        dashboard: showDashboard ? dashboard : null,
        dashboardHtml: showDashboard && dashboard ? renderSepiDashboardHtml(dashboard) : '',
        conflictContext,
        conflictSeries,
        topConflict,
        pillarMeans,
        activeLayerItems,
        methodologyHtml: renderSepiWorkedExampleSection()
    };
}

export function renderCountryReportHTML(report) {
    const { countryLabel, timestamp, ranking, activeLayerItems } = report;

    const activeLayersBlock =
        activeLayerItems.length > 0
            ? `<ul class="report-active-layers-list">
                ${activeLayerItems
                    .map(
                        (l) => `
                    <li><strong>${escapeHtml(l.name)}</strong>${l.type ? ` <span class="report-muted">(${escapeHtml(l.type)})</span>` : ''}
                        ${l.details.length ? `<br><span class="report-muted">${escapeHtml(l.details.join(' • '))}</span>` : ''}
                    </li>`
                    )
                    .join('')}
               </ul>`
            : '<p class="report-muted">No layers were active when this report was generated. Map data below uses the country district file.</p>';

    const dashboardBlock = report.dashboardHtml
        ? `<div class="report-dashboard-narrative">${report.dashboardHtml}</div>`
        : '';

    const conflictBlock = report.conflictContext
        ? `
            <div class="report-section">
                <h6>Conflict Context — ${escapeHtml(report.conflictContext.countryLabel)}</h6>
                ${renderConflictSection(report.conflictContext.profile)}
                ${renderConflictSection(report.conflictContext.trends)}
                ${renderConflictSection(report.conflictContext.intensive)}
            </div>
            <div class="report-section">
                <h6>Conflict Data Visualizations</h6>
                <p class="report-muted">National totals aggregated from district-level ACLED fields in the active country dataset (events and fatalities per 100k where applicable on the map).</p>
                <div class="report-chart-grid">
                    <div class="report-chart-cell">
                        <label>Conflict events by year (national sum)</label>
                        <canvas id="report-conflict-events-chart" width="480" height="220"></canvas>
                    </div>
                    <div class="report-chart-cell">
                        <label>Fatalities by year (national sum)</label>
                        <canvas id="report-conflict-fatalities-chart" width="480" height="220"></canvas>
                    </div>
                </div>
                <h6 style="margin-top:14px;">Highest-conflict districts (${report.conflictSeries.years[report.conflictSeries.years.length - 1]})</h6>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>District / Region</th>
                                <th>Events</th>
                                <th>Fatalities</th>
                                <th>SEPI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.topConflict
                                .map(
                                    (row) => `
                                <tr>
                                    <td>${escapeHtml(row.name)}</td>
                                    <td>${row.events.toLocaleString()}</td>
                                    <td>${row.fatalities.toLocaleString()}</td>
                                    <td>${row.sepi != null ? row.sepi.toFixed(2) : '—'}</td>
                                </tr>`
                                )
                                .join('')}
                        </tbody>
                    </table>
                </div>
                <div class="report-mockup-ideas">
                    <h6>Visualization mockup ideas</h6>
                    <ul>
                        ${report.conflictContext.mockupIdeas.map((idea) => `<li>${escapeHtml(idea)}</li>`).join('')}
                    </ul>
                </div>
            </div>`
        : '<p class="report-muted">Conflict context is not available for this country.</p>';

    return `
        <div class="report-container country-report">
            <div class="report-header">
                <h5>SEPI Country Report — ${escapeHtml(countryLabel)}</h5>
                <button type="button" class="download-btn" onclick="window.infoPanelInstance.downloadReport()">
                    Download PDF
                </button>
            </div>

            <div class="report-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <label>Country</label>
                        <span>${escapeHtml(countryLabel)}</span>
                    </div>
                    <div class="summary-item">
                        <label>Generated</label>
                        <span>${escapeHtml(timestamp)}</span>
                    </div>
                    <div class="summary-item">
                        <label>Ranking metric</label>
                        <span>${escapeHtml(ranking.layerName)}</span>
                    </div>
                    <div class="summary-item">
                        <label>Districts ranked</label>
                        <span>${ranking.rows.length}</span>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h6>Active Layers</h6>
                ${activeLayersBlock}
                ${dashboardBlock}
            </div>

            <div class="report-section">
                <h6>${escapeHtml(ranking.layerName)} — District Ranking</h6>
                <p class="report-muted">Same ranking as the Active Layers pillar chart (highest to lowest). Top ${Math.min(20, ranking.rows.length)} districts shown.</p>
                <div class="report-ranking-bars">${renderRankingBarsHtml(ranking.rows)}</div>
                <div class="report-chart-cell" style="margin-top:12px;">
                    <label>Top 15 districts (chart)</label>
                    <canvas id="report-ranking-chart" width="480" height="280"></canvas>
                </div>
            </div>

            ${report.pillarMeans.length ? `
            <div class="report-section">
                <h6>Pillar scores (country average)</h6>
                <canvas id="report-pillar-chart" width="480" height="240"></canvas>
            </div>` : ''}

            ${conflictBlock}

            <div class="report-section report-methodology">
                <h6>SEPI methodology</h6>
                ${report.methodologyHtml}
            </div>
        </div>
    `;
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

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const maxVal = Math.max(...values, 1);
    const minVal = 0;

    ctx.strokeStyle = '#e9ecef';
    ctx.fillStyle = '#666';
    ctx.font = '11px Calibri';
    for (let i = 0; i <= 4; i++) {
        const y = padding + chartHeight - (i / 4) * chartHeight;
        const val = minVal + (i / 4) * (maxVal - minVal);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(val).toLocaleString(), padding - 6, y + 4);
    }

    ctx.strokeStyle = options.color || '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
        const x = padding + (i / Math.max(labels.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    values.forEach((v, i) => {
        const x = padding + (i / Math.max(labels.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;
        ctx.fillStyle = options.color || '#dc3545';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText(String(labels[i]), x, height - 12);
    });

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Calibri';
    ctx.textAlign = 'center';
    ctx.fillText(options.title || '', width / 2, 18);
}

function drawHorizontalBarChart(canvasId, labels, values, color = '#60a5fa') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const leftPad = 120;
    const rightPad = 48;
    const topPad = 28;
    const bottomPad = 16;
    const barGap = 4;
    const n = labels.length;
    if (!n) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const chartH = height - topPad - bottomPad;
    const barH = Math.min(18, (chartH - barGap * (n - 1)) / n);
    const maxVal = Math.max(...values, 0.01);

    ctx.font = '10px Calibri';
    values.forEach((v, i) => {
        const y = topPad + i * (barH + barGap);
        const label = String(labels[i]).slice(0, 16);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        ctx.fillText(label, leftPad - 8, y + barH * 0.72);
        const barW = ((width - leftPad - rightPad) * v) / maxVal;
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(leftPad, y, width - leftPad - rightPad, barH);
        ctx.fillStyle = color;
        ctx.fillRect(leftPad, y, barW, barH);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(v.toFixed(2), leftPad + barW + 6, y + barH * 0.72);
    });
}

function drawPillarBarChart(canvasId, pillars) {
    const labels = pillars.map((p) => p.label);
    const values = pillars.map((p) => p.value);
    drawHorizontalBarChart(canvasId, labels.reverse(), values.reverse(), '#28a745');
}

export function drawCountryReportCharts(report) {
    const { conflictSeries, ranking, pillarMeans } = report;
    const yearLabels = conflictSeries.years.map(String);

    drawLineChart('report-conflict-events-chart', yearLabels, conflictSeries.events, {
        title: 'Conflict events (sum)',
        color: '#c0392b'
    });
    drawLineChart('report-conflict-fatalities-chart', yearLabels, conflictSeries.fatalities, {
        title: 'Fatalities (sum)',
        color: '#8e44ad'
    });

    const top = ranking.rows.slice(0, 15).reverse();
    drawHorizontalBarChart(
        'report-ranking-chart',
        top.map((r) => r.name),
        top.map((r) => r.value)
    );

    if (pillarMeans.length) {
        drawPillarBarChart('report-pillar-chart', pillarMeans);
    }
}
