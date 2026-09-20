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
    .replace(/{{company_name}}/ig, context.companyName || "")
    .replace(/{{companyName}}/ig, context.companyName || "")
    .replace(/{{sender_name}}/ig, context.senderName || "")
    .replace(/{{senderName}}/ig, context.senderName || "")
    .replace(/{{firm_name}}/ig, context.investorFirm || "")
    .replace(/{{investorFirm}}/ig, context.investorFirm || "");
}

function fallbackReplace(context: GenerationContext) {
  return {
    subject: interpolateVariables(context.baseSubjectTemplate, context),
    body: interpolateVariables(context.baseBodyTemplate.replace(/{{ai_hook}}\n*/ig, ""), context)
  };
}

interface ProviderConfig {
  provider: 'zai' | 'groq' | 'gemini';
  apiKey: string;
  model: string;
  baseURL?: string;
}

function getAvailableProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  
  // Z.AI
  if (process.env.ZAI_API_KEY) {
    const keys = process.env.ZAI_API_KEY.split(',').map(k => k.trim());
    for (const key of keys) {
      if (key) providers.push({ provider: 'zai', apiKey: key, model: 'glm-4.7-flash', baseURL: 'https://api.z.ai/api/paas/v4/' });
    }
  }

  // Groq
  if (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY) {
    const keysString = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    const keys = keysString.split(',').map(k => k.trim());
    for (const key of keys) {
      if (key) providers.push({ provider: 'groq', apiKey: key, model: 'openai/gpt-oss-120b', baseURL: 'https://api.groq.com/openai/v1' });
    }
  }

  // Gemini
  if (process.env.GEMINI_API_KEY) {
    const keys = process.env.GEMINI_API_KEY.split(',').map(k => k.trim());
    for (const key of keys) {
      if (key) providers.push({ provider: 'gemini', apiKey: key, model: 'gemini-2.5-flash' });
    }
  }

  // Shuffle for load balancing
  return providers.sort(() => Math.random() - 0.5);
}


export async function generatePersonalizedEmail(
  apiKeys: string[],
  context: GenerationContext,
  provider: string = "zai",
  model: string = "glm-4.7-flash"
): Promise<{ subject: string; body: string }> {
  if (context.customIcebreaker) {
    console.log("[AI Gen] Using customIcebreaker (0-Token Bypass)");
    const modifiedTemplate = context.baseBodyTemplate.replace(
      /{{ai_hook}}\n*/ig,
      context.customIcebreaker + "\n\n"
    );
    return fallbackReplace({ ...context, baseBodyTemplate: modifiedTemplate });
  }

  const providersToUse = getAvailableProviders();

  if (providersToUse.length === 0) {
    return fallbackReplace(context);
  }

  const systemInstruction = context.systemPrompt || `You are an elite B2B sales copywriter writing a highly personalized cold email hook.
Your ONLY job is to generate a personalized opening line/hook based on the lead's profile.
Do NOT write the entire email. Only write the hook.

Rules:
1. The hook must be exactly 1-2 short sentences.
2. It must be highly personalized using the provided LEAD PROFILE data (e.g., recent milestones, portfolio companies, sector focus).
3. If no specific personalized data is available, write a strong, concise, generic opening relevant to their sector.
4. Do NOT use placeholder variables like [Company Name].
5. Do NOT start with "Hi" or "Dear" (that is handled by the template).
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

  for (let i = 0; i < providersToUse.length; i++) {
    const config = providersToUse[i];
    try {
      console.log(`[AI Gen] Trying ${config.provider} API Key ${i + 1}/${providersToUse.length}...`);
      
      let subject = "";
      let body = "";

      if (config.provider === "groq" || config.provider === "zai") {
        const openai = new OpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseURL
        });

        const response = await openai.chat.completions.create({
          model: config.model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response from AI");
        
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          // If JSON parse fails, try to extract json block
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
          else throw new Error("Failed to parse JSON response");
        }
        
        subject = parsed.subject;
        body = parsed.body;

      } else if (config.provider === "gemini") {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        
        const response = await ai.models.generateContent({
          model: config.model,
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
      
      console.log(`[AI Gen] Success using ${config.provider}`);
      return { 
        subject: interpolateVariables(subject, context), 
        body: interpolateVariables(body, context) 
      };
      
    } catch (error: any) {
      lastError = error;
      const msg = error.message || String(error);
      if (msg.includes('429') || error.status === 429) {
        console.warn(`[AI Gen] ${config.provider} rate limited. Moving to next...`);
        continue;
      }
      console.warn(`[AI Gen] ${config.provider} failed: ${msg}. Moving to next...`);
      continue;
    }
  }

  console.error("[AI Gen] All providers failed. Falling back to basic replace.", lastError);
  return fallbackReplace(context);
}

export async function classifyEmailReply(
  apiKeys: string[],
  emailBody: string,
  provider: string = "zai",
  model: string = "glm-4.7-flash"
): Promise<{ classification: string, suggestedResponse: string }> {
  const providersToUse = getAvailableProviders();

  if (providersToUse.length === 0) {
    console.warn("[AI Triage] No API keys configured. Falling back to UNKNOWN.");
    return { classification: "UNKNOWN", suggestedResponse: "" };
  }

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

  for (let i = 0; i < providersToUse.length; i++) {
    const config = providersToUse[i];
    try {
      if (config.provider === "groq" || config.provider === "zai") {
        const openai = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
        const response = await openai.chat.completions.create({
          model: config.model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response");
        
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
          else throw new Error("Failed to parse JSON response");
        }
        
        return { classification: parsed.classification, suggestedResponse: parsed.suggestedResponse || "" };
      } else if (config.provider === "gemini") {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        const response = await ai.models.generateContent({
          model: config.model,
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
