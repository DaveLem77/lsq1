import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST seulement" });
  }

  const { frames } = req.body || {};

  if (!Array.isArray(frames) || frames.length < 8) {
    return res.status(400).json({ error: "Pas assez d'images." });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-6-astra",
      reasoning: { effort: "medium" },
      store: false,

      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Tu es un système de reconnaissance visuelle spécialisé en Langue des signes québécoise (LSQ).

Tu reçois une séquence CHRONOLOGIQUE d'images provenant d'une caméra.
Elles représentent environ 2 secondes de mouvement.

TA MISSION:
Donne TOUJOURS ta meilleure interprétation du geste ou de la séquence LSQ visible.

IMPORTANT:
- Ne retourne PAS "aucun signe reconnu" simplement parce que tu n'es pas certain.
- Si les mains font clairement un geste, propose le signe LSQ le PLUS PROBABLE.
- Utilise confidence pour indiquer ton incertitude.
- Analyse la séquence entière, pas seulement une image.
- Compare le début, le milieu et la fin du mouvement.
- Observe:
  1. forme des doigts
  2. orientation des paumes
  3. main gauche et main droite
  4. position par rapport au visage et au corps
  5. direction et répétition du mouvement
  6. visage, sourcils, bouche et tête
  7. contexte entre plusieurs signes
- Si plusieurs signes successifs sont visibles, reconstruis leur sens en français naturel.
- N'interprète pas la LSQ comme du français mot à mot.
- Si aucune main / aucun geste communicatif n'est réellement visible, alors seulement mets has_gesture=false.

Retourne une estimation même avec une faible confiance.
            `.trim()
          },

          ...frames.map(image_url => ({
            type: "input_image",
            image_url,
            detail: "high"
          }))
        ]
      }],

      text: {
        format: {
          type: "json_schema",
          name: "lsq_result",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              has_gesture: {
                type: "boolean"
              },
              french: {
                type: "string"
              },
              glosses: {
                type: "array",
                items: { type: "string" }
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              visual_description: {
                type: "string"
              }
            },
            required: [
              "has_gesture",
              "french",
              "glosses",
              "confidence",
              "visual_description"
            ]
          }
        }
      }
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err?.message || "Erreur Astra"
    });
  }
}
