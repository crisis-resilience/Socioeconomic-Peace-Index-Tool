// basemaps.js - Manages different base map options through a custom control

/**
 * Define the different basemap layers with more reliable sources
 */
export const basemaps = {
    // Standard basemaps
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),

    // Carto basemaps (reliable sources)
    cartoLight: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }),

    // Esri basemaps (very reliable)
    esriWorldImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }),

    // Humanitarian style
    osmHOT: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
    }),

    // Stadia Maps (newer reliable source)
    stadiaMaps: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }),

    stadiaMapsDark: L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    })
};

// List of basemaps for the selector dropdown
export const basemapOptions = [
    { value: 'osm', label: 'OpenStreetMap' },
    { value: 'cartoLight', label: 'Carto Light' },
    { value: 'esriWorldImagery', label: 'ESRI Satellite Imagery' },
    { value: 'osmHOT', label: 'Humanitarian' },
    // { value: 'stadiaMaps', label: 'Stadia Maps' },
    // { value: 'stadiaMapsDark', label: 'Stadia Maps Dark' },
];

/**
 * Function to add the default basemap to the map
 * @param {Object} map - Leaflet map instance
 */
export function addDefaultBasemap(map) {
    basemaps.cartoLight.addTo(map);
}

/**
 * Custom Leaflet Control for Basemap Selection
 */
export const BasemapControl = L.Control.extend({
    options: {
        position: 'topright' // Position of the control on the map
    },

    onAdd: function (map) {
        // Create a container for the control
        const container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-bar basemap-control');
        container.title = 'Change basemap';

        // Create a select dropdown
        const select = L.DomUtil.create('select', 'basemap-select', container);

        // Add a label
        const label = L.DomUtil.create('label', 'basemap-label', container);
        label.textContent = 'Basemap:';
        label.htmlFor = 'basemap-select';

        // Position the label before the select element
        container.insertBefore(label, select);

        // Add options to the select dropdown
        basemapOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });

        // Set initial selected value
        select.value = 'cartoLight';  // Match the default basemap

        // Handle basemap change
        L.DomEvent.on(select, 'change', function () {
            const selectedBasemap = select.value;

            // Remove all basemaps before adding the selected one
            Object.values(basemaps).forEach(layer => {
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            });

            // Add the selected basemap
            basemaps[selectedBasemap].addTo(map);
        });

        // Disable map interactions when interacting with the control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    }
});
