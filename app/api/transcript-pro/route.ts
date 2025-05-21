import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { parse } from "node-html-parser"

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number.parseInt(dec, 10)))
}

// Generate a YouTube-compatible client version
function generateClientVersion() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}.${month}${day}.00.00`
}

// This is our professional-grade transcript extraction API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const languageCode = searchParams.get("lang") || "en"

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    console.log(`Processing professional transcript request for video ID: ${videoId}`)

    // Step 1: Get video details using YouTube API
    let videoTitle = "YouTube Video"
    let channelTitle = ""
    let publishedAt = ""

    try {
      const videoDetailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`,
        { timeout: 5000 },
      )

      if (videoDetailsResponse.data.items && videoDetailsResponse.data.items.length > 0) {
        videoTitle = videoDetailsResponse.data.items[0].snippet.title
        channelTitle = videoDetailsResponse.data.items[0].snippet.channelTitle
        publishedAt = videoDetailsResponse.data.items[0].snippet.publishedAt
      }
    } catch (error) {
      console.log("Failed to get video details from API, continuing with extraction")
    }

    // Step 2: Create browser-like headers with cookies and other necessary headers
    const browserHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      Referer: "https://www.youtube.com/",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
    }

    // Step 3: First, get the video page to extract necessary tokens and cookies
    const videoPageResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: browserHeaders,
      withCredentials: true,
    })

    const html = videoPageResponse.data
    console.log("Successfully fetched video page HTML")

    // Extract cookies from the response
    const cookies = videoPageResponse.headers["set-cookie"] || []
    const cookieString = cookies.join("; ")

    // Step 4: Extract the API key and client version from the page
    let apiKey = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8" // Default fallback
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)
    if (apiKeyMatch && apiKeyMatch[1]) {
      apiKey = apiKeyMatch[1]
    }

    let clientVersion = generateClientVersion() // Default fallback
    const clientVersionMatch = html.match(/"clientVersion":"([^"]+)"/)
    if (clientVersionMatch && clientVersionMatch[1]) {
      clientVersion = clientVersionMatch[1]
    }

    console.log(`Using API key: ${apiKey} and client version: ${clientVersion}`)

    // Step 5: Extract the ytInitialPlayerResponse JSON
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s)
    if (!playerResponseMatch) {
      console.log("Could not find ytInitialPlayerResponse in the page HTML")
      return NextResponse.json({ error: "Failed to extract video data" }, { status: 500 })
    }

    let playerResponse
    try {
      playerResponse = JSON.parse(playerResponseMatch[1])
      console.log("Successfully parsed ytInitialPlayerResponse")
    } catch (e) {
      console.error("Failed to parse ytInitialPlayerResponse:", e)
      return NextResponse.json({ error: "Failed to parse video data" }, { status: 500 })
    }

    // Step 6: Try multiple approaches to get the transcript
    let transcript = []
    let successfulMethod = ""
    let availableLanguages = []

    // Method 1: Try to get captions from playerCaptionsTracklistRenderer
    const captionsFromPlayer = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (captionsFromPlayer && captionsFromPlayer.length > 0) {
      console.log(`Found ${captionsFromPlayer.length} caption tracks in playerCaptionsTracklistRenderer`)

      // Map available languages
      availableLanguages = captionsFromPlayer.map((track: any) => ({
        languageCode: track.languageCode,
        name: track.name?.simpleText || track.languageCode,
      }))

      // Find the requested language or default to the first one
      const requestedTrack =
        captionsFromPlayer.find((track: any) => track.languageCode === languageCode) || captionsFromPlayer[0]

      if (requestedTrack && requestedTrack.baseUrl) {
        try {
          // Add necessary headers and cookies for the caption request
          const captionResponse = await axios.get(requestedTrack.baseUrl, {
            headers: {
              ...browserHeaders,
              Cookie: cookieString,
            },
          })

          const captionXml = captionResponse.data
          console.log("Successfully fetched caption XML from playerCaptionsTracklistRenderer")

          // Parse the XML
          const root = parse(captionXml)
          const textElements = root.querySelectorAll("text")

          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} caption entries from playerCaptionsTracklistRenderer`)

            transcript = textElements.map((element) => {
              const start = Number.parseFloat(element.getAttribute("start") || "0")
              const duration = Number.parseFloat(element.getAttribute("dur") || "0")
              const text = decodeHtmlEntities(element.text)

              return {
                text,
                offset: Math.round(start * 1000), // Convert to milliseconds
                duration: Math.round(duration * 1000),
              }
            })

            successfulMethod = "playerCaptionsTracklistRenderer"
          }
        } catch (e) {
          console.log("Failed to get captions from playerCaptionsTracklistRenderer:", e.message)
        }
      }
    }

    // Method 2: Try YouTube's transcript API with the extracted cookies
    if (transcript.length === 0) {
      console.log("Trying YouTube's transcript API with cookies")

      // Try multiple languages if the requested one fails
      const languagesToTry = [languageCode, "en", "en-US", "en-GB", ""]

      for (const lang of languagesToTry) {
        try {
          // Try auto-generated captions first
          const autoUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&asr=1&lang=${lang}`
          const autoResponse = await axios.get(autoUrl, {
            headers: {
              ...browserHeaders,
              Cookie: cookieString,
            },
            timeout: 5000,
          })

          if (autoResponse.data && autoResponse.data.length > 10) {
            // Parse the XML
            const root = parse(autoResponse.data)
            const textElements = root.querySelectorAll("text")

            if (textElements && textElements.length > 0) {
              console.log(
                `Found ${textElements.length} auto-generated caption entries in ${lang || "default language"}`,
              )

              transcript = textElements.map((element) => {
                const start = Number.parseFloat(element.getAttribute("start") || "0")
                const duration = Number.parseFloat(element.getAttribute("dur") || "0")
                const text = decodeHtmlEntities(element.text)

                return {
                  text,
                  offset: Math.round(start * 1000),
                  duration: Math.round(duration * 1000),
                }
              })

              successfulMethod = `transcript API (auto, ${lang || "default"})`
              break
            }
          }

          // Then try manual captions
          const manualUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}`
          const manualResponse = await axios.get(manualUrl, {
            headers: {
              ...browserHeaders,
              Cookie: cookieString,
            },
            timeout: 5000,
          })

          if (manualResponse.data && manualResponse.data.length > 10) {
            // Parse the XML
            const root = parse(manualResponse.data)
            const textElements = root.querySelectorAll("text")

            if (textElements && textElements.length > 0) {
              console.log(`Found ${textElements.length} manual caption entries in ${lang || "default language"}`)

              transcript = textElements.map((element) => {
                const start = Number.parseFloat(element.getAttribute("start") || "0")
                const duration = Number.parseFloat(element.getAttribute("dur") || "0")
                const text = decodeHtmlEntities(element.text)

                return {
                  text,
                  offset: Math.round(start * 1000),
                  duration: Math.round(duration * 1000),
                }
              })

              successfulMethod = `transcript API (manual, ${lang || "default"})`
              break
            }
          }
        } catch (e) {
          console.log(`Failed to get transcript in ${lang || "default language"}:`, e.message)
        }
      }
    }

    // Method 3: Try YouTube's innertube API
    if (transcript.length === 0) {
      console.log("Trying YouTube's innertube API")

      try {
        // This is YouTube's internal API
        const innertubeUrl = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`

        const payload = {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: clientVersion,
              hl: "en",
              gl: "US",
            },
          },
          videoId,
        }

        const innertubeResponse = await axios.post(innertubeUrl, payload, {
          headers: {
            ...browserHeaders,
            "Content-Type": "application/json",
            Cookie: cookieString,
          },
        })

        if (innertubeResponse.data) {
          console.log("Got response from innertube API")

          // Try to find captions in the response
          const captionTracks = innertubeResponse.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks

          if (captionTracks && captionTracks.length > 0) {
            console.log(`Found ${captionTracks.length} caption tracks in innertube API`)

            // Map available languages
            availableLanguages = captionTracks.map((track: any) => ({
              languageCode: track.languageCode,
              name: track.name?.simpleText || track.languageCode,
            }))

            // Find the requested language or default to the first one
            const requestedTrack =
              captionTracks.find((track: any) => track.languageCode === languageCode) || captionTracks[0]

            if (requestedTrack && requestedTrack.baseUrl) {
              const captionResponse = await axios.get(requestedTrack.baseUrl, {
                headers: {
                  ...browserHeaders,
                  Cookie: cookieString,
                },
              })

              const captionXml = captionResponse.data

              // Parse the XML
              const root = parse(captionXml)
              const textElements = root.querySelectorAll("text")

              if (textElements && textElements.length > 0) {
                console.log(`Found ${textElements.length} caption entries from innertube API`)

                transcript = textElements.map((element) => {
                  const start = Number.parseFloat(element.getAttribute("start") || "0")
                  const duration = Number.parseFloat(element.getAttribute("dur") || "0")
                  const text = decodeHtmlEntities(element.text)

                  return {
                    text,
                    offset: Math.round(start * 1000),
                    duration: Math.round(duration * 1000),
                  }
                })

                successfulMethod = "innertube API"
              }
            }
          }
        }
      } catch (e) {
        console.log("Failed to extract from innertube API:", e.message)
      }
    }

    // Method 4: Try to get the transcript list via the engagement panel
    if (transcript.length === 0) {
      console.log("Trying to get transcript via engagement panel")

      try {
        // Extract the ytInitialData JSON
        const initialDataMatch = html.match(/ytInitialData\s*=\s*({.+?});/s)
        if (initialDataMatch) {
          const initialData = JSON.parse(initialDataMatch[1])

          // Try to find the transcript panel in the engagement panels
          const engagementPanels = initialData?.engagementPanels || []
          const transcriptPanel = engagementPanels.find(
            (panel: any) =>
              panel?.engagementPanelSectionListRenderer?.panelIdentifier === "engagement-panel-transcript",
          )

          if (transcriptPanel) {
            console.log("Found transcript panel in engagement panels")

            // Extract the transcript data
            const transcriptRenderer = transcriptPanel?.engagementPanelSectionListRenderer?.content?.transcriptRenderer
            const transcriptItems = transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups

            if (transcriptItems && transcriptItems.length > 0) {
              console.log(`Found ${transcriptItems.length} transcript items in engagement panel`)

              transcript = transcriptItems.map((item: any) => {
                const cue = item.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
                const startMs = Number.parseInt(cue.startOffsetMs)
                const durationMs = Number.parseInt(cue.durationMs)
                const text = cue.cue.simpleText || cue.cue.runs?.map((run: any) => run.text).join("") || ""

                return {
                  text,
                  offset: startMs,
                  duration: durationMs,
                }
              })

              successfulMethod = "engagement panel"
            }
          }
        }
      } catch (e) {
        console.log("Failed to extract from engagement panel:", e.message)
      }
    }

    // Method 5: Try the get_transcript endpoint
    if (transcript.length === 0) {
      console.log("Trying get_transcript endpoint")

      try {
        const transcriptUrl = `https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}`

        const payload = {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: clientVersion,
              hl: "en",
              gl: "US",
            },
          },
          params: btoa(JSON.stringify({ videoId })),
        }

        const transcriptResponse = await axios.post(transcriptUrl, payload, {
          headers: {
            ...browserHeaders,
            "Content-Type": "application/json",
            Cookie: cookieString,
          },
        })

        if (transcriptResponse.data) {
          console.log("Got response from get_transcript endpoint")

          // Try to extract transcript data
          const transcriptRenderer =
            transcriptResponse.data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer
          const transcriptItems = transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups

          if (transcriptItems && transcriptItems.length > 0) {
            console.log(`Found ${transcriptItems.length} transcript items in get_transcript response`)

            transcript = transcriptItems.map((item: any) => {
              const cue = item.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
              const startMs = Number.parseInt(cue.startOffsetMs)
              const durationMs = Number.parseInt(cue.durationMs)
              const text = cue.cue.simpleText || cue.cue.runs?.map((run: any) => run.text).join("") || ""

              return {
                text,
                offset: startMs,
                duration: durationMs,
              }
            })

            successfulMethod = "get_transcript endpoint"
          }
        }
      } catch (e) {
        console.log("Failed to extract from get_transcript endpoint:", e.message)
      }
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "No captions available for this video. The video may not have captions, or they may be disabled by the content owner.",
          videoId,
          videoTitle,
          channelTitle,
          availableLanguages,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      transcript,
      videoTitle,
      channelTitle,
      publishedAt,
      method: successfulMethod,
      videoId,
      availableLanguages,
      language: languageCode,
    })
  } catch (error: any) {
    console.error("Error processing professional transcript request:", error)

    return NextResponse.json(
      {
        error: "Failed to extract transcript. Please try again or try a different video.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
