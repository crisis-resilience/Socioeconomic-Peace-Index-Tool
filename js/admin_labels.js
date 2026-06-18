// admin_labels.js — Map control labels + outline dropdown can switch active country

import { basemaps, basemapOptions } from './basemaps.js';
import {
    LAYER_CONFIG,
    getCountryPath,
    getCurrentCountry,
    getSepiDistrictGeoJSONPathForAdm1Labels
} from './layer_config.js';

/** Outline `<select>` value → app country strings (`setConfigCountry`). */
const OUTLINE_SELECT_VALUE_TO_APP_COUNTRY = Object.freeze({
    somalia: 'Somalia',
    kenya: 'Kenya',
    south_sudan: 'South_Sudan'
});

/** Invalidates in-flight ADM1 label fetches after country switches */
let adm1LabelFetchGeneration = 0;

/**
 * Create label layers for administrative boundaries and combined control panel
 * @param {Object} map - Leaflet map instance
 * @param {Object} vectorLayers - Object containing vector layers
 * @param {Object} countryOutlines - Object containing country outline layers
 * @param {Object} compareMap - Comparison map instance
 * @returns {Object} - Object containing label layers
 */
export function createAdminLabelLayers(map, vectorLayers, countryOutlines, compareMap) {
    const labelLayers = {
        adm1: L.layerGroup()
    };
    
    // Remove the default zoom control since we're using the top-left corner
    map.removeControl(map.zoomControl);
    
    // Create the combined control panel
    createCombinedMapControl(map, labelLayers, countryOutlines, compareMap);
    
    return labelLayers;
}

/**
 * Create a custom control combining all map controls
 * @param {Object} map - Leaflet map instance
 * @param {Object} labelLayers - Label layer groups
 * @param {Object} countryOutlines - Object containing country outline layers
 * @param {Object} compareMap - Comparison map instance
 */
function createCombinedMapControl(map, labelLayers, countryOutlines, compareMap) {
    const CombinedControl = L.Control.extend({
        options: { position: 'topleft' },
        
        onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control combined-map-control minimized');
            
            // Add toggle button for minimizing/maximizing the panel
            const toggleButton = L.DomUtil.create('div', 'combined-control-toggle', container);
            toggleButton.innerHTML = 'Map Controls ▼';
            toggleButton.title = 'Toggle Map Controls';
            
            // Create content container that can be hidden/shown
            const contentContainer = L.DomUtil.create('div', 'combined-control-content', container);
            
            // Country Outlines Section
            const outlineLabel = L.DomUtil.create('label', 'outline-label', contentContainer);
            outlineLabel.textContent = 'Country Outline:';
            
            const outlineSelect = L.DomUtil.create('select', 'outline-select', contentContainer);
            
            // Add outline options
            addOutlineOptions(outlineSelect);
            
            const showLabelsButton = createButton('Show labels', contentContainer);
            showLabelsButton.title =
                'Show ADM1 (first-level admin) region names for the current country';
            
            // Map Basemaps Section
            const leftMapLabel = L.DomUtil.create('label', 'basemap-label', contentContainer);
            leftMapLabel.textContent = 'Select Basemap:';
            
            const leftMapSelect = L.DomUtil.create('select', 'basemap-select', contentContainer);
            
            // Add basemap options
            addBasemapOptions(leftMapSelect, 'cartoLight');
            
            // Right map selection (only if compareMap exists)
            if (compareMap) {
                const rightMapLabel = L.DomUtil.create('label', 'basemap-label', contentContainer);
                rightMapLabel.textContent = 'Right Map:';
                
                const rightMapSelect = L.DomUtil.create('select', 'basemap-select', contentContainer);
                
                // Add basemap options with Satellite Imagery as default
                addBasemapOptions(rightMapSelect, 'esriWorldImagery');
                
                // Set event handler for right map
                L.DomEvent.on(rightMapSelect, 'change', function() {
                    updateBasemap(compareMap, this.value);
                });
            }
            
            L.DomEvent.on(outlineSelect, 'change', function(e) {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);

                const value = this.value;
                const appCountry = OUTLINE_SELECT_VALUE_TO_APP_COUNTRY[value];

                if (
                    appCountry &&
                    typeof window.switchApplicationCountry === 'function' &&
                    getCurrentCountry() !== appCountry
                ) {
                    void window.switchApplicationCountry(appCountry);
                    return;
                }

                toggleCountryOutline(value, map, countryOutlines);
                if (typeof window.hideDataCountryOutlineIfSepiDisplayed === 'function') {
                    window.hideDataCountryOutlineIfSepiDisplayed();
                }
            });

            L.DomEvent.on(showLabelsButton, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                toggleAdm1Labels(showLabelsButton, labelLayers, map);
            });

            document.addEventListener('countryChanged', () => {
                const wantLabels =
                    map.hasLayer(labelLayers.adm1) || showLabelsButton.classList.contains('active');
                labelLayers.adm1.clearLayers();
                if (map.hasLayer(labelLayers.adm1)) {
                    map.removeLayer(labelLayers.adm1);
                }
                if (!wantLabels) return;
                loadAdm1LabelsForCurrentCountry(labelLayers.adm1)
                    .then(() => {
                        if (!showLabelsButton.classList.contains('active')) return;
                        labelLayers.adm1.addTo(map);
                    })
                    .catch((err) =>
                        console.error('ADM1 labels reload after country change failed:', err)
                    );
            });
            
            // Set event handler for left map
            L.DomEvent.on(leftMapSelect, 'change', function() {
                updateBasemap(map, this.value);
            });

            // Ensure default outline selection is applied on startup.
            // This avoids requiring a manual dropdown change.
            toggleCountryOutline(outlineSelect.value, map, countryOutlines);
            if (typeof window.hideDataCountryOutlineIfSepiDisplayed === 'function') {
                window.hideDataCountryOutlineIfSepiDisplayed();
            }

            // Set toggle handler
            L.DomEvent.on(toggleButton, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                
                const isMinimized = container.classList.toggle('minimized');
                this.innerHTML = isMinimized ? 'Map Controls ▲' : 'Map Controls ▼';
            });
            
            // Prevent map clicks from propagating through the control
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            
            return container;
        }
    });
    
    map.addControl(new CombinedControl());
}

/**
 * Add outline options to select element
 * @param {HTMLElement} select - Select element to populate
 */
function addOutlineOptions(select) {
    const outlineOptions = [
        { value: '', label: 'No Outline' },
        { value: 'show_all', label: 'Show All' },
        { value: 'somalia', label: 'Somalia' },
        { value: 'kenya', label: 'Kenya' },
        { value: 'south_sudan', label: 'South Sudan' }
    ];
    
    outlineOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        
        // Set Show All as default
        if (option.value === 'show_all') {
            optionElement.selected = true;
        }
        
        select.appendChild(optionElement);
    });
}

/**
 * Add basemap options to select element
 * @param {HTMLElement} select - Select element to populate
 * @param {string} defaultBasemap - ID of the default selected basemap
 */
function addBasemapOptions(select, defaultBasemap) {
    // Use the existing basemapOptions from basemaps.js
    basemapOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        
        // Set the default selection
        if (option.value === defaultBasemap) {
            optionElement.selected = true;
        }
        
        select.appendChild(optionElement);
    });
}

/**
 * Update a map's basemap
 * @param {Object} map - Map instance
 * @param {string} basemapId - ID of the basemap to use
 */
function updateBasemap(map, basemapId) {
    // Remove all basemaps
    Object.values(basemaps).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    
    // Add the selected basemap if it exists
    if (basemaps[basemapId]) {
        basemaps[basemapId].addTo(map);
    }
}

/**
 * Create a styled button element
 * @param {string} text - Button text
 * @param {HTMLElement} container - Parent container
 * @returns {HTMLElement} - Button element
 */
function createButton(text, container) {
    const button = L.DomUtil.create('button', 'combined-control-button', container);
    button.innerHTML = text;
    button.style.padding = '6px 10px';
    button.style.backgroundColor = '#f8f8f8';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    button.style.width = '100%';
    button.style.transition = 'all 0.3s';
    button.style.fontWeight = 'normal';
    
    // Add hover effect (guarded to avoid detached/undefined targets)
    button.addEventListener('mouseover', (event) => {
        const target = event?.currentTarget;
        if (!target?.classList || !target?.style) return;
        if (!target.classList.contains('active')) {
            target.style.backgroundColor = '#e6e6e6';
        }
    });
    button.addEventListener('mouseout', (event) => {
        const target = event?.currentTarget;
        if (!target?.classList || !target?.style) return;
        if (!target.classList.contains('active')) {
            target.style.backgroundColor = '#f8f8f8';
        }
    });
    
    return button;
}

function pickAdm1Name(properties) {
    if (!properties) return '';
    const candidateKeys = [
        'ADM1_EN',
        'adm1_name',
        'NAME_1',
        'name_1',
        'Adm_1_Name',
        'admin1_name',
        'REGION',
        'Region',
        'ADM1NAME'
    ];
    for (const key of candidateKeys) {
        const v = properties[key];
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
}

function adm1GroupKey(properties) {
    const gid = properties?.GID_1 ?? properties?.gid_1 ?? properties?.adm1_gid ?? properties?.ADM1_CODE;
    if (gid != null && String(gid).trim() !== '') {
        return `gid:${String(gid).trim()}`;
    }
    const name = pickAdm1Name(properties);
    return name ? `nm:${name.toLowerCase()}` : '';
}

function centroidFromGeoJSONFeature(feature) {
    const geo = feature?.geometry;
    if (!geo) return null;

    if (geo.type === 'Polygon') {
        const centroid = calculatePolygonCentroid(geo.coordinates[0]);
        return centroid ? findBestLabelPosition(geo.coordinates[0], centroid) : null;
    }
    if (geo.type === 'MultiPolygon') {
        let largestRing = geo.coordinates[0]?.[0];
        let largestArea = 0;
        for (const polygon of geo.coordinates) {
            const ring = polygon[0];
            const area = calculatePolygonArea(ring);
            if (area > largestArea) {
                largestArea = area;
                largestRing = ring;
            }
        }
        const centroid = calculatePolygonCentroid(largestRing);
        return centroid ? findBestLabelPosition(largestRing, centroid) : null;
    }
    return null;
}

function averageCentroids(points) {
    if (!points.length) return null;
    let lat = 0;
    let lng = 0;
    for (const p of points) {
        lat += p.lat;
        lng += p.lng;
    }
    return { lat: lat / points.length, lng: lng / points.length };
}

function adm1Marker(center, htmlName) {
    return L.marker([center.lat, center.lng], {
        icon: L.divIcon({
            className: 'admin-label-icon',
            html: `<div class="admin-label adm1-label">${htmlName}</div>`,
            iconSize: null,
            iconAnchor: [0, 0]
        }),
        interactive: false
    });
}

/**
 * Update zoom-level classes on map container for responsive label styling
 * @param {Object} map - Leaflet map instance
 */
function updateZoomLevelClasses(map) {
    const zoom = map.getZoom();
    const container = map.getContainer();
    
    // Remove all zoom classes
    container.classList.remove('zoom-out-min', 'zoom-mid-5-7', 'zoom-in-8');
    
    // Add appropriate zoom class
    if (zoom >= 8) {
        container.classList.add('zoom-in-8');
    } else if (zoom >= 5) {
        container.classList.add('zoom-mid-5-7');
    } else {
        container.classList.add('zoom-out-min');
    }
}

function escapeHtmlLite(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function addAdm1MarkersGroupedFromDistrictGeoJSON(geojsonData, labelLayer) {
    labelLayer.clearLayers();
    const groups = new Map();

    if (!geojsonData?.features?.length) {
        console.warn('ADM1 labels: GeoJSON has no features');
        return;
    }

    for (const feature of geojsonData.features) {
        const props = feature.properties || {};
        const key = adm1GroupKey(props);
        if (!key) continue;
        const c = centroidFromGeoJSONFeature(feature);
        if (!c) continue;
        const nm = pickAdm1Name(props);
        let entry = groups.get(key);
        if (!entry) {
            entry = { name: nm || key, centers: [] };
            groups.set(key, entry);
        }
        entry.centers.push(c);
        if (nm) entry.name = nm;
    }

    let n = 0;
    for (const [_k, entry] of groups) {
        const center = averageCentroids(entry.centers);
        if (!center) continue;
        labelLayer.addLayer(adm1Marker(center, escapeHtmlLite(entry.name)));
        n++;
    }
    console.log(`ADM1 labels: ${n} regions (grouped from district GeoJSON)`);
}

function addAdm1MarkersDirectFromGeoJSON(geojsonData, labelLayer) {
    labelLayer.clearLayers();
    if (!geojsonData?.features?.length) return;

    let labelsGenerated = 0;
    for (const feature of geojsonData.features) {
        const props = feature.properties || {};
        const name = pickAdm1Name(props) || props.NAME_1;
        if (!name) continue;
        const center = centroidFromGeoJSONFeature(feature);
        if (!center) continue;
        labelLayer.addLayer(adm1Marker(center, escapeHtmlLite(name)));
        labelsGenerated++;
    }
    console.log(`ADM1 labels: ${labelsGenerated} features (ADM1 polygons)`);
}

async function fetchGeoJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

/**
 * Populate `labelLayer` with ADM1 names for the active config country — SEPI districts first,
 * then `adm1_subnational_statistics` if grouping yields nothing.
 */
function loadAdm1LabelsForCurrentCountry(labelLayer) {
    const fetchId = ++adm1LabelFetchGeneration;
    const stillValid = () => fetchId === adm1LabelFetchGeneration;

    const sepiUrl = getSepiDistrictGeoJSONPathForAdm1Labels();
    const fallbackUrl =
        typeof LAYER_CONFIG.admin1?.url === 'function'
            ? LAYER_CONFIG.admin1.url()
            : LAYER_CONFIG.admin1?.url;

    labelLayer.clearLayers();

    const runFallback = () => {
        if (!fallbackUrl) {
            console.warn(`ADM1 labels: no fallback URL (${getCurrentCountry()})`);
            return Promise.resolve();
        }
        return fetchGeoJSON(fallbackUrl).then((data) => {
            if (!stillValid()) return;
            addAdm1MarkersDirectFromGeoJSON(data, labelLayer);
        });
    };

    if (!sepiUrl) return runFallback();

    return fetchGeoJSON(sepiUrl)
        .then((data) => {
            if (!stillValid()) return;
            const countryName = getCurrentCountry().replace('_', ' ');
            const filtered = {
                ...data,
                features: data.features.filter(f => f.properties?.country === countryName)
            };
            addAdm1MarkersGroupedFromDistrictGeoJSON(filtered, labelLayer);
            if (labelLayer.getLayers().length === 0) {
                return runFallback();
            }
        })
        .catch((err) => {
            console.warn('ADM1 labels: SEPI bundle fetch failed, trying admin1:', err);
            return runFallback();
        });
}

function toggleAdm1Labels(button, labelLayers, map) {
    const isActive = button.classList.contains('active');

    if (isActive) {
        button.classList.remove('active');
        button.style.backgroundColor = '#f8f8f8';
        button.style.fontWeight = 'normal';
        map.removeLayer(labelLayers.adm1);
        // Remove zoom event listener
        map.off('zoom', onAdm1LabelsZoom);
        return;
    }

    button.classList.add('active');
    button.style.backgroundColor = '#d4edda';
    button.style.fontWeight = 'bold';

    if (labelLayers.adm1.getLayers().length === 0) {
        loadAdm1LabelsForCurrentCountry(labelLayers.adm1)
            .then(() => {
                if (button.classList.contains('active')) {
                    labelLayers.adm1.addTo(map);
                    // Set up zoom event listener
                    updateZoomLevelClasses(map);
                    map.on('zoom', onAdm1LabelsZoom);
                }
            })
            .catch((err) => {
                console.error('ADM1 labels load failed:', err);
                button.classList.remove('active');
                button.style.backgroundColor = '#f8f8f8';
                button.style.fontWeight = 'normal';
            });
        return;
    }

    labelLayers.adm1.addTo(map);
    // Set up zoom event listener
    updateZoomLevelClasses(map);
    map.on('zoom', onAdm1LabelsZoom);
}

/**
 * Zoom event handler for ADM1 labels
 * Updates label appearance based on zoom level
 */
function onAdm1LabelsZoom() {
    // 'this' context is the map object
    updateZoomLevelClasses(this);
}

/**
 * Calculate centroid of a polygon
 * @param {Array} coordinates - Array of [lng, lat] coordinates
 * @returns {Object} - {lat, lng} centroid
 */
function calculatePolygonCentroid(coordinates) {
    if (!coordinates || coordinates.length === 0) return null;
    
    let x = 0, y = 0;
    let validPoints = 0;
    
    coordinates.forEach(coord => {
        if (coord && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
            x += coord[0]; // longitude
            y += coord[1]; // latitude
            validPoints++;
        }
    });
    
    if (validPoints === 0) return null;
    
    return {
        lat: y / validPoints,
        lng: x / validPoints
    };
}

/**
 * Calculate approximate area of a polygon (for finding largest in multipolygon)
 * @param {Array} coordinates - Array of [lng, lat] coordinates
 * @returns {number} - Approximate area
 */
function calculatePolygonArea(coordinates) {
    if (!coordinates || coordinates.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[i + 1];
        area += (x1 * y2) - (x2 * y1);
    }
    return Math.abs(area) / 2;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {Array} coordinates - Polygon coordinates [[lng, lat], ...]
 * @returns {boolean} - True if point is inside polygon
 */
function isPointInPolygon(lng, lat, coordinates) {
    if (!coordinates || coordinates.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[j];
        
        const intersect = ((y1 > lat) !== (y2 > lat)) &&
            (lng < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Find the best label position inside a polygon
 * @param {Array} coordinates - Polygon coordinates
 * @param {Object} centroid - Initial centroid point {lng, lat}
 * @returns {Object} - Best position {lat, lng} inside the polygon
 */
function findBestLabelPosition(coordinates, centroid) {
    if (!coordinates || !centroid) return centroid;
    
    // Check if centroid is already inside
    if (isPointInPolygon(centroid.lng, centroid.lat, coordinates)) {
        return centroid;
    }
    
    // If centroid is outside, find the best point inside by sampling
    const bounds = getBoundingBox(coordinates);
    const samples = [];
    
    // Sample a grid of points within the bounding box
    const gridStep = Math.min(
        (bounds.maxLng - bounds.minLng) / 5,
        (bounds.maxLat - bounds.minLat) / 5
    );
    
    for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += gridStep) {
        for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += gridStep) {
            if (isPointInPolygon(lng, lat, coordinates)) {
                const distance = Math.pow(lng - centroid.lng, 2) + Math.pow(lat - centroid.lat, 2);
                samples.push({ lng, lat, distance });
            }
        }
    }
    
    // If we found valid points, return the closest to the original centroid
    if (samples.length > 0) {
        samples.sort((a, b) => a.distance - b.distance);
        return { lng: samples[0].lng, lat: samples[0].lat };
    }
    
    // Fallback: return centroid as-is
    return centroid;
}

/**
 * Get bounding box of polygon coordinates
 * @param {Array} coordinates - Polygon coordinates
 * @returns {Object} - {minLng, maxLng, minLat, maxLat}
 */
function getBoundingBox(coordinates) {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    coordinates.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
    });
    
    return { minLng, maxLng, minLat, maxLat };
}

/**
 * Toggle country outline visibility with multiple country support
 * @param {string} countryId - ID of the country outline to show
 * @param {Object} map - Leaflet map instance
 * @param {Object} countryOutlines - Object containing all country outline layers
 */
function toggleCountryOutline(countryId, map, countryOutlines) {
    // Remove all existing outlines from the map
    Object.values(countryOutlines).forEach(outline => {
        if (outline && map.hasLayer(outline)) {
            map.removeLayer(outline);
        }
    });

    if (countryId === 'show_all') {
        Object.values(countryOutlines).forEach(outline => {
            if (outline && !map.hasLayer(outline)) {
                outline.addTo(map);
                outline.bringToBack?.();
                outline.eachLayer(layer => layer.bringToBack?.());
            }
        });
        return;
    }

    // If a specific country is selected, add it to the map
    if (countryId && countryOutlines[countryId] && !map.hasLayer(countryOutlines[countryId])) {
        countryOutlines[countryId].addTo(map);
        safelyBringLayerToBack(countryOutlines[countryId]);
        countryOutlines[countryId].eachLayer(layer => safelyBringLayerToBack(layer));
    }
}

function safelyBringLayerToBack(layer) {
    if (!layer) return;
    try {
        layer.bringToBack?.();
    } catch (err) {
        console.debug('Skipped bringToBack for non-path or detached layer:', err);
    }
}

/**
 * Load a country outline from file
 * @param {string} countryId - Country identifier
 * @param {string} filepath - Path to the GeoJSON file
 * @returns {Promise} - Promise resolving to the loaded layer
 */
export async function loadCountryOutline(countryId, filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        const outlineLayer = L.geoJSON(data, {
            style: {
                color: "#8a8a8a",
                weight: 1,
                opacity: 1,
                fillColor: "#ffffff",
                fillOpacity: 0.18
            }
        });
        
        // Remove tooltips from outline features
        outlineLayer.eachLayer(layer => {
            layer.unbindTooltip();
        });
        
        console.log(`Loaded ${countryId} outline from ${filepath}`);
        return outlineLayer;
    } catch (error) {
        // Missing file / HTML error page — callers try further candidates; avoid console.error noise.
        console.debug(`Outline skip (${filepath}):`, error?.message || error);
        return null;
    }
}

/**
 * Generate labels for admin boundaries — ADM1 only (LayerManager refreshes markers when Admin 1 stats load).
 */
export function generateAdminLabels(layer, level, labelLayer) {
    labelLayer.clearLayers();
    if (level !== 'adm1') return;

    if (!layer?.getLayers) {
        console.error('Invalid layer provided to generateAdminLabels');
        return;
    }

    let labelsGenerated = 0;
    try {
        layer.eachLayer(function (featureLayer) {
            const props = featureLayer.feature?.properties;
            const name = pickAdm1Name(props) || props?.NAME_1;
            if (!name) return;
            const bounds = featureLayer.getBounds();
            const center = bounds.getCenter();
            labelLayer.addLayer(adm1Marker(center, escapeHtmlLite(name)));
            labelsGenerated++;
        });
        console.log(`ADM1 labels: ${labelsGenerated} markers from loaded admin1 vector layer`);
    } catch (err) {
        console.error('Error generating adm1 labels from vector layer:', err);
    }
}