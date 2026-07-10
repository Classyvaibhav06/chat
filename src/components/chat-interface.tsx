"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
  SendHorizontal, 
  Sparkles, 
  User, 
  Bot, 
  Terminal, 
  Compass, 
  Code2, 
  PenTool, 
  ArrowDown, 
  RefreshCcw,
  Copy,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "@/components/chat-sidebar"

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
  activeChatTitle: string
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  activeChatTitle
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Track scroll position to show "scroll to bottom" button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const diff = target.scrollHeight - target.scrollTop - target.clientHeight
    setShowScrollButton(diff > 150)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Helper to render markdown-like structures: code blocks, inline code, and text paragraphs
  const renderMessageContent = (content: string, messageId: string) => {
    // Regex splits by code blocks: ```[lang]\n[code]\n```
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, idx) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/)
        const language = match ? match[1] : ""
        const code = match ? match[2] : part.slice(3, -3)
        const blockId = `${messageId}-code-${idx}`

        return (
          <div key={idx} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px] shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800/80 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                {language || "code"}
              </span>
              <button 
                onClick={() => copyToClipboard(code.trim(), blockId)}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors text-[10px]"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed font-mono">
              <code>{code.trim()}</code>
            </pre>
          </div>
        )
      }

      // Inline code rendering: `code`
      const inlineParts = part.split(/(`[^`]+`)/g)
      return (
        <span key={idx} className="whitespace-pre-wrap leading-relaxed text-sm">
          {inlineParts.map((subPart, subIdx) => {
            if (subPart.startsWith("`") && subPart.endsWith("`")) {
              return (
                <code key={subIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono text-xs border border-slate-700/50">
                  {subPart.slice(1, -1)}
                </code>
              )
            }
            return subPart
          })}
        </span>
      )
    })
  }

  // Quick Action Suggestions for Empty State
  const suggestions = [
    {
      icon: <Compass className="w-4 h-4 text-emerald-400" />,
      title: "Explain a Concept",
      description: "Explain quantum computing in simple terms for a beginner.",
      prompt: "Explain quantum computing in simple terms for a beginner."
    },
    {
      icon: <Code2 className="w-4 h-4 text-violet-400" />,
      title: "Debug / Code",
      description: "Write a React hook to fetch API data with abort controller.",
      prompt: "Write a standard React custom hook to fetch data from an API, including an abort controller to prevent memory leaks."
    },
    {
      icon: <PenTool className="w-4 h-4 text-amber-400" />,
      title: "Creative Writing",
      description: "Draft a friendly email explaining a project delay to client.",
      prompt: "Write a professional but friendly email to a client explaining that our website design phase is delayed by 3 days, but assuring them of top-notch quality."
    }
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 relative min-w-0">
      {/* Top Navigation Bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-9 h-9 border border-violet-500/20 bg-slate-900 flex items-center justify-center">
              <AvatarFallback className="bg-slate-900 text-violet-400">
                <Bot className="w-5 h-5 text-violet-400" />
              </AvatarFallback>
            </Avatar>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5 online-glow"></span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">{activeChatTitle || "New Conversation"}</h2>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
              <span>Qwen3 LLM</span>
              <span>•</span>
              <span className="text-emerald-500/90 font-semibold uppercase tracking-wider">Online</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Chat Messages Panel */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-6"
        onScroll={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            /* Welcome / Empty State */
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4 animate-fade-in my-auto py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center shadow-2xl mb-6 text-violet-400 animate-pulse-glow">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
                Discover the Power of Qwen3
              </h1>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-10">
                Hi! I'm your AI assistant powered by Qwen3. Ask me anything, or start with one of the quick suggestions below.
              </p>

              {/* Suggestions Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSendMessage(s.prompt)}
                    className="p-4 text-left border border-slate-900 rounded-xl bg-slate-900/30 hover:bg-slate-900/60 hover:border-violet-500/40 cursor-pointer transition-all duration-200 group hover:-translate-y-0.5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
                        {s.icon}
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-6 pb-24">
              {messages.map((message) => {
                const isUser = message.role === "user"
                return (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}
                  >
                    {/* Avatar on left for assistant */}
                    {!isUser && (
                      <Avatar className="w-8 h-8 border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
                        <AvatarFallback className="bg-slate-900 text-violet-400">
                          <Bot className="w-4 h-4 text-violet-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Chat Bubble Wrapper */}
                    <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                      {/* Name / Role Header */}
                      <span className="text-[10px] text-slate-500 font-semibold mb-1 px-1 tracking-wide uppercase select-none">
                        {isUser ? "You" : "Qwen3 AI"}
                      </span>
                      
                      {/* Content Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 text-slate-200 leading-relaxed shadow-sm transition-all ${
                          isUser 
                            ? "chat-bubble-user rounded-tr-none" 
                            : "chat-bubble-assistant rounded-tl-none"
                        }`}
                      >
                        {renderMessageContent(message.content, message.id)}
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-[9px] text-slate-600 mt-1.5 px-1 select-none font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Avatar on right for user */}
                    {isUser && (
                      <Avatar className="w-8 h-8 border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
                        <AvatarFallback className="bg-slate-800 text-slate-200">
                          <User className="w-4 h-4 text-slate-300" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}

              {/* Typing loader */}
              {isLoading && (
                <div className="flex gap-4 justify-start animate-slide-up">
                  <Avatar className="w-8 h-8 border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
                    <AvatarFallback className="bg-slate-900 text-violet-400">
                      <Bot className="w-4 h-4 text-violet-400" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-slate-500 font-semibold mb-1 px-1 tracking-wide uppercase select-none">Qwen3 AI</span>
                    <div className="chat-bubble-assistant rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll To Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 z-20 p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 shadow-xl hover:scale-105 active:scale-95 transition-all duration-150"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Input Area Panel */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/90 backdrop-blur-md sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-end gap-2.5">
          <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden focus-within:border-violet-500/50 shadow-inner transition-colors">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pl-4 pr-12 py-3.5 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none resize-none text-xs leading-normal min-h-[46px] max-h-[140px]"
              placeholder="Ask Qwen3 anything..."
            />
            {/* Action buttons inside input box if needed, or simply handle send outside */}
          </div>
          
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            variant="premium"
            className="rounded-xl h-[46px] w-[46px] p-0 flex items-center justify-center shrink-0 shadow-lg active:scale-95 transition-transform"
          >
            <SendHorizontal className="w-4.5 h-4.5" />
          </Button>
        </form>
        <div className="max-w-3xl mx-auto mt-2 text-[10px] text-center text-slate-600 font-medium select-none">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800/80">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800/80">Shift + Enter</kbd> for new line.
        </div>
      </div>
    </div>
  )
}
