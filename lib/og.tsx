import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { TileTone } from "@/components/product/product-card";
import { TAGS } from "@/lib/cache-tags";

/*
 * Link-preview cards (1200 × 630) in the house style: a specimen on its colour tile, the name set in
 * Chillax beside it, one line of facts and the wordmark. Rendered at build time with next/og.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const TILE: Record<TileTone, { bg: string; ink: string }> = {
  sapphire: { bg: "#1f4ab0", ink: "#ffffff" },
  frost: { bg: "#dde4e8", ink: "#111111" },
  stone: { bg: "#e2dfda", ink: "#111111" },
  ink: { bg: "#111111", ink: "#f4f4f4" },
};

// Chillax (Fontshare), as TrueType: the renderer can't read woff2.
const fonts = Promise.all([
  readFile(join(process.cwd(), "lib/og/Chillax-Regular.ttf")),
  readFile(join(process.cwd(), "lib/og/Chillax-Medium.ttf")),
]);

/**
 * A site image as a PNG data URL, scaled to fit `box`. Reads from /public at build time; falls back to
 * fetching it (an upload on Blob, or a picture added after the build).
 */
async function picture(src: string, box: { width: number; height: number }, fit: "contain" | "cover" = "contain") {
  let input: Buffer;
  if (/^https?:\/\//.test(src)) {
    input = Buffer.from(await (await fetch(src)).arrayBuffer());
  } else {
    try {
      input = await readFile(join(process.cwd(), "public", src));
    } catch {
      const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
      input = Buffer.from(await (await fetch(`${base}${src}`)).arrayBuffer());
    }
  }
  const png = await sharp(input).resize({ ...box, fit, withoutEnlargement: false, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

type Card = {
  title: string;
  /** One short line under the name: concentration, evidence grade, price. */
  facts: string[];
  /** Site path of the picture on the tile (a specimen cut-out, or a photograph with fit "cover"). */
  image: string;
  tone: TileTone;
  fit?: "contain" | "cover";
};

/**
 * The card as a JPEG response (WhatsApp skips previews much over 300 KB; a PNG of a photograph is 200–450 KB).
 * The bytes are cached, so each card is drawn once: at build, or on the first request after an edit.
 */
export async function ogCard(card: Card) {
  const jpeg = await drawCard(card);
  return new Response(new Blob([jpeg], { type: "image/jpeg" }), { headers: { "Content-Type": "image/jpeg" } });
}

async function drawCard({ title, facts, image, tone, fit = "contain" }: Card): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.catalog, TAGS.content);
  const tileWidth = 520;
  const pad = fit === "cover" ? 0 : 36;
  const [[regular, medium], art, mark] = await Promise.all([
    fonts,
    picture(image, { width: tileWidth - pad * 2, height: OG_SIZE.height - pad * 2 }, fit),
    picture("/images/brand/logo-wordmark.png", { width: 180, height: 44 }),
  ]);
  const t = TILE[tone];
  const size = title.length > 34 ? 56 : title.length > 22 ? 66 : 78;

  const response = new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", color: "#111111", fontFamily: "Chillax" }}>
        <div style={{ display: "flex", width: tileWidth, height: "100%", background: t.bg, alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
          <img src={art} alt="" style={{ objectFit: fit, width: tileWidth - pad * 2, height: OG_SIZE.height - pad * 2 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "64px 64px 56px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: size, fontWeight: 500, lineHeight: 1.02, letterSpacing: "-0.02em" }}>{title}</div>
            {facts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 30, lineHeight: 1.3, fontWeight: 400, color: "#3a3a3a" }}>
                {facts.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
          <img src={mark} alt="" style={{ width: 180, height: 44, objectFit: "contain", objectPosition: "left" }} />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Chillax", data: regular, weight: 400, style: "normal" },
        { name: "Chillax", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await response.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Uint8Array(jpeg);
}
