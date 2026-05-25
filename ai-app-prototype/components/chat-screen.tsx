"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  Zap, 
  Menu,
  X,
  Clock,
  User,
  Bot,
  LogOut,
  Settings,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

interface ChatScreenProps {
  onLogout: () => void;
  onAdminClick?: () => void;
  isAdmin?: boolean;
  isUnlimited?: boolean;
}

export function ChatScreen({ onLogout, onAdminClick, isAdmin, isUnlimited = false }: ChatScreenProps) {
  const [isPro, setIsPro] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(7);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatHistory: ChatHistory[] = [
    { 
      id: "1", 
      title: "数学の微分問題", 
      preview: "関数f(x)=x³-3x²+2の極値を...", 
      timestamp: new Date(2024, 0, 15),
      messages: [
        { id: "h1-1", role: "user", content: "関数f(x)=x³-3x²+2の極値を求めてください。", timestamp: new Date(2024, 0, 15) },
        { id: "h1-2", role: "assistant", content: "関数f(x)=x³-3x²+2の極値を求めます。\n\n【解法】\n1. まず、f'(x)を求めます。\n   f'(x) = 3x² - 6x = 3x(x - 2)\n\n2. f'(x) = 0 となるxを求めます。\n   3x(x - 2) = 0\n   x = 0 または x = 2\n\n3. 増減表を作成して極値を判定します。\n   x < 0: f'(x) > 0 (増加)\n   0 < x < 2: f'(x) < 0 (減少)\n   x > 2: f'(x) > 0 (増加)\n\n【答え】\n・x = 0 で極大値 f(0) = 2\n・x = 2 で極小値 f(2) = -2", timestamp: new Date(2024, 0, 15) }
      ]
    },
    { 
      id: "2", 
      title: "英語の長文読解", 
      preview: "この長文の要約をお願い...", 
      timestamp: new Date(2024, 0, 14),
      messages: [
        { id: "h2-1", role: "user", content: "この長文の要約をお願いします。主題と筆者の主張を教えてください。", timestamp: new Date(2024, 0, 14) },
        { id: "h2-2", role: "assistant", content: "長文の要約をいたします。\n\n【主題】\n環境問題と持続可能な社会の実現について\n\n【筆者の主張】\n1. 現代社会は環境への負荷を軽減する必要がある\n2. 個人の行動変容だけでなく、社会システムの変革が重要\n3. 技術革新と伝統的な知恵の融合が解決策となりうる\n\n【キーワード】\nsustainability, carbon footprint, renewable energy\n\nさらに詳しい分析が必要でしたらお聞きください。", timestamp: new Date(2024, 0, 14) }
      ]
    },
    { 
      id: "3", 
      title: "物理の運動方程式", 
      preview: "斜面上の物体の運動について...", 
      timestamp: new Date(2024, 0, 13),
      messages: [
        { id: "h3-1", role: "user", content: "斜面上の物体の運動について教えてください。摩擦がある場合の運動方程式はどうなりますか？", timestamp: new Date(2024, 0, 13) },
        { id: "h3-2", role: "assistant", content: "斜面上の物体の運動方程式を解説します。\n\n【設定】\n・斜面の角度：θ\n・物体の質量：m\n・動摩擦係数：μ\n・重力加速度：g\n\n【力の分解】\n・斜面方向：mg sinθ（下向き）\n・斜面垂直方向：mg cosθ\n・垂直抗力：N = mg cosθ\n・摩擦力：f = μN = μmg cosθ\n\n【運動方程式】\nma = mg sinθ - μmg cosθ\na = g(sinθ - μcosθ)\n\nこの加速度aが正なら物体は斜面を下り、負なら減速します。", timestamp: new Date(2024, 0, 13) }
      ]
    },
    { 
      id: "4", 
      title: "古文の助動詞", 
      preview: "「べし」の用法について...", 
      timestamp: new Date(2024, 0, 12),
      messages: [
        { id: "h4-1", role: "user", content: "「べし」の用法について詳しく教えてください。", timestamp: new Date(2024, 0, 12) },
        { id: "h4-2", role: "assistant", content: "助動詞「べし」の用法を解説します。\n\n【接続】\n終止形に接続（ラ変型は連体形）\n\n【6つの意味】\n1. 推量「〜だろう」\n   例：雨降るべし\n\n2. 意志「〜しよう」\n   例：行くべし\n\n3. 可能「〜できる」\n   例：見るべき景色\n\n4. 当然「〜はずだ」\n   例：知るべきことなり\n\n5. 命令「〜せよ」\n   例：急ぐべし\n\n6. 適当「〜がよい」\n   例：休むべし\n\n【見分け方のコツ】\n文脈から主語の意図や状況を読み取ることが重要です。", timestamp: new Date(2024, 0, 12) }
      ]
    },
  ];

  const handleImageAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploadingImages(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !data.url) {
          throw new Error(data.error ?? "画像のアップロードに失敗しました。");
        }

        setAttachedImages((prev) => [...prev, data.url!]);
      }
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "画像のアップロードに失敗しました。";
      alert(errorText);
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        // Fallback for older browsers or when clipboard API fails
        fallbackCopy(text, id);
      });
    } else {
      fallbackCopy(text, id);
    }
  };

  const fallbackCopy = (text: string, id: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
    document.body.removeChild(textArea);
  };

  const handleSelectHistory = (historyItem: ChatHistory) => {
    setMessages(historyItem.messages);
    setActiveHistoryId(historyItem.id);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveHistoryId(null);
  };

  const handleSend = async () => {
    if (!message.trim() && attachedImages.length === 0) return;
    if (!isUnlimited && questionsRemaining <= 0) return;

    const userText = message.trim();
    const userImages =
      attachedImages.length > 0 ? [...attachedImages] : undefined;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      images: userImages,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setAttachedImages([]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          images: userImages,
          isPro,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = (await response.json()) as {
        content?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "AI との通信に失敗しました。");
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content ?? "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      if (!isUnlimited) {
        setQuestionsRemaining((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "AI との通信中にエラーが発生しました。";
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ ${errorText}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Toggle Button - Always visible when sidebar is closed */}
      {!sidebarOpen && (
        <div className="fixed top-3 left-3 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="bg-card shadow-md"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">WILL AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 lg:hidden" />
              <PanelLeftClose className="w-5 h-5 hidden lg:block" />
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-hidden">
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground px-2">質問履歴</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="text-xs"
              >
                新規質問
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="px-3 space-y-1">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectHistory(chat)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors group ${
                      activeHistoryId === chat.id ? "bg-accent/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{chat.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.preview}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border space-y-2">
            {isAdmin && onAdminClick && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onAdminClick}
              >
                <Settings className="w-4 h-4" />
                管理者画面
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay - only on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-72" : ""}`}>
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <div className={`flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2 ${!sidebarOpen ? "ml-12" : ""}`}>
                <div className="flex items-center gap-1.5">
                  <Zap className={`w-4 h-4 ${!isPro ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${!isPro ? "text-foreground" : "text-muted-foreground"}`}>
                    Normal
                  </span>
                </div>
                <Switch
                  checked={isPro}
                  onCheckedChange={setIsPro}
                  className="data-[state=checked]:bg-accent"
                />
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-4 h-4 ${isPro ? "text-accent" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${isPro ? "text-foreground" : "text-muted-foreground"}`}>
                    PRO
                  </span>
                </div>
              </div>
            </div>

            {/* Question Counter */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                今月の残り質問回数：
                {isUnlimited ? (
                  <span className="text-primary ml-1">無制限</span>
                ) : (
                  <span className="text-primary ml-1">{questionsRemaining}回 / 10回</span>
                )}
              </Badge>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  WILL AI へようこそ
                </h2>
                <p className="text-muted-foreground max-w-md">
                  質問や添削したい問題を入力してください。<br />
                  画像を添付することもできます。
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`添付画像 ${index + 1}`}
                            className="max-w-[150px] max-h-[150px] rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <div className="mt-2 pt-2 border-t border-border/50 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(msg.content, msg.id)}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              コピー完了
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              コピー
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto">
            {/* Attached Images Preview */}
            {attachedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {attachedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`添付 ${index + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleImageAttach}
                disabled={isUploadingImages}
                className="shrink-0"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="質問を入力してください..."
                className="min-h-[44px] max-h-[200px] resize-none bg-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={
                  (!message.trim() && attachedImages.length === 0) ||
                  isLoading ||
                  isUploadingImages ||
                  (!isUnlimited && questionsRemaining <= 0)
                }
                className="shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Shift + Enter で改行 | 画像は複数枚添付可能（アップロード後72時間で自動削除）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
