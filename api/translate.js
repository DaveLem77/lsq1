import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST seulement" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Clé OpenAI non configurée sur Vercel." });
  }

  const { frames } = req.body || {};
  if (!Array.isArray(frames) || frames.length < 4) {
    return res.status(400).json({ error: "Pas assez d'images." });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-6-astra",
      reasoning: { effort: "low" },
      store: false,
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Tu analyses une séquence d'images dans l'ordre chronologique.
Objectif: reconnaître de la Langue des signes québécoise (LSQ).

Observe les deux mains, les doigts, l'orientation, l'emplacement,
le mouvement entre les images, le visage, la bouche, les sourcils,
la tête et le haut du corps.

Ne juge jamais sur une seule image.
Ne devine pas si tu n'es pas assez certain.

Réponds UNIQUEMENT avec un JSON valide:
{
  "detected": true,
  "french": "traduction naturelle en français",
  "glosses": ["SIGNE1", "SIGNE2"],
  "confidence": 0.0
}

Si tu n'es pas assez certain:
{
  "detected": false,
  "french": "",
  "glosses": [],
  "confidence": 0.0
}`
          },
          ...frames.map(image_url => ({
            type: "input_image",
            image_url,
            detail: "high"
          }))
        ]
      }]
    });

    let text = (response.output_text || "").trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detected: false, french: "", glosses: [], confidence: 0 };
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Erreur Astra" });
  }
}
