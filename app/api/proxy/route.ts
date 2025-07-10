import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/config"

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Read the request body directly as JSON
    const { endpoint, method = "GET", headers = {}, data } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: "Endpoint is required" }, 
        { status: 400, headers: corsHeaders }
      )
    }

    const baseUrl = API_CONFIG.BASE_URL
    const url = new URL(endpoint, baseUrl).toString()

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; Library-PWA/1.0)",
      ...headers,
    }

    console.log(`REQUEST: Proxy ${method} request to: ${url}`)
    if (method === "POST" && requestHeaders["X-CSRF-Token"]) {
      console.log(`AUTH: CSRF token included in headers: ${requestHeaders["X-CSRF-Token"].substring(0, 10)}...`)
    }

    const options: RequestInit = {
      method,
      headers: requestHeaders,
      cache: "no-store",
    }

    if (method !== "GET" && method !== "HEAD" && data !== undefined) {
      options.body = JSON.stringify(data)
      console.log(`BODY: Request body included for ${method} request`)
    }

    const response = await fetch(url, options)
    const status = response.status

    console.log(`RESPONSE: Response status: ${status}`)

    let responseData
    try {
      responseData = await response.json()
    } catch (e) {
      responseData = await response.text()
    }

    return NextResponse.json({
      success: response.ok,
      status,
      data: responseData,
      headers: Object.fromEntries(response.headers),
    }, { headers: corsHeaders })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" }, 
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const endpoint = url.searchParams.get("endpoint")

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint parameter required" }, 
        { status: 400, headers: corsHeaders }
      )
    }

    console.log("REQUEST: Proxy GET request:", endpoint)

    const requestHeaders: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; Library-PWA/1.0)",
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: "GET",
      headers: requestHeaders,
    })

    console.log("RESPONSE: Direct GET response:", response.status, response.statusText)

    const responseText = await response.text()

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = responseText
    }

    return NextResponse.json(
      {
        data: responseData,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      },
      { status: response.ok ? 200 : response.status, headers: corsHeaders }
    )
  } catch (error) {
    console.error("ERROR: Proxy GET error:", error)
    return NextResponse.json(
      { error: "Proxy request failed", details: error.message }, 
      { status: 500, headers: corsHeaders }
    )
  }
}