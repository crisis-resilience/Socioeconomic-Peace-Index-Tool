/**
 * Country dashboard narrative for Overall Peace Index (Active Layers panel).
 * Sourced from data/Dashboards/*.docx — text only (no tables/figures).
 */

/** @typedef {{ title: string, body: string }} DashboardFactor */
/** @typedef {{ countryLabel: string, spatialPatternTitle: string, spatialPatternBody: string, explainTitle: string, factors: DashboardFactor[] }} SepiDashboardContent */

/** @type {Record<string, SepiDashboardContent>} */
export const SEPI_DASHBOARD_BY_COUNTRY = {
    Kenya: {
        countryLabel: 'Kenya',
        spatialPatternTitle: 'West & Central Highlands vs. Arid North',
        spatialPatternBody:
            "Kenya's SEPI map points to a concentration of regions with high socioeconomic capacity in the Lake Victoria basin and central highlands, with ASAL (arid/semi-arid) counties in the north and northeast consistently in the lower SEPI tier. This is not a simple north-south line; it more closely follows the rainfall and livelihood gradient.",
        explainTitle: 'What might explain the SEPI Score divide?',
        factors: [
            {
                title: 'Livelihoods & geography',
                body: 'The northern and northeastern counties are primarily pastoralist economies, highly exposed to drought cycles. Counties with reliable rainfall (western, central) support diversified agriculture that buffers welfare shocks.'
            },
            {
                title: 'Conflict density',
                body: "The northeast functions as al-Shabaab's primary infiltration zone. Mandera held the highest al-Shabaab event count in Kenya in 2021–22. Samburu, Baringo, Isiolo, West Pokot, Laikipia and Elgeyo-Marakwet sit in the North Rift conflict corridor targeted by Operation Maliza Uhalifu against pastoralist militias."
            },
            {
                title: 'Food security',
                body: 'IPC monitoring shows active Phase 3+ crisis populations in the ASAL counties (Mandera, Turkana, Marsabit), while most western and central counties fall below the IPC monitoring threshold.'
            }
        ]
    },
    Somalia: {
        countryLabel: 'Somalia',
        spatialPatternTitle: 'North vs. South-Central',
        spatialPatternBody:
            "Somalia's SEPI map suggests a pronounced North-South divide. Puntland (Bari, Nugaal) and Somaliland (Awdal, Woqooyi Galbeed, Togdheer, Sanaag) regions dominate the upper end of the index; South-Central regions form the lower-scoring cluster.",
        explainTitle: 'What might explain the divide?',
        factors: [
            {
                title: 'Governance stability',
                body: "Somaliland and Puntland's institutional continuity may point to conditions that supported gradual recovery. South-Central Somalia's prolonged conflict likely disrupted public infrastructure and service delivery."
            },
            {
                title: 'Conflict geography',
                body: "The data shows a stark conflict gradient. Al-Shabaab's territorial presence is overwhelmingly south-central. This conflict density directly maps onto the lower SEPI tier."
            },
            {
                title: 'Economic base',
                body: 'Northern regions built on livestock export economies and port-based trade sustained livelihoods. Southern agricultural zones had their supply chains repeatedly disrupted by conflict.'
            },
            {
                title: 'Climate',
                body: 'Climate is not the primary driver of the North–South divide, but it is not neutral either. Higher SEPI tier performs noticeably higher on the climate pillar compared to the regions scoring lower on the index. These findings could indicate a trend where regions with lower socioeconomic capacity face compounding pressure from both weakened socioeconomic capacity and less favourable land and environmental conditions.'
            },
            {
                title: 'Displacement',
                body: 'In regions with large-scale outward displacement, such as Gedo and Lower Shabelle, SEPI scores may overstate actual conditions: relocation of the most vulnerable populations to IDP receiving areas like Banadir artificially improves food security and per-capita conflict metrics. Scores for these regions should be read alongside displacement data, not in isolation.'
            }
        ]
    },
    South_Sudan: {
        countryLabel: 'South Sudan',
        spatialPatternTitle: 'Equatorial States vs. Greater Upper Nile & Lakes',
        spatialPatternBody:
            "South Sudan's SEPI map points to the Equatorial states in the south and Western Bahr el Ghazal in the northwest as the relatively higher SEPI score regions, contrasted against the Greater Upper Nile states (Upper Nile, Jonglei, Unity) and Lakes.",
        explainTitle: 'What might explain the divide?',
        factors: [
            {
                title: 'Civil war geography',
                body: 'The 2013–2018 civil war\'s most devastating atrocities concentrated in Unity, Jonglei, and Upper Nile, regions where the SEPI now records the deepest collapse. The Equatorial states followed a different conflict trajectory and retained more institutional and livelihood capacity.'
            },
            {
                title: 'Land productivity',
                body: 'Equatorial states lie in tropical/subtropical zones with higher agricultural potential. The Greater Upper Nile states rely more on pastoralism and flood-dependent agriculture, livelihood systems more exposed to both conflict-driven displacement and climate variability.'
            },
            {
                title: 'Oil-conflict trap',
                body: "Unity and Upper Nile sit on South Sudan's main oilfields, yet rank last. The data points to a pattern where resource wealth intensifies conflict over control rather than generating local welfare, a dynamic that the SEPI captures through near-zero food security and health scores in these states."
            }
        ]
    }
};

/**
 * @param {string} country - Config country id (Somalia, Kenya, South_Sudan)
 * @returns {SepiDashboardContent | null}
 */
export function getSepiDashboardContent(country) {
    return SEPI_DASHBOARD_BY_COUNTRY[country] || null;
}

/**
 * @param {SepiDashboardContent} content
 * @returns {string}
 */
export function renderSepiDashboardHtml(content) {
    if (!content) return '';

    const factorsHtml = (content.factors || [])
        .map(
            (f) => `
            <div class="sepi-dashboard-factor">
                <div class="sepi-dashboard-factor-title">${escapeDashboardHtml(f.title)}</div>
                <p class="sepi-dashboard-factor-body">${escapeDashboardHtml(f.body)}</p>
            </div>
        `
        )
        .join('');

    return `
        <div class="sepi-dashboard-narrative">
            <div class="sepi-dashboard-section">
                <div class="sepi-dashboard-heading">Spatial pattern: ${escapeDashboardHtml(content.spatialPatternTitle)}</div>
                <p class="sepi-dashboard-lead">${escapeDashboardHtml(content.spatialPatternBody)}</p>
            </div>
            <div class="sepi-dashboard-section">
                <div class="sepi-dashboard-heading">${escapeDashboardHtml(content.explainTitle)}</div>
                ${factorsHtml}
            </div>
        </div>
    `;
}

function escapeDashboardHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
