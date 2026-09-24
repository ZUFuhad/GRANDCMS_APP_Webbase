import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Grand CMS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Agentic Growth System - AI Client Discovery Endpoint
app.post('/api/discovery', async (req: Request, res: Response) => {
  try {
    const { industry = 'Corporate & FMCG', region = 'Chattogram', count = 3 } = req.body;

    const prompt = `You are the lead B2B Growth Strategy & Discovery Agent for "GRAND Communication & Marketing" (EST. 2004, located in Kazir Dewri, CDA Market, Chattogram, Bangladesh). 
GRAND is a 22-year premier event setup, signage fabrication, and branding service agency specializing in wooden frame Borfi, Standee, Festoon, Backlit Flex signboards, exhibition pavilions, and corporate branding.

Target Industry: ${industry}
Target Geographic Region: ${region}
Number of qualified B2B client prospects to discover: ${count}

Generate a comprehensive B2B prospecting dossier with realistic corporate companies, banks, real estate conglomerates, or retail chains in Bangladesh that require event setups, branding, or signage.
For each company, diagnose their event/signage needs, create an irresistible pitch emphasizing Grand's in-house fabrication workshop, 22-year reliability, and provide ready-to-send cold outreach copy (Cold Email and WhatsApp message).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an elite B2B sales development AI agent for a signage and event fabrication agency in Bangladesh. Output strict, valid JSON with no markdown wrapping.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of discovered corporate client prospects for Grand Communication',
          items: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING },
              industry: { type: Type.STRING },
              location: { type: Type.STRING },
              potentialServices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific services like Borfi setup, 2x4 Standees, Stage Backdrops, Outlet Signboards',
              },
              estimatedBudget: { type: Type.STRING },
              painPoint: { type: Type.STRING },
              strategicPitch: { type: Type.STRING },
              suggestedColdEmail: { type: Type.STRING },
              whatsappMessage: { type: Type.STRING },
            },
            required: [
              'companyName',
              'industry',
              'location',
              'potentialServices',
              'estimatedBudget',
              'painPoint',
              'strategicPitch',
              'suggestedColdEmail',
              'whatsappMessage',
            ],
          },
        },
      },
    });

    const outputText = response.text || '[]';
    const parsedData = JSON.parse(outputText);

    res.json({
      success: true,
      prospects: parsedData,
    });
  } catch (error: any) {
    console.error('Error in /api/discovery:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to discover clients with AI',
    });
  }
});

// AI-driven Design Generator Endpoint
app.post('/api/ai-design', async (req: Request, res: Response) => {
  try {
    const {
      type = 'Borfi Frame',
      industry = 'Beverage / Corporate',
      dimensions = '3X3=9sqf',
      theme = 'Festive Gold & Crimson Exhibition Style',
    } = req.body;

    const prompt = `You are the Master Creative Director & Production Engineer for "GRAND Communication & Marketing" (EST. 2004, Kazir Dewri, Chattogram).
Generate a comprehensive production design blueprint and visual SVG code for:
- Asset Type: ${type} (e.g. Borfi wooden frame, Standee, Festoon, Backlit Signboard, Pavilion Backdrop)
- Client Industry: ${industry}
- Dimensions: ${dimensions}
- Theme & Mood: ${theme}

Provide:
1. Detailed Material Specifications (exact media grade like 340gsm black media PVC, seasoned Garjan wood frame thickness, 1" MS pipe, UV resistance).
2. Color Scheme with 4-5 exact HEX codes.
3. Structural layout concept and typography hierarchy.
4. Production safety and installation guidelines (specifically regarding city corporation clearance, wind resistance, and night lighting).
5. Clean, standalone SVG vector code illustrating the design mockup (dimensions 600x400) with beautiful gradients, clear text, frame borders, and visual graphics.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a senior creative & structural design director for signage and event fabrication. Output strict, valid JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            type: { type: Type.STRING },
            dimensions: { type: Type.STRING },
            materialRecommendation: { type: Type.STRING },
            frameStructure: { type: Type.STRING },
            colorScheme: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            layoutConcept: { type: Type.STRING },
            fabricationSpecs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            productionAdvice: { type: Type.STRING },
            promptForRenderer: { type: Type.STRING },
            svgMockup: {
              type: Type.STRING,
              description: 'Valid raw SVG code starting with <svg and ending with </svg> representing the mockup preview',
            },
          },
          required: [
            'projectName',
            'type',
            'dimensions',
            'materialRecommendation',
            'frameStructure',
            'colorScheme',
            'layoutConcept',
            'fabricationSpecs',
            'productionAdvice',
            'promptForRenderer',
            'svgMockup',
          ],
        },
      },
    });

    const outputText = response.text || '{}';
    const parsed = JSON.parse(outputText);

    res.json({
      success: true,
      design: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/ai-design:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate design concept',
    });
  }
});

// General Gemini Generate Endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an intelligent executive assistant for Grand CMS.',
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/generate:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Gemini generation error',
    });
  }
});

// Vite Integration (Dev) or Static Hosting (Prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Grand CMS] Fullstack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
