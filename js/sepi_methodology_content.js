/**
 * SEPI methodology copy for reports (e.g. Generate Report methodology section).
 * Removed from the Welcome tab UI but kept here for reuse.
 */

export const SEPI_WORKED_EXAMPLE_TITLE = 'About SEPI — Worked Example';

/**
 * HTML fragment: education indicators → normalization → pillar mean → geometric mean → overall SEPI.
 */
export const SEPI_WORKED_EXAMPLE_HTML = `
    <div class="sepi-worked-example" style="background:#ffffff; border:1px solid #d4d6d8; border-radius:0; padding:10px; margin-bottom:12px;">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
            <div style="background:#fafafa; border:1px solid #d4d6d8; border-radius:0; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#000000; font-size:11px;">Primary attendance</div>
                <div style="font-size:11px; color:#55606e;">84% (range 42–96%)</div>
            </div>
            <div style="background:#fafafa; border:1px solid #d4d6d8; border-radius:0; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#000000; font-size:11px;">Secondary attendance</div>
                <div style="font-size:11px; color:#55606e;">68% (range 28–88%)</div>
            </div>
            <div style="background:#fafafa; border:1px solid #d4d6d8; border-radius:0; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#000000; font-size:11px;">School access</div>
                <div style="font-size:11px; color:#55606e;">91% (range 55–98%)</div>
            </div>
        </div>

        <div style="text-align:center; font-size:11px; color:#55606e; margin:4px 0;">↓ min-max normalize to [0,1]</div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#006eb5; font-size:20px; line-height:1;">0.78</div>
                <div style="font-size:11px; color:#006eb5;">normalized</div>
            </div>
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#006eb5; font-size:20px; line-height:1;">0.67</div>
                <div style="font-size:11px; color:#006eb5;">normalized</div>
            </div>
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#006eb5; font-size:20px; line-height:1;">0.84</div>
                <div style="font-size:11px; color:#006eb5;">normalized</div>
            </div>
        </div>

        <div style="text-align:center; font-size:11px; color:#55606e; margin:4px 0;">(0.78 + 0.67 + 0.84) / 3</div>

        <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:10px; text-align:center; margin:6px auto 8px; max-width:320px;">
            <div style="font-weight:700; color:#006eb5;">Education pillar score: 0.76</div>
            <div style="font-size:11px; color:#006eb5;">arithmetic mean of normalized indicators</div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-bottom:8px;">
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:6px; text-align:center; font-size:11px; color:#006eb5;"><strong>Food</strong><br>0.68</div>
            <div style="background:#e2edf8; border:1px solid #006eb5; border-radius:0; padding:6px; text-align:center; font-size:11px; color:#006eb5;"><strong>Education</strong><br>0.76</div>
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:6px; text-align:center; font-size:11px; color:#006eb5;"><strong>Health</strong><br>0.71</div>
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:6px; text-align:center; font-size:11px; color:#006eb5;"><strong>Economic</strong><br>0.55</div>
            <div style="background:#e2edf8; border:1px solid #b5d5f5; border-radius:0; padding:6px; text-align:center; font-size:11px; color:#006eb5;"><strong>Climate</strong><br>0.63</div>
        </div>

        <div style="text-align:center; font-size:11px; color:#55606e; margin:4px 0;">geometric mean of all five pillars</div>

        <div style="background:#006eb5; border-radius:0; padding:10px; text-align:center; margin:6px auto 0; max-width:280px;">
            <div style="font-weight:700; color:#ffffff;">Overall SEPI: 0.67</div>
            <div style="font-size:11px; color:#ffffff;">County X, Kenya · High performance range</div>
        </div>
    </div>
`;

/** Section heading + worked example block for methodology reports. */
export function renderSepiWorkedExampleSection() {
    return `
        <div style="font-size:12px; font-weight:700; color:#000000; letter-spacing:0.06em; margin:6px 0 8px; border-bottom:2px solid #006eb5; padding-bottom:5px;">${SEPI_WORKED_EXAMPLE_TITLE.toUpperCase()}</div>
        ${SEPI_WORKED_EXAMPLE_HTML}
    `;
}
