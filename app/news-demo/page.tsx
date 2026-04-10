"use client";

import { useState, useEffect } from "react";

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
}

const CATEGORIES = ["すべて", "テクノロジー", "ビジネス", "スポーツ", "科学", "エンタメ"];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}分前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

export default function NewsDemo() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/news?category=${encodeURIComponent(selectedCategory)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "ニュースの取得に失敗しました");
          setArticles([]);
        } else {
          setArticles(data.articles ?? []);
        }
      } catch {
        setError("ネットワークエラーが発生しました");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ニュースデモ</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Google ニュース (RSS)</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            Live
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
            <strong>エラー:</strong> {error}
          </div>
        )}

        {/* News List */}
        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {articles.length}件の記事
            </p>
            <div className="space-y-3">
              {articles.map((article, index) => (
                <a
                  key={index}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2">
                    {article.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    {article.sourceUrl && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(article.sourceUrl).hostname}&sz=16`}
                        alt=""
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {article.source}
                    </span>
                    {article.pubDate && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDate(article.pubDate)}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
