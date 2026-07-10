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
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  apiEndpoint,
  authToken,
  onSaveSettings
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

  return (
    <div className="w-80 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 shrink-0 select-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-lg text-white">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none bg-gradient-to-r from-violet-200 to-slate-200 bg-clip-text text-transparent">Qwen3 Studio</h1>
            <span className="text-[10px] text-violet-400/80 font-medium">v1.0.0 • Tongyi Lab</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 online-glow"></span>
          <span className="text-[10px] font-semibold text-emerald-500/90 tracking-wide uppercase">Active</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4">
        <Button 
          onClick={onNewChat} 
          variant="premium" 
          className="w-full flex items-center justify-center gap-2 py-5 font-semibold transition-transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pb-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Recent Conversations</div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-1">
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-slate-500 italic">
                No chats yet. Start one above!
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId
                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "group relative flex items-center justify-between w-full p-3 rounded-lg text-left text-xs cursor-pointer transition-all duration-200",
                      isActive 
                        ? "bg-violet-950/40 text-violet-200 border border-violet-800/50 shadow-inner" 
                        : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-400"
                      )} />
                      <span className="truncate pr-4 font-medium">{session.title}</span>
                    </div>
                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className={cn(
                        "p-1 rounded text-slate-500 hover:bg-slate-700/60 hover:text-rose-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 absolute right-2",
                        isActive && "opacity-80 text-violet-400/80"
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
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <Button 
          onClick={() => setIsSettingsOpen(true)}
          variant="ghost" 
          className="w-full justify-start text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 gap-2.5 px-3 py-4"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          API Settings
        </Button>
      </div>

      {/* Settings Modal overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <CloudLightning className="w-4.5 h-4.5 text-violet-400" />
                <h3 className="text-sm font-bold text-slate-200">API Connection Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Endpoint URL</label>
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                  placeholder="Using server environment default"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Authorization Token</label>
                <div className="relative">
                  <input
                    type="password"
                    value={localToken}
                    onChange={(e) => setLocalToken(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
                    placeholder="Using server environment default"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-600 absolute left-2.5 top-2.5" />
                </div>
              </div>
              
              <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800/60 space-y-1.5">
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Proxy Protected</span>
                  Requests are proxied securely through a server-side Next.js route handler, preventing any CORS errors and protecting your API credentials from direct client-side exposure.
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-0.5">Empty Fields Fallback</span>
                  Leaving these fields empty defaults to the <code className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[9px]">.env.local</code> configuration on the host server.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-800 bg-slate-950/30">
              <Button 
                onClick={() => setIsSettingsOpen(false)}
                variant="ghost" 
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                variant="premium"
                className="text-xs font-semibold px-4"
              >
                {showSavedToast ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
