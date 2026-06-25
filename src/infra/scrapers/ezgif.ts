import { type ScraperResult, scraperError, scraperSuccess } from "./index";

const BASE = "https://ezgif.com";
const UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function parseUploadedPage(html: string): string {
  const match =
    html.match(/href=["'](\/webp-to-mp4\/[^"']+?\.webp\.html)["']/i) ||
    html.match(/action=["'](?:https:\/\/ezgif\.com)?(\/webp-to-mp4\/[^"']+?\.webp)["']/i) ||
    html.match(/\/webp-to-mp4\/([^"'<>]+?\.webp)\.html/i) ||
    html.match(/name=["']file["'][^>]*value=["']([^"']+?\.webp)["']/i);

  if (!match || !match[1]) {
    throw new Error("Gagal menemukan file hasil upload dari HTML EZGIF");
  }

  let file = match[1];
  if (file.startsWith("/webp-to-mp4/")) {
    file = file.replace("/webp-to-mp4/", "").replace(/\.html$/i, "");
  }
  return file;
}

function parseMp4Url(html: string): string {
  const match =
    html.match(/<source[^>]+src=["']([^"']+?\.mp4)["']/i) ||
    html.match(/href=["'](\/save\/[^"']+?\.mp4)["']/i) ||
    html.match(/(\/\/s\d+\.ezgif\.com\/tmp\/[^"'<>]+?\.mp4)/i);

  if (!match || !match[1]) {
    throw new Error("Gagal menemukan URL MP4 dari response EZGIF");
  }

  let url = match[1];
  if (url.startsWith("/save/")) {
    url = url.replace("/save/", "//s6.ezgif.com/tmp/");
  }
  if (url.startsWith("//")) {
    url = "https:" + url;
  } else if (url.startsWith("/")) {
    url = BASE + url;
  }
  return url;
}

export async function webpToMp4(webpBuffer: Buffer): Promise<ScraperResult<string>> {
  try {
    const uploadForm = new FormData();
    uploadForm.append("new-image", new Blob([webpBuffer], { type: "image/webp" }), "image.webp");
    uploadForm.append("new-image-url", "");
    uploadForm.append("upload", "Upload!");

    const uploadRes = await fetch(`${BASE}/webp-to-mp4`, {
      method: "POST",
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        origin: BASE,
        referer: `${BASE}/webp-to-mp4`,
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      body: uploadForm,
      redirect: "follow",
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload ke EZGIF gagal dengan status: ${uploadRes.status}`);
    }

    const uploadHtml = await uploadRes.text();
    const fileId = parseUploadedPage(uploadHtml);

    const convertPageRes = await fetch(`${BASE}/webp-to-mp4/${fileId}.html`, {
      method: "GET",
      headers: {
        "user-agent": UA,
        accept: "*/*",
        referer: `${BASE}/webp-to-mp4`,
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!convertPageRes.ok) {
      throw new Error(`Gagal membuka halaman konversi EZGIF: ${convertPageRes.status}`);
    }

    const convertForm = new FormData();
    convertForm.append("file", fileId);
    convertForm.append("background", "#ffffff");
    convertForm.append("backgroundc", "#ffffff");
    convertForm.append("repeat", "1");
    convertForm.append("ajax", "true");

    const convertRes = await fetch(`${BASE}/webp-to-mp4/${fileId}?ajax=true`, {
      method: "POST",
      headers: {
        "user-agent": UA,
        accept: "*/*",
        origin: BASE,
        referer: `${BASE}/webp-to-mp4/${fileId}.html`,
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      body: convertForm,
    });

    if (!convertRes.ok) {
      throw new Error(`Proses konversi EZGIF gagal dengan status: ${convertRes.status}`);
    }

    const convertHtml = await convertRes.text();
    const mp4Url = parseMp4Url(convertHtml);

    return scraperSuccess(mp4Url);
  } catch (error: unknown) {
    const err = error as Error;
    return scraperError(err.message || "Gagal melakukan konversi WebP ke MP4.");
  }
}
