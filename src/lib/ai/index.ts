import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';

export interface GenerationContext {
  investorName: string;
  investorFirm: string;
  investorThesis: string;
  investorStagePreference: string;
  investorNotes: string;
  companyName: string;
  oneLinePitch: string;
  fundraisingProblem: string;
  fundraisingSolution: string;
  senderName: string;
  baseSubjectTemplate: string;
  baseBodyTemplate: string;
}

export function interpolateVariables(text: string, context: GenerationContext) {
  if (!text) return text;
  return text
    .replace(/{{first_name}}/ig, context.investorName.split(" ")[0] || "")
    .replace(/{{investor_name}}/ig, context.investorName || "")
    .replace(/{{investorName}}/ig, context.investorName || "")
    .replace(/{{investor\.name}}/ig, context.investorName || "")
    .replace(/{{firm_name}}/ig, context.investorFirm || "")
    .replace(/{{investorFirm}}/ig, context.investorFirm || "")
    .replace(/{{investor\.firm}}/ig, context.investorFirm || "")
    .replace(/{{investor\.stagePreference}}/ig, context.investorStagePreference || "")
    .replace(/{{company_name}}/ig, context.companyName || "")
    .replace(/{{companyName}}/ig, context.companyName || "")
    .replace(/{{company\.name}}/ig, context.companyName || "")
    .replace(/{{oneLinePitch}}/ig, context.oneLinePitch || "")
    .replace(/{{senderName}}/ig, context.senderName || "")
    .replace(/{{sender\.name}}/ig, context.senderName || "")
    .replace(/\[AI will generate personalization hook here based on thesis\]\n*/ig, "");
}

function fallbackReplace(context: GenerationContext) {
  const subject = interpolateVariables(context.baseSubjectTemplate, context);
  const body = interpolateVariables(context.baseBodyTemplate, context);
  return { subject, body };
}

export async function generatePersonalizedEmail(
  apiKeys: string[],
  context: GenerationContext,
  provider: string = "groq",
  model: string = "llama-3.3-70b-versatile"
): Promise<{ subject: string; body: string }> {
  if (!apiKeys || apiKeys.length === 0) {
    return fallbackReplace(context);
  }

  const systemInstruction = `You are a world-class startup founder sending a highly personalized cold/warm email to a VC/Angel investor. 
Your primary goal is to generate a powerful, thesis-fit personalization hook (the first sentence) and integrate it with the provided base template.

CURRENT 2026 OUTREACH GUIDANCE RULES:
1. Focus on THESIS-FIT personalization, not fake flattery. Never use LinkedIn stalking trivia like "I noticed you went to Stanford".
2. Establish why their specific portfolio, past investments, or stated thesis makes them relevant to your startup.
3. Example hooks:
   - "I saw your investment in [Company], particularly your focus on software reducing operational bottlenecks in physical industries."
   - "I’ve been following your thesis around AI applied to traditional industries, and [MyCompany] felt unusually aligned."
   - "Your investment in [Company] caught my attention because it tackles the same pattern we see in textile manufacturing..."
4. Keep the ENTIRE REST OF THE BASE TEMPLATE EXACTLY AS WRITTEN. Do not change the core pitch, traction points, the funding ask, or the call-to-action (CTA). 
5. Replace the placeholder hook in the template with your generated thesis-fit hook.
6. Make it sound natural, concise, and professional (not robotic).
7. Output MUST be valid JSON containing exactly two keys: 'subject' (string) and 'body' (string).`;

  const userPrompt = `
INVESTOR PROFILE:
Name: ${context.investorName}
Firm: ${context.investorFirm}
Thesis/Sector Focus: ${context.investorThesis || 'Generalist'}
Notes/Recent Activity: ${context.investorNotes || 'N/A'}
Recent Investments: ${context.investorNotes || 'N/A'}

YOUR STARTUP:
Company: ${context.companyName}
Pitch: ${context.oneLinePitch}
Problem we solve: ${context.fundraisingProblem}
Our Solution: ${context.fundraisingSolution}
Sender: ${context.senderName}

BASE EMAIL TEMPLATE:
Subject: ${context.baseSubjectTemplate}
Body: 
${context.baseBodyTemplate}

INSTRUCTIONS: 
Generate a thesis-fit opening sentence based on the INVESTOR PROFILE. 
Insert it at the beginning of the Body, replacing any generic greeting/hook, but LEAVE THE REST OF THE TEMPLATE EXACTLY INTACT.
Return the final subject and body strictly as JSON.`;

  let lastError: any = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    try {
      console.log(`[AI Gen] Trying ${provider} API Key ${i + 1}/${apiKeys.length}...`);
      
      let subject = "";
      let body = "";

      if (provider === "groq") {
        const openai = new OpenAI({
          apiKey,
          baseURL: "https://api.groq.com/openai/v1"
        });

        const response = await openai.chat.completions.create({
          model: model || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response from AI");
        
        const parsed = JSON.parse(content);
        subject = parsed.subject;
        body = parsed.body;

      } else {
        // Fallback to Gemini
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "The personalized email subject line" },
                body: { type: Type.STRING, description: "The personalized email body" }
              },
              required: ['subject', 'body']
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        
        const parsed = JSON.parse(text);
        subject = parsed.subject;
        body = parsed.body;
      }

      if (!subject || !body) throw new Error("Invalid schema returned");
      
      console.log(`[AI Gen] Success using Key ${i + 1}`);
      return { 
        subject: interpolateVariables(subject, context), 
        body: interpolateVariables(body, context) 
      };
      
    } catch (error: any) {
      lastError = error;
      const msg = error.message || String(error);
      if (msg.includes('429') || error.status === 429) {
        console.warn(`[AI Gen] Key ${i + 1} rate limited. Moving to next...`);
        continue;
      }
      console.warn(`[AI Gen] Key ${i + 1} failed: ${msg}. Moving to next...`);
      continue;
    }
  }

  console.error("[AI Gen] All keys failed. Falling back to basic replace.", lastError);
  return fallbackReplace(context);
}
