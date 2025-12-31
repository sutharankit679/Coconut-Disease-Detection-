// 👇 VERY IMPORTANT (Vercel ko Node runtime bata raha hai)
export const config = {
  runtime: "nodejs18"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const BACKEND_URL =
      "https://ml-model-backend-rczq.onrender.com/api/predict";

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "Backend responded with error",
        details: text
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({
      error: "Failed to reach ML backend"
    });
  }
}
