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
                "Northeast corridor: Kenya's lowest SEPI-scoring counties—Mandera, Garissa, Turkana, Lamu, Samburu, and Isiolo—are simultaneously its most conflict-affected over 2016–2025. The structural conditions SEPI measures closely overlap with conditions identified in conflict literature as conducive to al-Shabaab recruitment and pastoralist violence.",
                "Western highlands: Counties such as Vihiga, Nyamira, Bomet, and Kericho score consistently high on SEPI and record near-zero conflict. However, Baringo serves as a cautionary case: despite moderate SEPI scores, it experienced significant conflict escalation, suggesting that structural indicators alone do not capture the risk posed by small arms proliferation and organised armed groups."
            ]
        },
        trends: {
            title: 'Conflict Trends',
            paragraphs: [
                "ACLED data shows conflict escalating in two distinct waves: a spike in 2017, and a sharper, more sustained escalation from 2022 peaking in 2023, remaining elevated through 2025. Kenya experiences multiple, overlapping conflict systems—pastoralist, electoral, jihadist, and urban political.",
                "The 2017 spike reflects reported incidents of violence involving security forces and civilians concentrated in Nairobi's low-income settlements and western Nyanza counties, with a secondary component of protest-related violence.",
                "The 2022–2025 escalation reflects two concurrent processes: electoral and protest-related violence, particularly mob violence targeting local officials in Nairobi and southwestern counties, and a significant increase in al-Shabaab operations along the Kenya–Somalia border, with 2023 recording the highest number of al-Shabaab events in Kenya. Severe drought and food insecurity further exacerbated communal conflict in the north and east."
            ]
        },
        intensive: {
            title: 'Conflict-Intensive Districts',
            paragraphs: [
                'Mandera: Highest conflict concentration, with three overlapping systems operating simultaneously—inter-clan competition, al-Shabaab infiltration, and cross-border dynamics with Ethiopia and Somalia.',
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
                "South-central contested regions: Somalia's lowest-SEPI regions—Lower Shabelle, Bay, Middle Shabelle, Lower Juba, and Hiraan—are simultaneously its most conflict-intensive over 2016–2025. The structural conditions SEPI captures co-locate precisely with regions where al-Shabaab has sustained insurgent governance, extracting taxes and establishing shadow administrative structures known as Wilaayaats.",
                "Somaliland and Puntland: Awdal, Woqooyi Galbeed, Togdheer, and Nugaal are the lowest-conflict regions and score substantially higher on SEPI. The autonomous governance structures of Somaliland and Puntland have simultaneously improved service delivery and produced relative security stability. Puntland and Somaliland face mounting security threats as Al-Shabaab and ISIS experience a resurgence in the region, with displaced militant fighters moving northward to exploit growing political instability."
            ]
        },
        trends: {
            title: 'Conflict Trends',
            paragraphs: [
                'Somalia recorded between 2,284 and 4,377 conflict events annually over 2016–2025. The period from 2022 marks a qualitative shift. The first stage of President Mohamud\'s August 2022 "total war" against al-Shabaab, relying heavily on clan militia alliances, was described as the most effective offensive since 2016, expelling al-Shabaab from areas it had controlled for over a decade. However, the second phase saw limited success as al-Shabaab recaptured key towns in Mudug and Galgaduud, exploiting Somali National Army (SNA) leadership factionalism and clan militia defections.',
                'Humanitarian and conflict dynamics are deeply intertwined. Between 2021 and 2023, Somalia endured its most severe drought in recorded history following five consecutive failed rainy seasons—a crisis that al-Shabaab capitalized on by intercepting food supplies, destroying water sources, and increasing its seizure and taxation of livestock. By end-2024, an estimated 4.4 million people needed urgent food aid, and approximately half of 350,000 people displaced between January and October fled conflict specifically.',
                'The sharpest escalation came in April 2025, when al-Shabaab launched a sweeping offensive across central Somalia, seizing successive SNA towns and largely encircling Mogadishu by July. Three converging failures are reported to have driven the surge: a collapse in federal-state cooperation, a severely underfunded and politically undermined African Union Support and Stabilization Mission in Somalia, and a SNA critically degraded by years of attrition.'
            ]
        },
        intensive: {
            title: 'Conflict-Intensive Regions',
            paragraphs: [
                "Lower Shabelle is Somalia's most conflict-intensive region, recording 462 battle events between January and November 2024, the highest nationally.",
                "Banadir/Mogadishu is the second-highest conflict region and a persistent al-Shabaab target. Al-Shabaab maintains operatives within the city, exploiting Mogadishu's fragmented 17-district administration to target local officials. In 2024, following the deployment of stabilization forces that are part of SNA, battle events in the region decreased by 44%.",
                'Lower Juba: Despite an overall reduction in battles, al-Shabaab violence targeting civilians increased 65% in 2024, with the group accusing civilians of cooperating with security forces.'
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
                "The oil-producing states of Jonglei, Unity, and Upper Nile are simultaneously South Sudan's most conflict-intensive and among its worst performers on welfare indicators. Conflict here is driven primarily by political power dynamics and competition over oil revenues. The geography of violence follows oil fields and SSPDF–SPLM-IO rivalry, not primarily the geography of deprivation.",
                "Equatoria states and western periphery: lower conflict, higher welfare baseline, but structurally fragile. The Equatoria states and Western Bahr el Ghazal record both higher SEPI scores and substantially lower conflict counts. Their relative advantage reflects transport connectivity, proximity to more stable neighbouring markets, and less direct exposure to the civil war's oil-corridor frontlines."
            ]
        },
        trends: {
            title: 'Conflict Trends',
            paragraphs: [
                "South Sudan's conflict follows three phases shaped by civil war and successive peace agreements. The 2016–2017 peak reached 4,855 fatalities at the height of SSPDF–SPLM-IO fighting. The Khartoum Declaration of September 2018 produced a steep decline. Between 1 January 2013 and the signing of the Revitalised Agreement on the Resolution of the Conflict in the Republic of South Sudan (R-ARCSS) on 12 September 2018, there were conflict events in 718 distinct locations, compared to 1,720 between 13 September 2018 and 17 January 2025. South Sudan has experienced increasing violence in the wake of R-ARCSS, most of which is not straightforwardly connected to the recent civil war (2013–2018). Warrap, Lakes, and Jonglei in the central belt of the country have been the most severely affected.",
                'From 2025, the conflict entered acute re-escalation where political tension and violence have significantly escalated since the beginning of 2025. Between December 2025 and January 2026, violence in Jonglei state alone reportedly killed at least 200 people, including no fewer than 40 civilians, while forcing over 230,000 to flee their homes in less than a month.'
            ]
        },
        intensive: {
            title: 'Conflict-Intensive States',
            paragraphs: [
                'Jonglei: Most conflict-intensive state by total events and fatalities. Site of large-scale Nuer–Dinka–Murle clashes and the epicentre of the 2025–2026 re-escalation.',
                'Warrap: Highest per-capita fatality rate among the top five states. ACLED documents it as an elite proxy war zone, where NSS–SSPDF factional competition transformed inter-clan raiding into organised proxy warfare, peaking in August 2020.',
                'Unity: Between November 2021 and July 2022, ACLED recorded 110 armed clashes involving Haak Nuer and Dok Nuer militias in and around Leer County, resulting in over 290 fatalities. Adding to this unrest, historic flooding in 2019, 2021, and 2022 has transformed Unity State. The massive IDP camp in Bentiu houses over 100,000 people.'
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
