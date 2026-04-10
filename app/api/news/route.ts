import { NextRequest, NextResponse } from "next/server";

const CATEGORY_URLS: Record<string, string> = {
  すべて: "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja",
  テクノロジー: "https://news.google.com/rss/search?q=テクノロジー&hl=ja&gl=JP&ceid=JP:ja",
  ビジネス: "https://news.google.com/rss/search?q=ビジネス経済&hl=ja&gl=JP&ceid=JP:ja",
  スポーツ: "https://news.google.com/rss/search?q=スポーツ&hl=ja&gl=JP&ceid=JP:ja",
  科学: "https://news.google.com/rss/search?q=科学技術&hl=ja&gl=JP&ceid=JP:ja",
  エンタメ: "https://news.google.com/rss/search?q=エンターテインメント&hl=ja&gl=JP&ceid=JP:ja",
};

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim();
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function parseRSS(xml: string) {
  const items: Array<{
    title: string;
    link: string;
    pubDate: string;
    source: string;
    sourceUrl: string;
  }> = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const rawTitle = extractTag(item, "title");
    const source = extractTag(item, "source");
    const sourceUrl = extractAttr(item, "source", "url");

    // Google NewsのタイトルはXML文字参照をデコードする
    const title = rawTitle
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // リンクは <link> タグが CDATA ではなくテキストノード
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : "";

    const pubDate = extractTag(item, "pubDate");

    items.push({ title, link, pubDate, source, sourceUrl });
  }

  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "すべて";

  const feedUrl = CATEGORY_URLS[category] ?? CATEGORY_URLS["すべて"];

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "RSSフィードの取得に失敗しました" }, { status: 500 });
    }

    const xml = await res.text();
    const articles = parseRSS(xml);

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "ネットワークエラー" }, { status: 500 });
  }
}
