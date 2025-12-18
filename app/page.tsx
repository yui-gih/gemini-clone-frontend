"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add assistant message to chat
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "エラーが発生しました。もう一度お試しください。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#1e1e1e]">
      {/* Left Sidebar - Chat History */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            + 新しいチャット
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {[
              "機械学習とは何ですか？",
              "量子コンピューティングについて説明して",
              "Reactのベストプラクティス",
              "Pythonの学習方法",
              "AIの倫理について教えて",
            ].map((chat, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors truncate"
              >
                {chat}
              </button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ユーザー
            </span>
          </div>
        </div>
      </div>

      {/* Right Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              /* Welcome Message */
              <div className="text-center py-12">
                <h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  こんにちは、Geminiです
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  今日はどのようにお手伝いしましょうか？
                </p>
              </div>
            ) : (
              /* Conversation */
              <div className="space-y-6">
                {messages.map((message, index) => (
                  message.role === "user" ? (
                    /* User Message */
                    <div key={index} className="flex justify-end">
                      <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <p className="text-gray-800 dark:text-gray-200">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* AI Response */
                    <div key={index} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-800 dark:text-gray-200">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400">
                        入力中...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl px-5 py-3 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="メッセージを入力してください"
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-500"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
              </div>
              <button
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Geminiは不正確な情報を表示することがあります。回答内容をよく確認してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
