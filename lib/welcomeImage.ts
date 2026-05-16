import * as sharp from "sharp";

export async function generateWelcomeImage(
  ppUrl: string | null,
  userName: string,
  groupName: string,
): Promise<Buffer> {
  let ppBuffer: Buffer;

  // 1. Ambil foto profil (kalau gagal/tidak ada, pakai avatar default)
  if (ppUrl) {
    try {
      const res = await fetch(ppUrl);
      const arr = await res.arrayBuffer();
      // Buat mask bulat
      const circleMask = Buffer.from(
        '<svg><circle cx="100" cy="100" r="100" fill="white" /></svg>',
      );
      ppBuffer = await sharp(Buffer.from(arr))
        .resize(200, 200, { fit: "cover" })
        .composite([{ input: circleMask, blend: "dest-in" }])
        .png()
        .toBuffer();
    } catch {
      ppBuffer = await createDefaultAvatar();
    }
  } else {
    ppBuffer = await createDefaultAvatar();
  }

  // 2. Buat background + teks dengan SVG (dirender Sharp)
  // Karakter & di HTML entitas
  const cleanUser = userName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cleanGroup = groupName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const bgSvg = `
    <svg width="800" height="400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e3c72;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2a5298;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#grad)" rx="20" ry="20" />
      <text x="400" y="270" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" font-weight="bold" text-anchor="middle">WELCOME</text>
      <text x="400" y="320" font-family="Arial, sans-serif" font-size="30" fill="#e0e0e0" text-anchor="middle">${cleanUser}</text>
      <text x="400" y="360" font-family="Arial, sans-serif" font-size="20" fill="#b0b0b0" text-anchor="middle">To ${cleanGroup}</text>
    </svg>
  `;

  // 3. Gabung background dengan foto profil
  return await sharp(Buffer.from(bgSvg))
    .composite([
      { input: ppBuffer, top: 40, left: 300 }, // Posisi PP di tengah atas
    ])
    .png()
    .toBuffer();
}

async function createDefaultAvatar(): Promise<Buffer> {
  const circleMask = Buffer.from('<svg><circle cx="100" cy="100" r="100" fill="white" /></svg>');
  const base = await sharp({
    create: { width: 200, height: 200, channels: 4, background: { r: 80, g: 80, b: 80, alpha: 1 } },
  })
    .png()
    .toBuffer();

  return await sharp(base)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();
}
