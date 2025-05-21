"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define schema for YouTube URL validation
const YouTubeURLSchema = z.string().refine(
  (url) => {
    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/
    return youtubeRegex.test(url)
  },
  {
    message: "Invalid YouTube URL. Please provide a valid YouTube video URL.",
  },
)

// Extract video ID from YouTube URL
export async function extractVideoId(url: string): Promise<string | null> {
  try {
    const validatedUrl = YouTubeURLSchema.parse(url)
    const match = validatedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

// Main function to extract transcript
export async function extractTranscript(formData: FormData) {
  try {
    const youtubeUrl = formData.get("youtubeUrl") as string
    const language = (formData.get("language") as string) || "en"

    if (!youtubeUrl) {
      return {
        error: "Please provide a YouTube URL",
      }
    }

    const videoId = await extractVideoId(youtubeUrl)

    if (!videoId) {
      return {
        error: "Invalid YouTube URL. Please provide a valid YouTube video URL.",
      }
    }

    // Try the headless API endpoint first (our most advanced method)
    try {
      console.log(`Trying headless transcript extraction with ${videoId}`)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/transcript-headless?videoId=${videoId}&lang=${language}`,
        {
          method: "GET",
        },
      )

      if (response.ok) {
        const data = await response.json()
        console.log(`Successfully extracted transcript with headless API`)

        revalidatePath("/")

        return {
          success: true,
          transcript: data.transcript,
          videoId,
          videoTitle: data.videoTitle,
          language: data.language,
          availableLanguages: data.availableLanguages,
          method: data.method || "headless browser API",
        }
      } else {
        const errorData = await response.json()
        console.log(`Headless API failed: ${errorData.error}`)

        // If headless API fails, try the professional API
        try {
          console.log(`Trying professional transcript extraction with ${videoId}`)
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/transcript-pro?videoId=${videoId}&lang=${language}`,
            {
              method: "GET",
            },
          )

          if (response.ok) {
            const data = await response.json()
            console.log(`Successfully extracted transcript with professional API`)

            revalidatePath("/")

            return {
              success: true,
              transcript: data.transcript,
              videoId,
              videoTitle: data.videoTitle,
              language: data.language,
              availableLanguages: data.availableLanguages,
              method: data.method || "professional API",
            }
          } else {
            const errorData = await response.json()
            console.log(`Professional API failed: ${errorData.error}`)

            // If professional API fails, try the fallback methods
            const fallbackMethods = ["/api/transcript", "/api/transcript-alt", "/api/transcript-browser"]
            let lastError = errorData.error || "Professional API failed"

            for (const method of fallbackMethods) {
              try {
                console.log(`Trying transcript extraction with ${method}`)
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}${method}?videoId=${videoId}`, {
                  method: "GET",
                })

                if (response.ok) {
                  const data = await response.json()
                  console.log(`Successfully extracted transcript with ${method}`)

                  revalidatePath("/")

                  return {
                    success: true,
                    transcript: data.transcript,
                    videoId,
                    videoTitle: data.videoTitle,
                    language: data.language,
                    availableLanguages: data.availableLanguages,
                    method: data.method || method,
                  }
                } else {
                  const errorData = await response.json()
                  lastError = errorData.error || `Failed with ${method}`
                  console.log(`Method ${method} failed: ${lastError}`)
                }
              } catch (error) {
                console.error(`Error with ${method}:`, error)
                lastError = `Error with ${method}: ${error.message}`
              }
            }

            return {
              error: lastError || "Failed to extract transcript after trying all methods",
            }
          }
        } catch (error) {
          console.error("Error with professional API:", error)

          // If professional API throws an exception, try the fallback methods
          const fallbackMethods = ["/api/transcript", "/api/transcript-alt", "/api/transcript-browser"]
          let lastError = `Error with professional API: ${error.message}`

          for (const method of fallbackMethods) {
            try {
              console.log(`Trying transcript extraction with ${method}`)
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}${method}?videoId=${videoId}`, {
                method: "GET",
              })

              if (response.ok) {
                const data = await response.json()
                console.log(`Successfully extracted transcript with ${method}`)

                revalidatePath("/")

                return {
                  success: true,
                  transcript: data.transcript,
                  videoId,
                  videoTitle: data.videoTitle,
                  language: data.language,
                  availableLanguages: data.availableLanguages,
                  method: data.method || method,
                }
              } else {
                const errorData = await response.json()
                lastError = errorData.error || `Failed with ${method}`
                console.log(`Method ${method} failed: ${lastError}`)
              }
            } catch (error) {
              console.error(`Error with ${method}:`, error)
              lastError = `Error with ${method}: ${error.message}`
            }
          }

          return {
            error: lastError || "Failed to extract transcript after trying all methods",
          }
        }
      }
    } catch (error) {
      console.error("Error with headless API:", error)

      // If headless API throws an exception, try the professional API
      try {
        console.log(`Trying professional transcript extraction with ${videoId}`)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/transcript-pro?videoId=${videoId}&lang=${language}`,
          {
            method: "GET",
          },
        )

        if (response.ok) {
          const data = await response.json()
          console.log(`Successfully extracted transcript with professional API`)

          revalidatePath("/")

          return {
            success: true,
            transcript: data.transcript,
            videoId,
            videoTitle: data.videoTitle,
            language: data.language,
            availableLanguages: data.availableLanguages,
            method: data.method || "professional API",
          }
        } else {
          const errorData = await response.json()
          console.log(`Professional API failed: ${errorData.error}`)

          // If professional API fails, try the fallback methods
          const fallbackMethods = ["/api/transcript", "/api/transcript-alt", "/api/transcript-browser"]
          let lastError = errorData.error || "Professional API failed"

          for (const method of fallbackMethods) {
            try {
              console.log(`Trying transcript extraction with ${method}`)
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}${method}?videoId=${videoId}`, {
                method: "GET",
              })

              if (response.ok) {
                const data = await response.json()
                console.log(`Successfully extracted transcript with ${method}`)

                revalidatePath("/")

                return {
                  success: true,
                  transcript: data.transcript,
                  videoId,
                  videoTitle: data.videoTitle,
                  language: data.language,
                  availableLanguages: data.availableLanguages,
                  method: data.method || method,
                }
              } else {
                const errorData = await response.json()
                lastError = errorData.error || `Failed with ${method}`
                console.log(`Method ${method} failed: ${lastError}`)
              }
            } catch (error) {
              console.error(`Error with ${method}:`, error)
              lastError = `Error with ${method}: ${error.message}`
            }
          }

          return {
            error: lastError || "Failed to extract transcript after trying all methods",
          }
        }
      } catch (error) {
        console.error("Error with professional API:", error)

        // If professional API throws an exception, try the fallback methods
        const fallbackMethods = ["/api/transcript", "/api/transcript-alt", "/api/transcript-browser"]
        let lastError = `Error with professional API: ${error.message}`

        for (const method of fallbackMethods) {
          try {
            console.log(`Trying transcript extraction with ${method}`)
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}${method}?videoId=${videoId}`, {
              method: "GET",
            })

            if (response.ok) {
              const data = await response.json()
              console.log(`Successfully extracted transcript with ${method}`)

              revalidatePath("/")

              return {
                success: true,
                transcript: data.transcript,
                videoId,
                videoTitle: data.videoTitle,
                language: data.language,
                availableLanguages: data.availableLanguages,
                method: data.method || method,
              }
            } else {
              const errorData = await response.json()
              lastError = errorData.error || `Failed with ${method}`
              console.log(`Method ${method} failed: ${lastError}`)
            }
          } catch (error) {
            console.error(`Error with ${method}:`, error)
            lastError = `Error with ${method}: ${error.message}`
          }
        }

        return {
          error: lastError || "Failed to extract transcript after trying all methods",
        }
      }
    }
  } catch (error) {
    console.error("Error extracting transcript:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

// Function to download transcript in different formats
export async function downloadTranscript(formData: FormData) {
  try {
    const videoId = formData.get("videoId") as string
    const format = formData.get("format") as string

    if (!videoId || !format) {
      return {
        error: "Missing required parameters",
      }
    }

    // Call our API to get the formatted transcript
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/download?videoId=${videoId}&format=${format}`,
      {
        method: "GET",
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        error: errorData.error || "Failed to download transcript",
      }
    }

    const data = await response.json()

    return {
      success: true,
      content: data.content,
      filename: data.filename,
    }
  } catch (error) {
    console.error("Error downloading transcript:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
    }
  }
}
