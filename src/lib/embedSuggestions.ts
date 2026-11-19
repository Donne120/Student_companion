import type { EmbedPage } from "@/lib/embedPage";

/**
 * Example questions for the mini chat, matched to the page it was opened
 * from (embedPage.ts). The full app keeps its own general examples.
 */
export type Suggestion = { title: string; prompt: string };
export type PageSuggestions = { intro: string; suggestions: Suggestion[] };

const CAREER_HOST = "career.studentcompanionai.rw";

function careerSite(path: string): PageSuggestions {
  if (/opportunit|match/.test(path)) {
    return {
      intro: "Ask about the opportunities on SCA Opportunities: who can apply, deadlines and how to prepare.",
      suggestions: [
        { title: "Deadlines", prompt: "Which opportunities close this month?" },
        { title: "Fit", prompt: "Which of these opportunities fit my studies?" },
        { title: "Eligibility", prompt: "Am I eligible for the opportunities on this page?" },
        { title: "Applying", prompt: "What should I prepare before I apply?" },
      ],
    };
  }
  if (/course|learn/.test(path)) {
    return {
      intro: "Ask about the free courses on SCA Opportunities and which ones help you get ready.",
      suggestions: [
        { title: "Start", prompt: "Which free course should I start with?" },
        { title: "Applications", prompt: "Which courses help me prepare for applications?" },
        { title: "Time", prompt: "How long do these courses take?" },
        { title: "Next steps", prompt: "What opportunities can I apply to after a course?" },
      ],
    };
  }
  if (/cv/.test(path)) {
    return {
      intro: "Ask how to make your CV and applications stronger.",
      suggestions: [
        { title: "CV", prompt: "How can I make my CV stronger?" },
        { title: "Experience", prompt: "What should I put on my CV if I have little experience?" },
        { title: "Cover letter", prompt: "How do I write a good cover letter?" },
        { title: "Opportunities", prompt: "Which opportunities can I apply to right now?" },
      ],
    };
  }
  return {
    intro: "Ask about opportunities, deadlines and free courses on SCA Opportunities.",
    suggestions: [
      { title: "Right now", prompt: "Which opportunities can I apply to right now?" },
      { title: "Scholarships", prompt: "Which scholarships are open for African undergraduates?" },
      { title: "Internships", prompt: "Which internships are open this month?" },
      { title: "Get ready", prompt: "Which free courses can help me get ready?" },
    ],
  };
}

export function suggestionsForPage(page: EmbedPage | null): PageSuggestions | null {
  if (!page) return null;
  let host = "";
  let path = "";
  try {
    const url = new URL(page.url);
    host = url.hostname.toLowerCase();
    path = url.pathname.toLowerCase();
  } catch {
    return null;
  }
  if (host === CAREER_HOST) return careerSite(path);

  // Any other partner site: built from its context word, else the page.
  const topic = page.context.trim();
  if (topic) {
    return {
      intro: `Ask about ${topic}.`,
      suggestions: [
        { title: "Overview", prompt: `What should I know about ${topic}?` },
        { title: "Next steps", prompt: `What are the next steps for ${topic}?` },
        { title: "Dates", prompt: `Are there deadlines for ${topic} coming up?` },
        { title: "Contact", prompt: `Who can I contact about ${topic}?` },
      ],
    };
  }
  return {
    intro: "Ask about this page or anything at your university.",
    suggestions: [
      { title: "This page", prompt: "What can you tell me about this page?" },
      { title: "Next steps", prompt: "What should I do next here?" },
      { title: "Dates", prompt: "Are there deadlines coming up?" },
      { title: "Contact", prompt: "Who can I contact about this?" },
    ],
  };
}
