/**
 * Country report narrative copy from Final_Files_For_Analysis/* Report.docx
 */

/** @typedef {{ name: string, description: string }} ReportActor */
/** @typedef {{ title: string, body: string }} RegionCallout */
/** @typedef {{ countryLabel: string, conflictAnalysisTitle?: string, mainActors: ReportActor[], strongRegions: { intro?: string, callouts?: RegionCallout[], paragraphs: string[] }, weakRegions: { callouts?: RegionCallout[], tableFirst?: boolean, paragraphs: string[] }, resilience: { title?: string, paragraphs: string[] } }} CountryReportNarrative */

/** @type {Record<string, CountryReportNarrative>} */
export const COUNTRY_REPORT_NARRATIVE = {
    Kenya: {
        countryLabel: 'Kenya',
        conflictAnalysisTitle: 'Conflict Analysis',
        mainActors: [
            {
                name: 'Al-Shabaab and Al-Hijra',
                description:
                    'Exploitation of marginalisation and youth unemployment driving recruitment and destabilisation, primarily along the Kenya–Somalia border and in Nairobi.'
            },
            {
                name: 'Communal militias',
                description:
                    'Persistent activity along ethnic and clan lines driving pastoralist and resource conflicts across northern and eastern counties, enabled by small arms proliferation.'
            },
            {
                name: 'Security forces',
                description:
                    'Documented corruption and heavy-handed operations deepening community grievances.'
            },
            {
                name: 'Political elites',
                description:
                    'Competition for political office and resource allocation intensifying along ethnic and clan lines, particularly around elections.'
            }
        ],
        strongRegions: {
            paragraphs: [
                'Higher SEPI score counties cluster in two zones: western Kenya (Kisumu, Vihiga, Kisii, Nyamira, Kakamega, Siaya, Homa Bay, Migori) and the Mt. Kenya highlands (Nyeri, Tharaka-Nithi, Embu, Kirinyaga, Murang\'a). Both zones share high-rainfall agriculture, near-zero IPC monitoring, and very low conflict intensity.'
            ]
        },
        weakRegions: {
            tableFirst: true,
            paragraphs: [
                'Mandera is a severe outlier: all pillars except education collapse—food security 0.000 (active IPC crisis), economic 0.000 (extreme poverty), health 0.046.',
                'The 10 counties with the lowest SEPI scores are all in the arid/semi-arid north and northeast; a geographic concentration suggesting structural rather than county-specific factors.'
            ]
        },
        resilience: {
            title: 'Sources of Resilience',
            paragraphs: [
                'The establishment of county-level administrations has expanded the state-building process into previously marginalised areas, with devolved funds enabling greater local service delivery and conflict mitigation capacity.',
                'In 2023, a multi-agency operation—Operation Maliza Uhalifu—was launched across the North Rift counties combining the Kenya Defence Forces and National Police Service to restore security and support voluntary disarmament across Elgeyo Marakwet, Baringo, Turkana, Samburu, and West Pokot counties.'
            ]
        }
    },
    Somalia: {
        countryLabel: 'Somalia',
        mainActors: [
            {
                name: 'Al-Shabaab',
                description:
                    "Documented exploitation of governance deficits and humanitarian vulnerabilities sustaining coordinated operations, controlling roughly 30 percent of Somalia's territory."
            },
            {
                name: 'Communal militias',
                description:
                    'Persistent inter-clan conflict over scarce resources driving violence across multiple regions, with dual roles emerging as both supporters of government counter-insurgency operations and, at times, actors susceptible to Al-Shabaab influence or opposition to government forces.'
            },
            {
                name: 'Political elites and security forces',
                description:
                    'Limited state capacity and political polarization confining government control largely to Mogadishu, with constitutional issues and cyclical electoral crises deepening institutional fragility.'
            }
        ],
        strongRegions: {
            paragraphs: [
                'All five top regions fall under Somaliland or Puntland governance, entities that have maintained institutional continuity since the early post-conflict period. This relatively long-term stability may signal an enabling environment for gradual recovery in economic and service delivery systems.',
                'Economic scores stand out: Awdal driven by livestock export economies; Bari driven by Bosaso port trade and commercial activity; Nugaal as Puntland\'s administrative capital (Garowe). The data suggests that in these top-performing regions, strong economic performance may act as a counterbalance to other weaknesses.',
                'Nugaal: ranking may overstate current resilience; 2024–2025 drought left wells dried up, likely not captured in SEPI data.',
                'Woqooyi Galbeed leads education nationally, reflecting Hargeisa\'s role as Somaliland\'s de facto capital with concentrated education services.'
            ]
        },
        weakRegions: {
            tableFirst: true,
            paragraphs: [
                'Middle Shabelle emerges as a significant outlier, exhibiting the lowest rates of poverty reduction and public service provision alongside a high frequency of conflict events. Al-Shabaab has retaken previously cleared towns; government military operations remain ongoing.',
                "Middle Juba's SEPI score reflects significant data limitations rather than a complete picture; restricted access in Al-Shabaab-controlled territories limits the availability and reliability of underlying indicators. As of 2022, Middle Juba held the lowest Human Development Index score of any subnational region globally.",
                'Bottom regions share the convergence of Al-Shabaab territorial control, protracted IDP displacement, and repeated climate shocks. These are not isolated failures—they represent compound, interacting crises.'
            ]
        },
        resilience: {
            title: 'Sources of Resilience',
            paragraphs: [
                'Somaliland regions remain conflict-free; their stability is rooted in over three decades of autonomous governance since 1991—the strongest institutional resilience case in the Somalia data.',
                'One of the most effective resilience mechanisms in the current period was clan militia mobilisation against al-Shabaab.',
                "The Defectors' Rehabilitation Programme, operating in Mogadishu, Baidoa, and Kismayo, has processed approximately 3,000 people since 2012. However, it faces critical limitations."
            ]
        }
    },
    South_Sudan: {
        countryLabel: 'South Sudan',
        mainActors: [
            {
                name: 'Political elites and security forces',
                description:
                    'Internal divisions, political polarization, and military weaknesses deepening institutional fragility, despite ongoing offensives and external support.'
            },
            {
                name: "Sudan People's Liberation Movement-in-Opposition (SPLM-IO)",
                description:
                    'Internal divisions and continued fighting undermining power-sharing agreements and contributing to sustained instability.'
            },
            {
                name: 'National Salvation Front (NAS)',
                description:
                    'Rejection of peace agreements driving continued armed activity, posing severe threat to civilians and the peace process.'
            },
            {
                name: 'Communal militias',
                description:
                    'Persistent inter-communal violence along ethnic and clan lines driving cattle raiding and land disputes, at times supported by national elites.'
            },
            {
                name: 'Dinka, Equatorian, and other ethnic communities',
                description:
                    'Perceived Dinka dominance and Equatorian marginalization intensifying competition over land and political representation, at times driving aspirations for secession and active resistance.'
            }
        ],
        strongRegions: {
            callouts: [
                {
                    title: 'Central Equatoria',
                    body: 'Leads on health reflecting capital-city healthcare concentration. Its lower food security score likely reflects the presence of large IDP populations in Juba.'
                },
                {
                    title: 'Western Bahr el Ghazal',
                    body: "Stands out for very low conflict intensity, described as one of South Sudan's most politically stable states. This stability environment may have an enabling effect on better functioning public services. However, food security score likely understates actual stress."
                }
            ],
            paragraphs: []
        },
        weakRegions: {
            tableFirst: false,
            callouts: [
                {
                    title: 'Unity',
                    body: "A severe outlier, having the lowest food security score in the country. Despite holding South Sudan's oil wealth, Unity's poverty reduction score and overall SEPI signal that oil revenue is not reaching the population's welfare."
                },
                {
                    title: 'Jonglei',
                    body: "Health collapse is the starkest single-pillar finding in South Sudan: the lowest health pillar score. Active military confrontation since late 2025 has damaged, looted, and shut down health facilities. 1.35 million people have lost access to health services. 73,000 face starvation in Jonglei and Upper Nile combined (March 2026 data)."
                },
                {
                    title: 'Upper Nile',
                    body: 'Has a very low poverty reduction pillar score despite Paloch oilfields. This suggests oil production revenue does not translate to local welfare indicators, consistent with IDP numbers and conflict over resource control rather than development.'
                }
            ],
            paragraphs: []
        },
        resilience: {
            title: 'Sources of Resilience',
            paragraphs: [
                'The R-ARCSS peace agreement of 2018 produced a measurable decline in violence and enabled the formation of a unity government in 2020.',
                'Traditional inter-communal mediation systems have historically limited escalation in some areas such as Lakes State but have been progressively undermined by elite capture of local administration, weapons proliferation, and the erosion of justice mechanisms.',
                'Civil society and faith-based organizations remain active despite shrinking civic space, with community peacebuilding groups across multiple states continuing to facilitate local dialogue and mitigate conflict as demonstrated in Central Equatoria as recently as 2024.'
            ]
        }
    }
};

/**
 * @param {string} country - Somalia | Kenya | South_Sudan
 */
export function getCountryReportNarrative(country) {
    return COUNTRY_REPORT_NARRATIVE[country] || null;
}
