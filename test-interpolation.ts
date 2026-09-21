import { interpolateVariables, GenerationContext } from './src/lib/ai/index';

const mockContext: GenerationContext = {
  investorName: "John Doe",
  investorFirm: "Sequoia",
  investorThesis: "B2B SaaS",
  investorStagePreference: "Seed",
  investorNotes: "",
  portfolioCompanies: "Stripe, Notion",
  companyName: "NexaWorks",
  oneLinePitch: "Provide an AI-powered CRM that helps sales teams close 3x more deals.",
  senderName: "Sahil Ghewari",
  baseSubjectTemplate: "Introduction: {{companyName}}",
  baseBodyTemplate: "Hi {{firstName}},\n\nI saw your recent investment in {{recentInvestment}} and thought you might be interested in what we're building at {{companyName}}.\n\n{{oneLinePitch}}\n\nWould you be open to a brief chat next week?\n\nBest,\n{{senderName}}"
};

const resultSubject = interpolateVariables(mockContext.baseSubjectTemplate, mockContext);
const resultBody = interpolateVariables(mockContext.baseBodyTemplate, mockContext);

console.log("SUBJECT:");
console.log(resultSubject);
console.log("\nBODY:");
console.log(resultBody);
