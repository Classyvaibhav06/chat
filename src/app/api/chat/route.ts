import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, apiEndpoint, authToken, model } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    if (model === "grok") {
      // Use server process env first, fall back to custom authToken from settings
      const token = process.env.ZENMUX_API_KEY || authToken
      
      if (!token) {
        return NextResponse.json(
          { error: "ZenMux API Key is missing. Please check your environment variables or provide it in Settings." },
          { status: 400 }
        )
      }

      const response = await fetch("https://zenmux.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "x-ai/grok-4.5-free",
          messages: [
            { role: "user", content: message }
          ]
        }),
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("ZenMux API error:", errorText)
        return NextResponse.json(
          { error: `ZenMux API error (${response.status}): ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content || "No response content received from Grok."
      return NextResponse.json({ response: content })
    } else if (model === "kimi") {
      // Use server process env first, fall back to custom authToken from settings
      const token = process.env.TOKENROUTER_API_KEY || authToken

      if (!token) {
        return NextResponse.json(
          { error: "TokenRouter API Key is missing. Please check your environment variables or provide it in Settings." },
          { status: 400 }
        )
      }

      const response = await fetch("https://api.tokenrouter.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k3-free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: message
                }
              ]
            }
          ]
        }),
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("TokenRouter API error:", errorText)
        return NextResponse.json(
          { error: `TokenRouter API error (${response.status}): ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const rawContent = data?.choices?.[0]?.message?.content || "No response content received from Kimi K3."
      const content = typeof rawContent === "string" 
        ? rawContent 
        : Array.isArray(rawContent) 
          ? rawContent.map((c: any) => c?.text || "").join("")
          : JSON.stringify(rawContent)

      return NextResponse.json({ response: content })
    } else {
      // Default: Qwen endpoint
      const targetUrl = apiEndpoint || process.env.QWEN_API_ENDPOINT || "https://daisy-stubborn-proving.ngrok-free.dev/chat"
      const token = authToken || process.env.QWEN_AUTH_TOKEN || "sk-garv-9f8x7q2m4k1p"

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Qwen API error:", errorText)
        return NextResponse.json(
          { error: `Qwen API responded with status ${response.status}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error: any) {
    console.error("Chat proxy route error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
