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
  Copy, 
  Check,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Message } from "@/components/chat-sidebar"

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading: boolean
  activeChatTitle: string
  onToggleSidebar?: () => void
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  activeChatTitle,
  onToggleSidebar
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

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

  const renderMessageContent = (content: string, messageId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)

    const parseMarkdownLine = (line: string, lineIdx: number) => {
      let currentLine = line
      
      // Check for blockquote
      const isBlockquote = currentLine.startsWith("> ")
      if (isBlockquote) {
        currentLine = currentLine.substring(2)
      }

      // Check for list items
      const isUnorderedList = currentLine.startsWith("- ") || currentLine.startsWith("* ")
      const isOrderedList = /^\d+\.\s/.test(currentLine)

      if (isUnorderedList) {
        currentLine = currentLine.substring(2)
      } else if (isOrderedList) {
        const match = currentLine.match(/^(\d+\.\s)/)
        if (match) {
          currentLine = currentLine.substring(match[0].length)
        }
      }

      // Check for headings
      const headingMatch = currentLine.match(/^(#{1,6})\s/)
      const isHeading = !!headingMatch
      let headingLevel = 0
      if (isHeading && headingMatch) {
        headingLevel = headingMatch[1].length
        currentLine = currentLine.substring(headingMatch[0].length)
      }

      // Inline formatter: parses inline code, bold, italics
      const renderInline = (inputText: string) => {
        // Split by inline code: `code`
        const codeParts = inputText.split(/(`[^`]+`)/g)

        return codeParts.flatMap((part, pIdx) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={`code-${pIdx}`} className="px-1.5 py-0.5 rounded bg-warm-sand text-indigo-accent font-mono text-xs border border-linen-border">
                {part.slice(1, -1)}
              </code>
            )
          }

          // Parse bold: **bold**
          const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
          return boldParts.flatMap((bPart, bIdx) => {
            if (bPart.startsWith("**") && bPart.endsWith("**")) {
              return (
                <strong key={`bold-${bIdx}`} className="font-semibold text-ink">
                  {bPart.slice(2, -2)}
                </strong>
              )
            }

            // Parse italics: *italics*
            const italicParts = bPart.split(/(\*[^*]+\*)/g)
            return italicParts.map((iPart, iIdx) => {
              if (iPart.startsWith("*") && iPart.endsWith("*")) {
                return (
                  <em key={`ital-${iIdx}`} className="italic">
                    {iPart.slice(1, -1)}
                  </em>
                )
              }
              return iPart
            })
          })
        })
      }

      const contentNode = renderInline(currentLine)

      // Render wrapper elements
      if (isBlockquote) {
        return (
          <blockquote key={lineIdx} className="pl-3.5 py-0.5 border-l-2 border-stone text-dim-gray italic my-1 font-light">
            {contentNode}
          </blockquote>
        )
      }

      if (isUnorderedList) {
        return (
          <li key={lineIdx} className="list-disc ml-5 my-0.5 text-charcoal">
            {contentNode}
          </li>
        )
      }

      if (isOrderedList) {
        return (
          <li key={lineIdx} className="list-decimal ml-5 my-0.5 text-charcoal">
            {contentNode}
          </li>
        )
      }

      if (isHeading) {
        const headingClasses = [
          "text-xl font-medium text-ink mt-3 mb-1", // h1
          "text-lg font-medium text-ink mt-2 mb-1", // h2
          "text-base font-medium text-ink mt-2 mb-0.5", // h3
          "text-sm font-semibold text-ink mt-1.5", // h4
          "text-xs font-semibold text-ink", // h5
          "text-xs font-semibold text-dim-gray", // h6
        ]
        const level = Math.min(headingLevel, 6)
        const Tag = `h${level}` as any
        return (
          <Tag key={lineIdx} className={headingClasses[level - 1]}>
            {contentNode}
          </Tag>
        )
      }

      // Empty line -> spacing
      if (currentLine.trim() === "") {
        return <div key={lineIdx} className="h-2" />
      }

      return (
        <p key={lineIdx} className="my-1 leading-relaxed">
          {contentNode}
        </p>
      )
    }

    return parts.map((part, idx) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/)
        const language = match ? match[1] : ""
        const code = match ? match[2] : part.slice(3, -3)
        const blockId = `${messageId}-code-${idx}`

        return (
          <div key={idx} className="my-4 rounded-[12px] overflow-hidden border border-linen-border bg-parchment font-mono text-[11px] shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-warm-sand border-b border-linen-border text-[10px] text-dim-gray font-medium uppercase tracking-wider select-none">
              <span className="flex items-center gap-1.5 font-semibold text-charcoal">
                <Terminal className="w-3.5 h-3.5 text-charcoal" />
                {language || "code"}
              </span>
              <button 
                onClick={() => copyToClipboard(code.trim(), blockId)}
                className="flex items-center gap-1 hover:text-charcoal transition-colors text-[10px]"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
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
            <pre className="p-4 overflow-x-auto text-charcoal leading-relaxed font-mono">
              <code>{code.trim()}</code>
            </pre>
          </div>
        )
      }

      // Parse markdown in text blocks
      const lines = part.split("\n")
      return (
        <div key={idx} className="text-sm">
          {lines.map((line, lIdx) => parseMarkdownLine(line, lIdx))}
        </div>
      )
    })
  }

  const suggestions = [
    {
      icon: <Compass className="w-4 h-4 text-charcoal" />,
      title: "Explain a concept",
      description: "Explain quantum computing in simple terms for a beginner.",
      prompt: "Explain quantum computing in simple terms for a beginner."
    },
    {
      icon: <Code2 className="w-4 h-4 text-charcoal" />,
      title: "Debug / Code",
      description: "Write a React hook to fetch API data with abort controller.",
      prompt: "Write a standard React custom hook to fetch data from an API, including an abort controller to prevent memory leaks."
    },
    {
      icon: <PenTool className="w-4 h-4 text-charcoal" />,
      title: "Creative writing",
      description: "Draft a friendly email explaining a project delay to client.",
      prompt: "Write a professional but friendly email to a client explaining that our website design phase is delayed by 3 days, but assuring them of top-notch quality."
    }
  ]

  return (
    <div className="flex-grow flex flex-col h-full bg-parchment text-charcoal relative min-w-0">
      {/* Sticky Navigation Bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-linen-border bg-parchment/80 backdrop-blur-[4px] z-10">
        <div className="flex items-center gap-3">
          {/* Menu Hamburger Toggle on Mobile */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-warm-sand border border-transparent hover:border-linen-border text-charcoal md:hidden transition-lovable"
              title="Open sidebar"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          )}

          <div className="relative">
            <Avatar className="w-8 h-8 border border-linen-border bg-warm-sand flex items-center justify-center">
              <AvatarFallback className="bg-warm-sand text-charcoal">
                <Bot className="w-4.5 h-4.5 text-charcoal" />
              </AvatarFallback>
            </Avatar>
            <span className="w-2 h-2 rounded-full bg-emerald-500 border-2 border-parchment absolute -bottom-0.5 -right-0.5"></span>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-ink leading-tight">{activeChatTitle || "New Conversation"}</h2>
            <p className="text-[10px] text-dim-gray font-light">
              Qwen3 LLM • Active downline
            </p>
          </div>
        </div>
      </header>

      {/* Main Chat Messages Panel */}
      <div 
        className="flex-grow overflow-y-auto px-6 py-6"
        onScroll={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            /* Welcome / Empty Hero State */
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4 my-auto py-12">
              {/* Prismatic Horizon Gradient backdrop */}
              <div className="w-full h-[6px] rounded-full hero-gradient-horizon mb-10 opacity-80" />

              <div className="w-12 h-12 rounded-full bg-warm-sand border border-linen-border flex items-center justify-center mb-6 text-charcoal shadow-sm">
                <Sparkles className="w-5 h-5 text-charcoal" />
              </div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-ink mb-3 max-w-lg leading-tight">
                Quiet space inside a creative intelligence
              </h1>
              <p className="text-sm text-dim-gray max-w-md leading-relaxed mb-10 font-light">
                Hello! I am Qwen3. Share your thoughts or select a preset idea below to start our conversation.
              </p>

              {/* Suggestions Cards Grid - Warm Surface Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSendMessage(s.prompt)}
                    className="p-5 text-left rounded-[24px] bg-warm-sand hover:bg-parchment hover:border-stone cursor-pointer transition-lovable border border-transparent group hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 rounded-full bg-parchment border border-linen-border">
                        {s.icon}
                      </div>
                      <span className="text-xs font-semibold text-charcoal group-hover:text-ink">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-dim-gray leading-normal font-light">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-6 pb-28">
              {messages.map((message) => {
                const isUser = message.role === "user"
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"} animate-lovable-fade`}
                  >
                    {/* Bot Avatar */}
                    {!isUser && (
                      <Avatar className="w-7 h-7 border border-linen-border shrink-0 bg-warm-sand flex items-center justify-center mt-1">
                        <AvatarFallback className="bg-warm-sand text-charcoal">
                          <Bot className="w-3.5 h-3.5 text-charcoal" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex flex-col max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-3 text-sm transition-all ${
                          isUser 
                            ? "chat-bubble-user" 
                            : "chat-bubble-assistant"
                        }`}
                      >
                        {renderMessageContent(message.content, message.id)}
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-[9px] text-dim-gray mt-1.5 px-1 font-light select-none">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <Avatar className="w-7 h-7 border border-linen-border shrink-0 bg-parchment flex items-center justify-center mt-1">
                        <AvatarFallback className="bg-parchment text-charcoal">
                          <User className="w-3.5 h-3.5 text-charcoal" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3.5 justify-start animate-lovable-fade">
                  <Avatar className="w-7 h-7 border border-linen-border shrink-0 bg-warm-sand flex items-center justify-center">
                    <AvatarFallback className="bg-warm-sand text-charcoal">
                      <Bot className="w-3.5 h-3.5 text-charcoal" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <div className="chat-bubble-assistant px-4 py-3 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-charcoal animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-charcoal animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-charcoal animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll To Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 z-20 p-2.5 rounded-full bg-parchment border border-linen-border text-dim-gray hover:text-charcoal hover:scale-105 active:scale-95 transition-lovable shadow-sm"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Input Area: Chat Input Card */}
      <div className="p-4 border-t border-linen-border bg-parchment/90 backdrop-blur-[4px] sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-end gap-3">
          {/* Chat Input Card container */}
          <div className="flex-grow flex items-center gap-2.5 bg-warm-sand border border-linen-border/40 rounded-[24px] px-4 py-3.5 shadow-subtle-2 focus-within:border-stone/60 transition-lovable">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-grow bg-transparent text-charcoal placeholder-dim-gray focus:outline-none resize-none text-sm leading-normal max-h-[140px]"
              placeholder="Type your prompt ideas..."
            />
            
            {/* Prismatic Horizon Circle Send Button */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              variant="gradientCircle"
              className="w-7 h-7 shrink-0"
              title="Send prompt"
            >
              <SendHorizontal className="w-3.5 h-3.5 text-parchment" />
            </Button>
          </div>
        </form>
        <div className="max-w-3xl mx-auto mt-2 text-[10px] text-center text-dim-gray font-light select-none">
          Press <kbd className="px-1 py-0.5 rounded bg-warm-sand text-charcoal border border-linen-border font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-warm-sand text-charcoal border border-linen-border font-mono text-[9px]">Shift + Enter</kbd> for newline.
        </div>
      </div>
    </div>
  )
}
