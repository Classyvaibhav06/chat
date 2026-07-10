"use client"

import React, { useState, useEffect } from "react"
import { ChatSidebar, ChatSession, Message } from "@/components/chat-sidebar"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Load configurations from local storage or fall back to server env defaults
  const [apiEndpoint, setApiEndpoint] = useState("")
  const [authToken, setAuthToken] = useState("")

  // Load chat sessions & credentials on initial client mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("qwen3_chat_sessions")
    const savedEndpoint = localStorage.getItem("qwen3_api_endpoint")
    const savedToken = localStorage.getItem("qwen3_auth_token")

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        setSessions(parsed)
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id)
        }
      } catch (e) {
        console.error("Error loading sessions from local storage:", e)
      }
    }
    
    if (savedEndpoint) setApiEndpoint(savedEndpoint)
    if (savedToken) setAuthToken(savedToken)
  }, [])

  // Save sessions to local storage whenever they change
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions)
    localStorage.setItem("qwen3_chat_sessions", JSON.stringify(updatedSessions))
  }

  // Handle settings update
  const handleSaveSettings = (endpoint: string, token: string) => {
    setApiEndpoint(endpoint)
    setAuthToken(token)
    localStorage.setItem("qwen3_api_endpoint", endpoint)
    localStorage.setItem("qwen3_auth_token", token)
  }

  // Create a new chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now()
    }
    const updated = [newSession, ...sessions]
    saveSessions(updated)
    setActiveSessionId(newSession.id)
  }

  // Delete a chat session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevents selection triggers
    const updated = sessions.filter(s => s.id !== id)
    saveSessions(updated)
    
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null)
    }
  }

  // Send a message
  const handleSendMessage = async (content: string) => {
    let currentSessionId = activeSessionId
    let currentSessions = [...sessions]

    // 1. Create a session on-the-fly if none is active or available
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: content.length > 25 ? `${content.substring(0, 25)}...` : content,
        messages: [],
        createdAt: Date.now()
      }
      currentSessions = [newSession, ...currentSessions]
      currentSessionId = newSession.id
      setActiveSessionId(newSession.id)
    }

    const sessionIndex = currentSessions.findIndex(s => s.id === currentSessionId)
    if (sessionIndex === -1) return

    const activeSession = currentSessions[sessionIndex]

    // 2. Append User Message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now()
    }
    
    const updatedMessages = [...activeSession.messages, userMessage]
    
    // Auto-update session title if it was named "New Conversation" or is empty
    let updatedTitle = activeSession.title
    if (activeSession.messages.length === 0 || activeSession.title === "New Conversation") {
      updatedTitle = content.length > 25 ? `${content.substring(0, 25)}...` : content
    }

    currentSessions[sessionIndex] = {
      ...activeSession,
      title: updatedTitle,
      messages: updatedMessages
    }
    
    saveSessions(currentSessions)
    setIsLoading(true)

    try {
      // 3. Request downstream API proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: content,
          apiEndpoint,
          authToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to receive response from AI")
      }

      // 4. Append Assistant response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now()
      }

      // Read fresh state to avoid closure stale state if sessions were modified
      const freshSessions = [...currentSessions]
      const freshSessionIdx = freshSessions.findIndex(s => s.id === currentSessionId)
      if (freshSessionIdx !== -1) {
        freshSessions[freshSessionIdx].messages = [...updatedMessages, assistantMessage]
        saveSessions(freshSessions)
      }
    } catch (error: any) {
      console.error("Error fetching message response:", error)
      // Append an system error bubble
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ Error: ${error?.message || "Failed to communicate with Qwen3 API. Please double-check your API Endpoint and Authorization Token in Settings."}`,
        timestamp: Date.now()
      }
      
      const freshSessions = [...currentSessions]
      const freshSessionIdx = freshSessions.findIndex(s => s.id === currentSessionId)
      if (freshSessionIdx !== -1) {
        freshSessions[freshSessionIdx].messages = [...updatedMessages, errorMessage]
        saveSessions(freshSessions)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId) || null

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-parchment relative">
      {/* Sidebar Panel - overlay on mobile, static on desktop */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        apiEndpoint={apiEndpoint}
        authToken={authToken}
        onSaveSettings={handleSaveSettings}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Panel */}
      <ChatInterface
        messages={activeSession ? activeSession.messages : []}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        activeChatTitle={activeSession ? activeSession.title : ""}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </main>
  )
}
