/**
 * SEPI methodology copy for reports (e.g. Generate Report methodology section).
 * Removed from the Welcome tab UI but kept here for reuse.
 */

export const SEPI_WORKED_EXAMPLE_TITLE = 'About SEPI — Worked Example';

/**
 * HTML fragment: education indicators → normalization → pillar mean → geometric mean → overall SEPI.
 */
export const SEPI_WORKED_EXAMPLE_HTML = `
    <div class="sepi-worked-example" style="background:#f2f3f1; border:1px solid #d8d9d6; border-radius:8px; padding:10px; margin-bottom:12px;">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
            <div style="background:#f4f1e9; border:1px solid #cbc8bf; border-radius:8px; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#4a4a4a; font-size:11px;">Primary attendance</div>
                <div style="font-size:11px; color:#6a6a6a;">84% (range 42–96%)</div>
            </div>
            <div style="background:#f4f1e9; border:1px solid #cbc8bf; border-radius:8px; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#4a4a4a; font-size:11px;">Secondary attendance</div>
                <div style="font-size:11px; color:#6a6a6a;">68% (range 28–88%)</div>
            </div>
            <div style="background:#f4f1e9; border:1px solid #cbc8bf; border-radius:8px; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#4a4a4a; font-size:11px;">School access</div>
                <div style="font-size:11px; color:#6a6a6a;">91% (range 55–98%)</div>
            </div>
        </div>

        <div style="text-align:center; font-size:11px; color:#777; margin:4px 0;">↓ min-max normalize to [0,1]</div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
            <div style="background:#d9ece6; border:1px solid #7cb9aa; border-radius:8px; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#1b6e5d; font-size:20px; line-height:1;">0.78</div>
                <div style="font-size:11px; color:#1b6e5d;">normalized</div>
            </div>
            <div style="background:#d9ece6; border:1px solid #7cb9aa; border-radius:8px; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#1b6e5d; font-size:20px; line-height:1;">0.67</div>
                <div style="font-size:11px; color:#1b6e5d;">normalized</div>
            </div>
            <div style="background:#d9ece6; border:1px solid #7cb9aa; border-radius:8px; padding:8px; text-align:center;">
                <div style="font-weight:700; color:#1b6e5d; font-size:20px; line-height:1;">0.84</div>
                <div style="font-size:11px; color:#1b6e5d;">normalized</div>
            </div>
        </div>

        <div style="text-align:center; font-size:11px; color:#777; margin:4px 0;">(0.78 + 0.67 + 0.84) / 3</div>

        <div style="background:#d9e7f5; border:1px solid #8db0d9; border-radius:8px; padding:10px; text-align:center; margin:6px auto 8px; max-width:320px;">
            <div style="font-weight:700; color:#245a93;">Education pillar score: 0.76</div>
            <div style="font-size:11px; color:#2f6ea8;">arithmetic mean of normalized indicators</div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-bottom:8px;">
            <div style="background:#e2edf8; border:1px solid #95b3d6; border-radius:8px; padding:6px; text-align:center; font-size:11px;"><strong>Food</strong><br>0.68</div>
            <div style="background:#e2edf8; border:1px solid #6e9ccf; border-radius:8px; padding:6px; text-align:center; font-size:11px;"><strong>Education</strong><br>0.76</div>
            <div style="background:#e2edf8; border:1px solid #95b3d6; border-radius:8px; padding:6px; text-align:center; font-size:11px;"><strong>Health</strong><br>0.71</div>
            <div style="background:#e2edf8; border:1px solid #95b3d6; border-radius:8px; padding:6px; text-align:center; font-size:11px;"><strong>Economic</strong><br>0.55</div>
            <div style="background:#e2edf8; border:1px solid #95b3d6; border-radius:8px; padding:6px; text-align:center; font-size:11px;"><strong>Climate</strong><br>0.63</div>
        </div>

        <div style="text-align:center; font-size:11px; color:#777; margin:4px 0;">geometric mean of all five pillars</div>

        <div style="background:#dfead2; border:1px solid #90b274; border-radius:10px; padding:10px; text-align:center; margin:6px auto 0; max-width:280px;">
            <div style="font-weight:700; color:#355a1f;">Overall SEPI: 0.67</div>
            <div style="font-size:11px; color:#426d28;">County X, Kenya · High performance range</div>
        </div>
    </div>
`;

/** Section heading + worked example block for methodology reports. */
export function renderSepiWorkedExampleSection() {
    return `
        <div style="font-size:12px; font-weight:700; color:#6d6d6d; letter-spacing:0.06em; margin:6px 0 8px; border-bottom:1px solid #d9d9d9; padding-bottom:5px;">${SEPI_WORKED_EXAMPLE_TITLE.toUpperCase()}</div>
        ${SEPI_WORKED_EXAMPLE_HTML}
    `;
}
