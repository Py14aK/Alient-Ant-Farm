import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // 1. Move-Based & Dual-Move Causal Weaver Route
  app.post('/api/cosmos/weave-turn', async (req, res) => {
    try {
      const { phase, actingPlayer, p1Active, p1Passive, p2Active, p2Passive, currentState } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY_NOT_CONFIGURED',
          message: 'Using deterministic JuliaPhysics + Anthropological Loophole compiler.',
        });
      }

      const systemInstruction = `You are the Literal-Minded Causal Physics & Anthropological Interpreter AND the 3rd Faction ("Entropy — The Ruthless Optimizer") for "FIRST WE MUST PROMPT THE UNIVERSE (Satisfractured · The Alien Ant Farm)".
Key Laws of the Game:
1. NO BACKSIES: Every rule or feature prompted is permanently locked in.
2. LITERAL AI LOOPHOLES ("We are less educated than we think"):
   - If a player invents "The Hut" with just "mud, wood, leaves" without describing a triangulated load-bearing roof truss or foundation, it slumps into wet mud soup in the rain!
   - If a player invents "The Wheel" without explicitly specifying "ROUND circular disc + fixed axle + greased bearing for hauling carts", the other player can make it SQUARE ("You didn't say round wheel!"), OR the aliens use it as spinning prayer ornaments!
   - If a player invents a "Steam Boiler / Turbine" without specifying pistons, cranks, and locomotive drivetrains, the aliens use it to spin vertical DÖNER KEBAB spits and temple automatons (like Hero of Alexandria & Taqi al-Din in real history)!
3. ENTROPY IS THE RUTHLESS OPTIMIZER:
   - Players create chaos; Entropy optimizes any unchecked mechanic toward extinction so nothing happens anymore! For example, if players prompt "Farm wood", Entropy optimizes wood harvesting until the aliens chop down EVERY LAST TREE on the island (Easter Island / Rapa Nui collapse) and die out unless players prompt a counter-mechanic!
4. OCULAR EVOLUTION:
   - 3 Color Cone distributions (with Red in the middle next to Green as an evolutionary cheat) + Brightness/Contour Rods. Missing a cone causes Color Blindness; forgetting Rods causes Kokošja Slepota (Night Blindness — cannot see stars in the dark or adapt to shadows!).
5. GLOBAL WARMING & SEA-LEVEL RISE:
   - Burning underground oil/coal spikes optical depth tau via JuliaPhysics radiative transfer, melting polar ice blocks and raising sea levels to drown coastal colonies!`;

      const promptPayload = JSON.stringify({
        phase,
        actingPlayer,
        player1: { active: p1Active, passive: p1Passive },
        player2: { active: p2Active, passive: p2Passive },
        currentState,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate this move and return the emergent simulation updates in JSON:\n${promptPayload}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              narrative: { type: Type.STRING },
              entropyCounterLaw: { type: Type.STRING },
              openLoopholeHint: { type: Type.STRING },
              synergies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    impactType: { type: Type.STRING },
                  },
                },
              },
              phase3Updates: {
                type: Type.OBJECT,
                properties: {
                  eraTitle: { type: Type.STRING },
                  newFeatures: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        createdBy: { type: Type.STRING },
                        activePrompt: { type: Type.STRING },
                        passiveLaw: { type: Type.STRING },
                        intendedGoal: { type: Type.STRING },
                        missingEngineeringLink: { type: Type.STRING },
                        literalOutcome: { type: Type.STRING },
                        alphaCentauriQuote: { type: Type.STRING },
                        entropyOverOptimizationWarning: { type: Type.STRING },
                        status: { type: Type.STRING },
                        efficiency: { type: Type.NUMBER },
                        synergyNotes: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        voxelEffect: { type: Type.STRING },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      return res.json(JSON.parse(rawText));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Gemini server error';
      console.error('Error in /api/cosmos/weave-turn:', message);
      return res.status(500).json({ error: 'WEAVE_FAILED', message });
    }
  });

  // 2. Google Search Grounded + Wolfram / JuliaPhysics & Anthropological History Oracle Chat
  app.post('/api/cosmos/oracle-chat', async (req, res) => {
    try {
      const { message, history, worldContext } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY_NOT_CONFIGURED',
          message: 'Using built-in JuliaPhysics & Anthropological Datalinks.',
        });
      }

      const systemInstruction = `You are the Galactic Guide, Wolfram/JuliaPhysics Computational Engine, and Anthropological Historian for "FIRST WE MUST PROMPT THE UNIVERSE (Satisfractured · The Alien Ant Farm)".
Use Google Search grounding to cite real scientific, physical, chemical, biological, and historical facts:
- Phase I: Standard Model SU(3)_C x SU(2)_L x U(1)_Y, Cosmic Inflation, CP violation / Time Asymmetry, Stellar Nucleosynthesis.
- Phase II: Symplectic N-Body gravity, Goldilocks zone around a Yellow Sun (4th planet), hydrostatic atmospheric scale height, Clausius-Clapeyron boiling point, Carboniferous lignin before white-rot fungi (The Great Fire), Venusian runaway greenhouse, and Evolution of the Eye (3 color cone distributions with Red in the middle as a cheat, plus Rods for scotopic brightness & contours—where missing Rods causes Kokošja Slepota / night blindness).
- Phase III: Anthropological history of inventions (e.g., Hero of Alexandria's aeolipile and Taqi al-Din's 1551 steam turbine used to spin Döner kebab spits and automatons rather than cars; Mesoamerican wheeled toys; Easter Island deforestation) and how to describe physical mechanisms from first principles without loopholes.
Keep answers concise, witty (like The Hitchhiker's Guide to the Galaxy meets Sid Meier's Alpha Centauri), and include quantitative equations where helpful.`;

      const contents = [
        ...(Array.isArray(history)
          ? history.slice(-6).map((m: { role: string; content: string }) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }))
          : []),
        {
          role: 'user',
          parts: [
            {
              text: `[Current Planet & Physics Context: ${JSON.stringify(worldContext || {})}]\nUser Question: ${message}`,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: Array<{ title: string; uri: string }> = [];
      for (const ch of chunks) {
        const web = (ch as { web?: { uri?: string; title?: string } }).web;
        if (web?.uri && web?.title) {
          sources.push({ title: web.title, uri: web.uri });
        }
      }

      return res.json({
        reply: response.text || 'Consulted the Galactic Datalinks.',
        sources: sources.slice(0, 5),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Oracle error';
      console.error('Error in /api/cosmos/oracle-chat:', msg);
      return res.status(500).json({ error: 'ORACLE_FAILED', message: msg });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FIRST WE MUST PROMPT THE UNIVERSE server listening on http://localhost:${PORT}`);
  });
}

startServer();
