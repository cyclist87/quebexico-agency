export interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  twitter: string;
  photoUrl: string;
  logoUrl: string;
  template: "modern" | "classic" | "minimal" | "bold" | "cleaning" | "sports" | "professional";
  primaryColor: string;
  ctaText: string;
  ctaUrl: string;
}

export function generateSignatureHtml(data: SignatureData): string {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push(`<a href="${data.linkedin}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">LinkedIn</a>`);
  if (data.facebook) socialLinks.push(`<a href="${data.facebook}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">Facebook</a>`);
  if (data.instagram) socialLinks.push(`<a href="${data.instagram}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">Instagram</a>`);
  if (data.twitter) socialLinks.push(`<a href="${data.twitter}" style="color:${data.primaryColor};text-decoration:none;">Twitter</a>`);

  const photoHtml = data.photoUrl 
    ? `<img src="${data.photoUrl}" alt="${data.fullName}" width="80" height="80" style="border-radius:50%;margin-right:16px;" />`
    : "";

  const logoHtml = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.company || 'Logo'}" height="40" style="max-width:120px;height:40px;object-fit:contain;" />`
    : "";

  const ctaHtml = (data.ctaText && data.ctaUrl)
    ? `<a href="${data.ctaUrl}" style="display:inline-block;background:${data.primaryColor};color:white;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;margin-top:12px;">${data.ctaText}</a>`
    : "";

  if (data.template === "modern") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
  ${data.logoUrl ? `<tr><td colspan="2" style="padding-bottom:12px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td style="vertical-align:top;padding-right:16px;">
      ${photoHtml}
    </td>
    <td style="vertical-align:top;">
      <div style="font-size:18px;font-weight:bold;color:${data.primaryColor};margin-bottom:4px;">${data.fullName}</div>
      <div style="font-size:14px;color:#666;margin-bottom:8px;">${data.jobTitle}${data.company ? ` | ${data.company}` : ""}</div>
      <div style="border-left:3px solid ${data.primaryColor};padding-left:12px;">
        ${data.email ? `<div style="margin-bottom:4px;"><a href="mailto:${data.email}" style="color:#333;text-decoration:none;">${data.email}</a></div>` : ""}
        ${data.phone ? `<div style="margin-bottom:4px;">${data.phone}</div>` : ""}
        ${data.website ? `<div style="margin-bottom:4px;"><a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a></div>` : ""}
      </div>
      ${socialLinks.length > 0 ? `<div style="margin-top:8px;">${socialLinks.join("")}</div>` : ""}
      ${ctaHtml ? `<div style="margin-top:12px;">${ctaHtml}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
  }

  if (data.template === "classic") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Georgia,serif;font-size:14px;color:#333;">
  ${data.logoUrl ? `<tr><td style="padding-bottom:12px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td>
      <div style="font-size:16px;font-weight:bold;margin-bottom:2px;">${data.fullName}</div>
      <div style="font-size:13px;color:#666;font-style:italic;margin-bottom:8px;">${data.jobTitle}${data.company ? `, ${data.company}` : ""}</div>
      <div style="border-top:1px solid #ccc;padding-top:8px;font-size:13px;">
        ${data.email ? `<span>Email: <a href="mailto:${data.email}" style="color:${data.primaryColor};">${data.email}</a></span><br/>` : ""}
        ${data.phone ? `<span>Tél: ${data.phone}</span><br/>` : ""}
        ${data.website ? `<span>Web: <a href="https://${data.website}" style="color:${data.primaryColor};">${data.website}</a></span>` : ""}
      </div>
      ${ctaHtml ? `<div style="margin-top:12px;">${ctaHtml}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
  }

  if (data.template === "minimal") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#555;">
  ${data.logoUrl ? `<tr><td style="padding-bottom:8px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td>
      <strong>${data.fullName}</strong> | ${data.jobTitle}<br/>
      ${[data.email, data.phone, data.website].filter(Boolean).join(" • ")}
      ${ctaHtml ? `<br/>${ctaHtml}` : ""}
    </td>
  </tr>
</table>`.trim();
  }

  if (data.template === "bold") {
    const boldCtaHtml = (data.ctaText && data.ctaUrl)
      ? `<a href="${data.ctaUrl}" style="display:inline-block;background:white;color:${data.primaryColor};padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:bold;margin-top:12px;">${data.ctaText}</a>`
      : "";
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
  ${data.logoUrl ? `<tr><td style="padding-bottom:12px;">${logoHtml}</td></tr>` : ""}
  <tr>
    <td style="background:${data.primaryColor};padding:16px;border-radius:8px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          ${data.photoUrl ? `<td style="vertical-align:top;padding-right:16px;"><img src="${data.photoUrl}" alt="${data.fullName}" width="90" height="90" style="border-radius:8px;border:3px solid white;" /></td>` : ""}
          <td style="vertical-align:top;color:white;">
            <div style="font-size:20px;font-weight:bold;margin-bottom:4px;">${data.fullName}</div>
            <div style="font-size:14px;opacity:0.9;margin-bottom:12px;">${data.jobTitle}${data.company ? ` @ ${data.company}` : ""}</div>
            ${data.email ? `<div style="margin-bottom:4px;"><a href="mailto:${data.email}" style="color:white;text-decoration:none;">${data.email}</a></div>` : ""}
            ${data.phone ? `<div style="margin-bottom:4px;">${data.phone}</div>` : ""}
            ${data.website ? `<div><a href="https://${data.website}" style="color:white;text-decoration:underline;">${data.website}</a></div>` : ""}
            ${boldCtaHtml ? `<div style="margin-top:12px;">${boldCtaHtml}</div>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
  }

  // Cleaning service template - fresh, clean design with service focus
  if (data.template === "cleaning") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
  <tr>
    <td style="background:linear-gradient(135deg, ${data.primaryColor}15, ${data.primaryColor}05);padding:16px;border-radius:8px;border-left:4px solid ${data.primaryColor};">
      <table cellpadding="0" cellspacing="0">
        <tr>
          ${data.photoUrl ? `<td style="vertical-align:top;padding-right:16px;"><img src="${data.photoUrl}" alt="${data.fullName}" width="70" height="70" style="border-radius:50%;border:2px solid ${data.primaryColor};" /></td>` : ""}
          <td style="vertical-align:top;">
            ${data.logoUrl ? `<div style="margin-bottom:8px;">${logoHtml}</div>` : ""}
            <div style="font-size:17px;font-weight:bold;color:${data.primaryColor};margin-bottom:2px;">${data.fullName}</div>
            <div style="font-size:13px;color:#666;margin-bottom:8px;">${data.jobTitle}${data.company ? ` - ${data.company}` : ""}</div>
            <div style="font-size:13px;">
              ${data.phone ? `<div style="margin-bottom:3px;">📞 ${data.phone}</div>` : ""}
              ${data.email ? `<div style="margin-bottom:3px;">✉️ <a href="mailto:${data.email}" style="color:${data.primaryColor};text-decoration:none;">${data.email}</a></div>` : ""}
              ${data.website ? `<div>🌐 <a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a></div>` : ""}
            </div>
            ${socialLinks.length > 0 ? `<div style="margin-top:8px;">${socialLinks.join("")}</div>` : ""}
            ${ctaHtml ? `<div style="margin-top:10px;">${ctaHtml}</div>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
  }

  // Sports club template - dynamic, energetic design
  if (data.template === "sports") {
    const sportCtaHtml = (data.ctaText && data.ctaUrl)
      ? `<a href="${data.ctaUrl}" style="display:inline-block;background:${data.primaryColor};color:white;padding:10px 20px;border-radius:25px;text-decoration:none;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${data.ctaText}</a>`
      : "";
    return `
<table cellpadding="0" cellspacing="0" style="font-family:'Segoe UI',Arial,sans-serif;font-size:14px;">
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0">
        <tr>
          ${data.photoUrl ? `<td style="vertical-align:top;padding-right:16px;"><img src="${data.photoUrl}" alt="${data.fullName}" width="85" height="85" style="border-radius:50%;border:3px solid ${data.primaryColor};" /></td>` : ""}
          <td style="vertical-align:top;">
            ${data.logoUrl ? `<div style="margin-bottom:10px;">${logoHtml}</div>` : ""}
            <div style="font-size:20px;font-weight:800;color:#1a1a1a;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px;">${data.fullName}</div>
            <div style="font-size:14px;color:${data.primaryColor};font-weight:600;margin-bottom:10px;">${data.jobTitle}${data.company ? ` | ${data.company}` : ""}</div>
            <div style="border-top:2px solid ${data.primaryColor};padding-top:10px;font-size:13px;color:#555;">
              ${data.email ? `<div style="margin-bottom:4px;"><a href="mailto:${data.email}" style="color:#333;text-decoration:none;">${data.email}</a></div>` : ""}
              ${data.phone ? `<div style="margin-bottom:4px;">${data.phone}</div>` : ""}
              ${data.website ? `<div><a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;font-weight:600;">${data.website}</a></div>` : ""}
            </div>
            ${socialLinks.length > 0 ? `<div style="margin-top:10px;">${socialLinks.join("")}</div>` : ""}
            ${sportCtaHtml ? `<div style="margin-top:12px;">${sportCtaHtml}</div>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
  }

  // Professional template - elegant corporate design
  if (data.template === "professional") {
    return `
<table cellpadding="0" cellspacing="0" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#2d2d2d;">
  <tr>
    <td style="border-bottom:2px solid ${data.primaryColor};padding-bottom:12px;">
      ${data.logoUrl ? logoHtml : ""}
    </td>
  </tr>
  <tr>
    <td style="padding-top:12px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          ${data.photoUrl ? `<td style="vertical-align:top;padding-right:20px;"><img src="${data.photoUrl}" alt="${data.fullName}" width="75" height="75" style="border-radius:4px;" /></td>` : ""}
          <td style="vertical-align:top;">
            <div style="font-size:18px;font-weight:600;color:#1a1a1a;margin-bottom:2px;">${data.fullName}</div>
            <div style="font-size:14px;color:${data.primaryColor};margin-bottom:10px;">${data.jobTitle}</div>
            ${data.company ? `<div style="font-size:13px;color:#666;margin-bottom:10px;font-weight:500;">${data.company}</div>` : ""}
            <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;">
              ${data.email ? `<tr><td style="padding-right:8px;color:#999;">E</td><td><a href="mailto:${data.email}" style="color:#2d2d2d;text-decoration:none;">${data.email}</a></td></tr>` : ""}
              ${data.phone ? `<tr><td style="padding-right:8px;color:#999;">T</td><td>${data.phone}</td></tr>` : ""}
              ${data.website ? `<tr><td style="padding-right:8px;color:#999;">W</td><td><a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a></td></tr>` : ""}
            </table>
            ${socialLinks.length > 0 ? `<div style="margin-top:10px;">${socialLinks.join("")}</div>` : ""}
            ${ctaHtml ? `<div style="margin-top:12px;">${ctaHtml}</div>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
  }

  return "";
}

export async function copySignatureToClipboard(html: string): Promise<{ success: boolean; asHtml: boolean }> {
  try {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const success = document.execCommand('copy');
    
    if (selection) {
      selection.removeAllRanges();
    }
    document.body.removeChild(container);

    if (success) {
      return { success: true, asHtml: true };
    }
    
    const blob = new Blob([html], { type: "text/html" });
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": blob,
        "text/plain": new Blob([html], { type: "text/plain" }),
      }),
    ]);
    return { success: true, asHtml: true };
  } catch {
    await navigator.clipboard.writeText(html);
    return { success: true, asHtml: false };
  }
}
