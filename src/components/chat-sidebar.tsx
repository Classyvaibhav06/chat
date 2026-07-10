"use client"

import React, { useState } from "react"
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Settings, 
  Sparkles, 
  CloudLightning,
  ShieldCheck,
  Check,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string, e: React.MouseEvent) => void
  apiEndpoint: string
  authToken: string
  onSaveSettings: (endpoint: string, token: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  apiEndpoint,
  authToken,
  onSaveSettings,
  isOpen = false,
  onClose
}: ChatSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [localEndpoint, setLocalEndpoint] = useState(apiEndpoint)
  const [localToken, setLocalToken] = useState(authToken)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const handleSave = () => {
    onSaveSettings(localEndpoint, localToken)
    setShowSavedToast(true)
    setTimeout(() => {
      setShowSavedToast(false)
      setIsSettingsOpen(false)
    }, 1500)
  }

  const handleSelectSession = (id: string) => {
    onSelectSession(id)
    if (onClose) onClose() // Close mobile sidebar on selection
  }

  const handleNewChatClick = () => {
    onNewChat()
    if (onClose) onClose() // Close mobile sidebar on new chat creation
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-30 md:hidden animate-lovable-fade"
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={cn(
          "w-80 flex flex-col h-full bg-warm-sand border-r border-linen-border text-charcoal shrink-0 select-none",
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-linen-border bg-parchment/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-charcoal text-parchment">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="font-medium text-sm leading-none text-ink tracking-tight">Qwen3 Chat</h1>
              <span className="text-[10px] text-dim-gray">Studio Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-parchment border border-linen-border px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[9px] font-semibold text-charcoal tracking-wide uppercase">Active</span>
          </div>
        </div>

        {/* Action Button: Dark Pill Button */}
        <div className="p-4">
          <Button 
            onClick={handleNewChatClick} 
            variant="default" 
            className="w-full flex items-center justify-center gap-2 py-5 font-medium transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-5 pb-2 text-[10px] font-medium text-dim-gray tracking-wider uppercase">Conversations</div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1.5 py-1">
              {sessions.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs text-dim-gray italic font-light">
                  No chats yet. Start one above!
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={cn(
                        "group relative flex items-center justify-between w-full p-2.5 rounded-[12px] text-left text-xs cursor-pointer border transition-lovable",
                        isActive 
                          ? "bg-parchment text-charcoal border-linen-border shadow-sm font-medium" 
                          : "hover:bg-parchment/65 text-dim-gray hover:text-charcoal border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-charcoal" : "text-dim-gray group-hover:text-charcoal"
                        )} />
                        <span className="truncate pr-5">{session.title}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteSession(session.id, e)}
                        className={cn(
                          "p-1 rounded-full text-dim-gray hover:bg-warm-sand hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 absolute right-2",
                          isActive && "opacity-80 text-charcoal"
                        )}
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-linen-border bg-parchment/40">
          <Button 
            onClick={() => setIsSettingsOpen(true)}
            variant="ghost" 
            className="w-full justify-start text-xs font-normal text-dim-gray hover:text-charcoal hover:bg-parchment/50 gap-2.5 px-3 py-4 rounded-full border border-linen-border bg-parchment shadow-sm"
          >
            <Settings className="w-4 h-4 text-dim-gray" />
            API settings
          </Button>
        </div>

        {/* Settings Modal overlay */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/30 backdrop-blur-sm animate-lovable-fade">
            <div className="w-full max-w-md bg-parchment border border-linen-border rounded-[24px] shadow-subtle-2 overflow-hidden animate-lovable-zoom">
              <div className="flex justify-between items-center px-6 py-4 border-b border-linen-border bg-warm-sand/30">
                <div className="flex items-center gap-2">
                  <CloudLightning className="w-4 h-4 text-charcoal" />
                  <h3 className="text-sm font-medium text-ink">API settings</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-dim-gray hover:text-charcoal transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-dim-gray font-medium">Endpoint URL</label>
                  <input
                    type="text"
                    value={localEndpoint}
                    onChange={(e) => setLocalEndpoint(e.target.value)}
                    className="w-full px-3 py-2 bg-parchment border border-linen-border rounded-[8px] text-charcoal placeholder-stone focus:outline-none focus:border-stone shadow-subtle"
                    placeholder="Using server environment default"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-dim-gray font-medium">Authorization Token</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={localToken}
                      onChange={(e) => setLocalToken(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-parchment border border-linen-border rounded-[8px] text-charcoal placeholder-stone focus:outline-none focus:border-stone shadow-subtle font-mono"
                      placeholder="Using server environment default"
                    />
                    <ShieldCheck className="w-4 h-4 text-dim-gray absolute left-2.5 top-2.5" />
                  </div>
                </div>
                
                <div className="text-[10px] text-dim-gray leading-relaxed bg-warm-sand p-3.5 rounded-[12px] border border-linen-border">
                  <span className="font-semibold text-charcoal block mb-0.5">Proxy protected</span>
                  Requests are proxied securely through a server-side Next.js route handler, preventing any CORS errors and protecting your API credentials from direct client-side exposure.
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-linen-border bg-warm-sand/30">
                <Button 
                  onClick={() => setIsSettingsOpen(false)}
                  variant="outline" 
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  variant="default"
                  className="text-xs font-semibold px-4"
                >
                  {showSavedToast ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
