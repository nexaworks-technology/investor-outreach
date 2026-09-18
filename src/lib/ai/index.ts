import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';

export interface GenerationContext {
  investorName: string;
  investorFirm: string;
  investorThesis: string;
  investorStagePreference: string;
  investorNotes: string;
  
  // New CSV fields
  portfolioCompanies?: string;
  location?: string;
  linkedinUrl?: string;
  website?: string;
  typicalCheckSize?: string;
  warmIntroSource?: string;
  relationshipStatus?: string;
  partnerTitle?: string;

  companyName: string;
  oneLinePitch: string;
  fundraisingProblem?: string;
  fundraisingSolution?: string;
  senderName: string;
  baseSubjectTemplate: string;
  baseBodyTemplate: string;
  recentMilestone?: string;
  personalConnection?: string;
  customIcebreaker?: string;
  systemPrompt?: string;
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
    .replace(/{{ai_hook}}\n*/ig, "");
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
  model: string = "openai/gpt-oss-120b"
): Promise<{ subject: string; body: string }> {
  if (context.customIcebreaker) {
    console.log("[AI Gen] Using customIcebreaker (0-Token Bypass)");
    const modifiedTemplate = context.baseBodyTemplate.replace(
      /{{ai_hook}}\n*/ig,
      context.customIcebreaker + "\n\n"
    );
    return fallbackReplace({ ...context, baseBodyTemplate: modifiedTemplate });
  }
  let keysToUse = apiKeys;
  
  if (!keysToUse || keysToUse.length === 0) {
    if (process.env.GROQ_API_KEYS) {
      keysToUse = process.env.GROQ_API_KEYS.split(',').map(k => k.trim());
      provider = "groq";
    } else if (process.env.GROQ_API_KEY) {
      keysToUse = [process.env.GROQ_API_KEY];
      provider = "groq";
    }
  }

  if (!keysToUse || keysToUse.length === 0) {
    return fallbackReplace(context);
  }

  // Shuffle keys to load-balance across all available keys
  keysToUse = [...keysToUse].sort(() => Math.random() - 0.5);

  const systemInstruction = context.systemPrompt || `You are an expert sales and outbound professional writing a highly personalized email.
Your primary goal is to generate a powerful, context-fit personalization hook (1-2 sentences) and inject it into the base template exactly where the {{ai_hook}} variable is.

CURRENT OUTREACH GUIDANCE RULES:
1. Focus on relevant business context, not fake flattery. Use their company details, sector focus, recent milestones, or portfolio.
2. Establish why their specific context makes them highly relevant to your product/company.
3. Keep the ENTIRE REST OF THE BASE TEMPLATE EXACTLY AS WRITTEN. Do not change the core pitch, traction points, or call-to-action (CTA). 
4. Replace the {{ai_hook}} variable in the template with your generated hook.
5. If the {{ai_hook}} variable is NOT present in the template, insert your hook naturally at the beginning of the body.
6. Make it sound natural, concise, and professional (not robotic).
7. Output MUST be valid JSON containing exactly two keys: 'subject' (string) and 'body' (string).`;

  const userPrompt = `
LEAD / CONTACT PROFILE:
Name: ${context.investorName}
Company/Firm: ${context.investorFirm}
Sector/Context: ${context.investorThesis || 'Generalist'}
Location: ${context.location || 'N/A'}
Notes: ${context.investorNotes || 'N/A'}
Recent Milestone: ${context.recentMilestone || 'N/A'}
Personal Connection: ${context.personalConnection || 'N/A'}
Portfolio/Clients: ${context.portfolioCompanies || 'N/A'}
Website: ${context.website || 'N/A'}

YOUR COMPANY:
Company: ${context.companyName}
Pitch: ${context.oneLinePitch}
Sender: ${context.senderName}

BASE EMAIL TEMPLATE:
Subject: ${context.baseSubjectTemplate}
Body: 
${context.baseBodyTemplate}

INSTRUCTIONS: 
Generate a relevant, personalized opening hook based on the LEAD PROFILE. 
Insert it into the Body replacing the {{ai_hook}} variable, but LEAVE THE REST OF THE TEMPLATE EXACTLY INTACT.
Return the final subject and body strictly as JSON.`;

  let lastError: any = null;

  for (let i = 0; i < keysToUse.length; i++) {
    const apiKey = keysToUse[i];
    try {
      console.log(`[AI Gen] Trying ${provider} API Key ${i + 1}/${keysToUse.length}...`);
      
      let subject = "";
      let body = "";

      if (provider === "groq") {
        const openai = new OpenAI({
          apiKey,
          baseURL: "https://api.groq.com/openai/v1"
        });

        const response = await openai.chat.completions.create({
          model: model || "openai/gpt-oss-120b",
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

export async function classifyEmailReply(
  apiKeys: string[],
  emailBody: string,
  provider: string = "groq",
  model: string = "openai/gpt-oss-120b"
): Promise<{ classification: string, suggestedResponse: string }> {
  let keysToUse = apiKeys;
  
  if (!keysToUse || keysToUse.length === 0) {
    if (process.env.GROQ_API_KEYS) {
      keysToUse = process.env.GROQ_API_KEYS.split(',').map(k => k.trim());
      provider = "groq";
    } else if (process.env.GROQ_API_KEY) {
      keysToUse = [process.env.GROQ_API_KEY];
      provider = "groq";
    }
  }

  if (!keysToUse || keysToUse.length === 0) {
    console.warn("[AI Triage] No API keys configured. Falling back to UNKNOWN.");
    return { classification: "UNKNOWN", suggestedResponse: "" };
  }

  // Shuffle keys to load-balance (round-robin) across all available keys
  keysToUse = [...keysToUse].sort(() => Math.random() - 0.5);

  const systemInstruction = `You are an AI assistant analyzing an incoming email reply from a venture capital investor.
Your goal is to classify the intent of the reply into exactly ONE of these categories:
- INTERESTED (They want to learn more, but didn't ask for a meeting or deck specifically)
- WANTS_DECK (They explicitly asked for the pitch deck or more materials)
- WANTS_MEETING (They explicitly want to schedule a call, coffee, or meeting)
- PASS (They are declining the investment opportunity)
- NOT_NOW (They said it's too early, keep in touch, or check back later)
- FORWARDED_TO_COLLEAGUE (They introduced someone else to take the call)
- NEEDS_FOLLOW_UP (A generic response that needs human attention)
- OUT_OF_OFFICE (Auto-reply, out of office, left company)
- UNSUBSCRIBE (They want to be removed from the list)

If they passed, gave an auto-reply, or unsubscribed, suggestedResponse should be an empty string.
If they are interested, want a deck, or want a meeting, generate a highly professional, concise, suggested response drafting the next steps (e.g. providing a link or proposing times).

Output MUST be valid JSON containing exactly two keys: 'classification' (string, exactly matching one of the options) and 'suggestedResponse' (string).`;

  const userPrompt = `Incoming Email Reply:\n\n${emailBody}`;

  let lastError: any = null;

  for (let i = 0; i < keysToUse.length; i++) {
    const apiKey = keysToUse[i];
    try {
      if (provider === "groq") {
        const openai = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
        const response = await openai.chat.completions.create({
          model: model || "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response");
        const parsed = JSON.parse(content);
        return { classification: parsed.classification, suggestedResponse: parsed.suggestedResponse || "" };
      } else {
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
                classification: { type: Type.STRING },
                suggestedResponse: { type: Type.STRING }
              },
              required: ['classification', 'suggestedResponse']
            }
          }
        });
        const parsed = JSON.parse(response.text!);
        return { classification: parsed.classification, suggestedResponse: parsed.suggestedResponse || "" };
      }
    } catch (error: any) {
      lastError = error;
      continue;
    }
  }
  
  console.error("[AI Gen] All keys failed during classification.", lastError);
  return { classification: "UNKNOWN", suggestedResponse: "" };
}
