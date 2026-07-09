// Netlify auto-invokes any function named `submission-created` whenever
// a Netlify Form on this site is submitted — no webhook config needed.
// Docs: https://docs.netlify.com/forms/notifications/#custom-submission-notifications

const RESEND_API_URL = "https://api.resend.com/emails";

const BRAND = {
  purple: "#9B6FD4",
  bg: "#12141c",
  text: "#e8e6f0",
  muted: "#a7a3b8",
};

// Fields we don't want to print as "data rows" in the email
const HIDDEN_FIELDS = new Set(["form-name", "bot-field"]);

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildRows(data) {
  return Object.entries(data)
    .filter(([key]) => !HIDDEN_FIELDS.has(key))
    .map(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const safeValue = escapeHtml(value).replace(/\n/g, "<br>");
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #262a38;color:${BRAND.muted};font-size:13px;text-transform:uppercase;letter-spacing:0.04em;vertical-align:top;width:140px;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:12px 0 12px 16px;border-bottom:1px solid #262a38;color:${BRAND.text};font-size:15px;line-height:1.5;">
            ${safeValue || "<span style=\"color:#5c5972;\">—</span>"}
          </td>
        </tr>`;
    })
    .join("");
}

function buildEmailHtml({ formName, data }) {
  const rows = buildRows(data);

  return `
  <div style="background:${BRAND.bg};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:24px;">
          <table role="presentation">
            <tr>
              <td style="width:22px;height:22px;border-radius:6px;background:${BRAND.purple};"></td>
              <td style="padding-left:10px;color:${BRAND.text};font-size:16px;font-weight:600;">Parallax Labs</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#181b26;border:1px solid #262a38;border-radius:14px;padding:28px;">
          <p style="margin:0 0 4px;color:${BRAND.purple};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">
            New submission
          </p>
          <h1 style="margin:0 0 20px;color:${BRAND.text};font-size:20px;font-weight:600;">
            ${escapeHtml(formName)}
          </h1>
          <table role="presentation" width="100%" style="border-collapse:collapse;">
            ${rows}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top:20px;text-align:center;color:#5c5972;font-size:12px;">
          Sent automatically from parallaxlabs.netlify.app
        </td>
      </tr>
    </table>
  </div>`;
}

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    // Netlify wraps the submitted fields under payload.payload.data
    const { data, form_name: formName } = payload.payload || {};

    if (!data) {
      return { statusCode: 400, body: "No form data found" };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toAddress = process.env.NOTIFY_TO || "parallaxlabs.tech@gmail.com";
    // Resend rejects sends from unverified domains. Until a domain is verified
    // in the Resend dashboard, its sandbox address works with zero setup.
    // Once verified, set NOTIFY_FROM to e.g. "Parallax Labs <notifications@parallaxlabs.tech>".
    const fromAddress = process.env.NOTIFY_FROM || "Parallax Labs <onboarding@resend.dev>";

    if (!apiKey) {
      console.error("RESEND_API_KEY is not set — skipping branded email send.");
      return { statusCode: 200, body: "No RESEND_API_KEY configured; skipped." };
    }

    const subjectName = data.name ? ` from ${data.name}` : "";
    const html = buildEmailHtml({ formName: formName || "project-request", data });

    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        reply_to: data.email || undefined,
        subject: `New project request${subjectName} — Parallax Labs`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API error:", res.status, errText);
      return { statusCode: 502, body: `Resend error: ${errText}` };
    }

    return { statusCode: 200, body: "Email sent" };
  } catch (err) {
    console.error("submission-created function error:", err);
    return { statusCode: 500, body: "Internal error" };
  }
};