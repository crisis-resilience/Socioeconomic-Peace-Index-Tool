/**
 * Conflict context narrative per country (from Conflict Context.docx).
 */

/** @typedef {{ title: string, paragraphs: string[] }} ConflictSection */
/** @typedef {{ countryLabel: string, profile: ConflictSection, trends: ConflictSection, intensive: ConflictSection, mockupIdeas: string[] }} ConflictContextContent */

/** @type {Record<string, ConflictContextContent>} */
export const CONFLICT_CONTEXT_BY_COUNTRY = {
    Kenya: {
        countryLabel: 'Kenya',
        profile: {
            title: "Kenya's Conflict Profile",
            paragraphs: [
                "Northeast corridor: Kenya's lowest SEPI-scoring counties, Mandera, Garissa, Turkana, Lamu, Samburu, and Isiolo, are simultaneously its most conflict-affected over 2016–2025. The structural overlap between low welfare and high conflict is not coincidental — pastoralist livelihood systems, cross-border dynamics, and al-Shabaab infiltration compound deprivation in the ASAL belt.",
                "Western highlands: Counties such as Vihiga, Nyamira, Bomet, and Kericho score consistently high on SEPI and record near-zero conflict. However, Baringo serves as a cautionary case: relatively high SEPI alongside elevated conflict, illustrating that aggregate welfare scores can mask localized insecurity in the North Rift corridor."
            ]
        },
        trends: {
            title: 'Conflict Trends',
            paragraphs: [
                "ACLED data shows conflict escalating in two distinct waves: a spike in 2017, and a sharper, more sustained escalation from 2022 peaking in 2023, remaining elevated through 2025.",
                "The 2017 spike reflects reported incidents of violence involving security forces and civilians concentrated in Nairobi's low-income settlements and western Nyanza counties, with a secondary cluster along the Somalia border.",
                "The 2022–2025 escalation reflects two concurrent processes: electoral and protest-related violence, particularly mob violence targeting local officials in Nairobi and southwestern counties, and intensified al-Shabaab activity along the northeastern border."
            ]
        },
        intensive: {
            title: 'Conflict-Intensive Districts',
            paragraphs: [
                'Mandera: Highest conflict concentration, with three overlapping systems operating simultaneously — inter-clan competition, al-Shabaab infiltration, and cross-border dynamics with Ethiopia and Somalia.',
                'Garissa: Deteriorating public security driven by violent criminality and al-Shabaab attacks, despite an absence of large-scale communal violence.',
                'Lamu: Among the highest per-capita events and fatalities, linked to al-Shabaab targeting of LAPSSET infrastructure. Its small population produces an outsized per-capita fatality rate.',
                'Nairobi: Primarily elite-sponsored urban political violence, with the highest absolute event count but lowest per-capita rate among the five regions with most conflict events.'
            ]
        },
        mockupIdeas: [
            'Dual-map layout: SEPI choropleth beside conflict events (latest year) with linked district selection.',
            'County profile cards: SEPI score, pillar mini-bars, and 2016–2025 conflict sparkline per county.',
            'Northeast vs. western comparison strip chart for events and fatalities per 100k.',
            'Timeline brush control synced between map year slider and report trend charts.'
        ]
    },
    Somalia: {
        countryLabel: 'Somalia',
        profile: {
            title: "Somalia's Conflict Profile",
            paragraphs: [
                "South-central contested regions: Somalia's lowest-SEPI regions, Lower Shabelle, Bay, Middle Shabelle, Lower Juba, and Hiraan, are simultaneously its most conflict-intensive over 2016–2025. Al-Shabaab territorial presence maps closely onto the lower SEPI tier.",
                "Somaliland and Puntland: Awdal, Woqooyi Galbeed, Togdheer, and Nugaal are the lowest-conflict regions and score substantially higher on SEPI. The autonomous governance structures of Somaliland and Puntland appear associated with both lower conflict density and higher welfare indicators."
            ]
        },
        trends: {
            title: 'Conflict Trends',
            paragraphs: [
                "Somalia recorded between 2,284 and 4,377 conflict events annually over 2016–2025. The period from 2022 marks a qualitative shift. The first stage of President Mohamud's August 2022 offensive produced a temporary reduction in al-Shabaab-held territory before a renewed escalation cycle.",
                "Humanitarian and conflict dynamics are deeply intertwined. Between 2021 and 2023, Somalia endured its most severe drought in recorded history following five consecutive failed rainy seasons, compounding displacement and food insecurity in south-central regions.",
                "The sharpest escalation came in April 2025, when al-Shabaab launched a sweeping offensive across central Somalia, seizing successive SNA towns and largely encircling Mogadishu by June 2025."
            ]
        },
        intensive: {
            title: 'Conflict-Intensive Regions',
            paragraphs: [
                "Lower Shabelle is Somalia's most conflict-intensive region, recording 462 battle events between January and November 2024, the highest nationally.",
                "Banadir/Mogadishu is the second-highest conflict region and a persistent al-Shabaab target. Al-Shabaab maintains operatives within the city, exploiting Mogadishu's fragmented 17-district administrative structure.",
                "Lower Juba: Despite an overall reduction in battles, al-Shabaab violence targeting civilians increased 65% in 2024, with the group accusing civilians of cooperating with security forces."
            ]
        },
        mockupIdeas: [
            'North–south split dashboard: mean SEPI and conflict totals for Puntland/Somaliland vs. south-central clusters.',
            'Battle vs. civilian-targeting stacked bars by region for the latest ACLED year.',
            'Displacement overlay toggle to contextualize food-security and per-capita conflict metrics in Gedo and Lower Shabelle.',
            'Monthly event heat calendar for Mogadishu and Lower Shabelle.'
        ]
    },
    South_Sudan: {
        countryLabel: 'South Sudan',
        profile: {
            title: 'SEPI–Conflict Alignment',
            paragraphs: [
                "The oil-producing states of Jonglei, Unity, and Upper Nile are simultaneously South Sudan's most conflict-intensive and among its worst performers on welfare indicators. Conflict has eroded health, education, and food-security capacity in the Greater Upper Nile.",
                "Equatoria states and western periphery: lower conflict, higher welfare baseline, but structurally fragile. The Equatoria states and Western Bahr el Ghazal record both higher SEPI scores and lower ACLED event counts, yet remain vulnerable to spillover from the re-escalation in the north."
            ]
        },
        trends: {
            title: 'Conflict Trends',
            paragraphs: [
                "South Sudan's conflict follows three phases shaped by civil war and successive peace agreements. The 2016–2017 peak reached 4,855 fatalities at the height of SSPDF–SPLM-IO fighting.",
                "From 2025, the conflict entered acute re-escalation where political tension and violence have significantly escalated since the beginning of 2025. Between December 2025 and January 2026, large-scale clashes resumed across Jonglei, Unity, and Warrap."
            ]
        },
        intensive: {
            title: 'Conflict-Intensive States',
            paragraphs: [
                'Jonglei: Most conflict-intensive state by total events and fatalities. Site of large-scale Nuer–Dinka–Murle clashes and the epicentre of the 2025–2026 re-escalation.',
                'Warrap: Highest per-capita fatality rate among the top five states. ACLED documents it as an elite proxy war zone, where NSS–SSPDF factional competition transformed inter-clan raids into coordinated violence.',
                'Unity: Between November 2021 and July 2022, ACLED recorded 110 armed clashes involving Haak Nuer and Dok Nuer militias in and around Leer County, resulting in over 290 fatalities.'
            ]
        },
        mockupIdeas: [
            'State comparison matrix: SEPI, each pillar, events, and fatalities per 100k for top five conflict states.',
            'Phase timeline (2016–2017 peak, R-ARCSS lull, 2025 re-escalation) annotated on national fatality chart.',
            'Oilfield proximity layer crossed with welfare collapse indicators in Unity and Upper Nile.',
            'Per-capita vs. absolute event toggle to highlight Warrap and Jonglei dynamics.'
        ]
    }
};

export function getConflictContextContent(country) {
    return CONFLICT_CONTEXT_BY_COUNTRY[country] || null;
}

export function getCountryDisplayLabel(country) {
    const ctx = CONFLICT_CONTEXT_BY_COUNTRY[country];
    if (ctx) return ctx.countryLabel;
    if (country === 'South_Sudan') return 'South Sudan';
    return country || 'Unknown';
}
