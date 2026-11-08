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

  app.post('/api/cosmos/weave-turn', async (req, res) => {
    try {
      const { phase, p1Active, p1Passive, p2Active, p2Passive, currentState } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY_NOT_CONFIGURED',
          message: 'Using deterministic causal physics compiler.',
        });
      }

      const systemInstruction = `You are the Causal Weaver and the 3rd Faction AI ("Entropy / The Great Silence") for a two-player emergent strategy god-game ("Aethelgard: The Ant-Farm Cosmos").
Each turn:
- Player 1 declares an ACTIVE manifestation and a PASSIVE law/condition.
- Player 2 declares an ACTIVE manifestation and a PASSIVE law/condition.
- You also act as the 3rd Faction (ENTROPY), introducing a counter-law that seeks thermodynamic stillness, cooling, petrification, gridlock, or equilibrium so nothing happens anymore.

Follow the rules of the current Phase:
- PHASE 1 (Cooperative Big Bang, Time Symmetry, Gravity, Electricity & Molecular Clouds):
  The two players work constructively together to define the arrow of time ('forward' | 'reversible_echo' | 'dilated'), Gravity vs. Electricity balance, and Molecular Cloud nucleosynthesis to ignite the Sun and synthesize elements (hydrogen, carbon, oxygen, sulfur, iron, silicates).
- PHASE 2 (3D Solar System Simulator & Molecular/Planetary Emergence):
  On their chosen world (${currentState?.phase2?.selectedWorldType || 'rocky'}), players create planetary attributes: Density/Mass, Acidity, H2O, Alcohol, Carbon bonding rules, RNA, DNA, and Bacteria/Mushrooms.
  CRITICAL EMERGENCE RULES:
  1. If CO2/Sulfur or Acidity is high and NEITHER player has created carbon/sulfur-consuming bacteria, the planet shifts toward 'venusian_greenhouse' ("Oops, we forgot to create bacteria -> Venus world!").
  2. If Gravity/Mass is pushed very high (densityG > 1.75), it becomes 'super_dense_crusher' ("Oh, we are too dense!").
  3. If woody carbon ('woody_lignin') exists without wood-eating bacteria or mushrooms ('woodDecomposerFungi' === false), dead wood builds up and triggers 'great_fire_inferno' ("The Great Fire")!
  4. If H2O + sugars/carbon ferment without oxygen balance, it creates 'alcohol_ferment_sea'.
- PHASE 3 (The Ant-Farm Colony & Divergent Prompt Strategy Sandbox):
  The Universe and Planet Constitution are now SET IN STONE (${JSON.stringify(currentState?.phase2 || {})}).
  Players influence their autonomous alien ant-farm colony by prompting ANY new feature—from farming wood, rain, or drought, to SimCity traffic & road networks, to Age of Empires resource gathering, castles, and RTS sieges (e.g., 100 Orcs at the gates + Wind vs. Elven Archers + Rain -> Rain creates Mud slowing Orcs; Wind scatters Archer arrows).
  Compile their prompts into concrete newFeatures, weatherUpdate, spawnAgents, and causal synergies constrained by the locked planet!`;

      const promptText = JSON.stringify({
        phase,
        player1: { active: p1Active, passive: p1Passive },
        player2: { active: p2Active, passive: p2Passive },
        currentState,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate this turn and return the emergent simulation updates in JSON:\n${promptText}`,
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
              entropyDelta: { type: Type.NUMBER },
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
              phase1Updates: {
                type: Type.OBJECT,
                properties: {
                  timeArrow: { type: Type.STRING },
                  gravityStrengthDelta: { type: Type.NUMBER },
                  electricityStrengthDelta: { type: Type.NUMBER },
                  molecularCloudDelta: { type: Type.NUMBER },
                  igniteSun: { type: Type.BOOLEAN },
                  starSpectralClass: { type: Type.STRING },
                  starColorHex: { type: Type.STRING },
                },
              },
              phase2Updates: {
                type: Type.OBJECT,
                properties: {
                  densityGDelta: { type: Type.NUMBER },
                  h2oDelta: { type: Type.NUMBER },
                  alcoholDelta: { type: Type.NUMBER },
                  acidityDelta: { type: Type.NUMBER },
                  co2SulfurDelta: { type: Type.NUMBER },
                  oxygenDelta: { type: Type.NUMBER },
                  carbonComplexity: { type: Type.STRING },
                  rnaPresent: { type: Type.BOOLEAN },
                  dnaPresent: { type: Type.BOOLEAN },
                  carbonSulfurBacteria: { type: Type.BOOLEAN },
                  retinalPurpleMicrobes: { type: Type.BOOLEAN },
                  woodDecomposerFungi: { type: Type.BOOLEAN },
                  deadWoodDelta: { type: Type.NUMBER },
                  triggerGreatFire: { type: Type.BOOLEAN },
                  emergentArchetype: { type: Type.STRING },
                  diagnosticAlerts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
              },
              phase3Updates: {
                type: Type.OBJECT,
                properties: {
                  eraTitle: { type: Type.STRING },
                  simCityCivicDelta: { type: Type.NUMBER },
                  aoeEmpireWarDelta: { type: Type.NUMBER },
                  dwarfSubterraneanDelta: { type: Type.NUMBER },
                  ecologicalChaosDelta: { type: Type.NUMBER },
                  timberDelta: { type: Type.NUMBER },
                  stoneOreDelta: { type: Type.NUMBER },
                  biomassDelta: { type: Type.NUMBER },
                  trafficFlowDelta: { type: Type.NUMBER },
                  populationDelta: { type: Type.NUMBER },
                  windSpeed: { type: Type.NUMBER },
                  precipitation: { type: Type.STRING },
                  mudCoverage: { type: Type.NUMBER },
                  arrowScatterPenalty: { type: Type.NUMBER },
                  orcSpeedPenalty: { type: Type.NUMBER },
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
                  spawnAgents: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        faction: { type: Type.STRING },
                        role: { type: Type.STRING },
                        label: { type: Type.STRING },
                        count: { type: Type.NUMBER },
                        statusEffect: { type: Type.STRING },
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
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown Gemini server error';
      console.error('Error in /api/cosmos/weave-turn:', message);
      return res.status(500).json({ error: 'WEAVE_FAILED', message });
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
    console.log(`Aethelgard Cosmos server listening on http://localhost:${PORT}`);
  });
}

startServer();
