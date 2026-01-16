// 👇 Standard Vercel/Next.js config
export const config = {
  api: {
    bodyParser: true, // Ensures req.body is parsed
  },
  // If you are on Vercel Pro, you can increase this. 
  // On Hobby (Free), this is capped at 10s or 60s depending on settings.
  maxDuration: 60, 
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const BACKEND_URL = "https://ml-model-backend-rczq.onrender.com/api/predict";

    console.log("1. Sending request to Render...");

    // Added AbortSignal to handle timeouts manually if needed
    const controller = new AbortController();
    // Set a timeout slightly shorter than Vercel's limit to catch it gracefully
    const timeoutId = setTimeout(() => controller.abort(), 55000); 

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear timeout if successful

    console.log(`2. Render responded with status: ${response.status}`);

    // Parse the response
    const data = await response.json();

    // If Render returned an error (4xx or 5xx), pass that status to the frontend
    // Don't force it to be 500
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Upstream Backend Error",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy error:", err);

    // Specific error handling for Timeouts
    if (err.name === 'AbortError' || err.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: "Gateway Timeout",
        message: "The ML model took too long to wake up. Please try again in 1 minute."
      });
    }

    return res.status(500).json({
      error: "Internal Proxy Error",
      details: err.message
    });
  }
}
