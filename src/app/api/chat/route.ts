import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, apiEndpoint, authToken } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Fallback to environment variables if custom ones aren't specified by the client
    const targetUrl = apiEndpoint || process.env.QWEN_API_ENDPOINT || "https://daisy-stubborn-proving.ngrok-free.dev/chat"
    const token = authToken || process.env.QWEN_AUTH_TOKEN || "sk-garv-9f8x7q2m4k1p"

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      // Keep it fresh, avoid browser cache
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Downstream API error:", errorText)
      return NextResponse.json(
        { error: `Downstream API responded with status ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // The response body is of the format: { "response": "..." }
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Chat proxy route error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
