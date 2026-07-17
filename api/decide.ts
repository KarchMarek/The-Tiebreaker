import { cleanJsonOutput, generateContentWithFallback, getAiClient } from "./gemini.js";

export const config = {
  runtime: "nodejs",
};

function parseBody(req: any) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

function sendJson(res: any, statusCode: number, payload: any) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function buildPrompt(title: string, framework: string, options: string[], context: string, criteria: string[]) {
  if (framework === "pros_cons") {
    return `
You are "The Tiebreaker", an elite AI decision-making expert.
Analyze the following decision dilemma:
Decision Title: "${title}"
Selected Framework: Pros & Cons List
${options.length ? `Options to consider: ${options.join(', ')}` : 'Analyze the dilemma by comparing doing it versus not doing it, or suggest appropriate default choices.'}
${context ? `Additional user context & considerations: ${context}` : ''}

Instructions:
1. Provide a friendly, comprehensive overview of the dilemma.
2. Formulate 3-5 highly objective pros and cons for each option.
3. For each pro/con, assess its importance ("high", "medium", or "low") and write a brief "explanation" (1-2 sentences).
4. For each option, calculate an overall balance score between 0 and 100. A score of 50 is neutral, high scores (e.g., 75-90) mean pros heavily outweigh cons, and low scores (e.g., 10-35) mean cons dominate.
5. Provide a decisive "tiebreaker verdict" recommendation that resolves the deadlock and offers action-oriented guidance.

You must return a valid JSON object matching this exact TS interface structure:
{
  "summary": string,
  "recommendation": string,
  "options": [
    {
      "optionName": string,
      "pros": [
        { "point": string, "impact": "high" | "medium" | "low", "explanation": string }
      ],
      "cons": [
        { "point": string, "impact": "high" | "medium" | "low", "explanation": string }
      ],
      "score": number
    }
  ]
}
Ensure the output is robust, descriptive, and directly addresses the user's dilemma. No other chat text or wrappers.
`;
  }

  if (framework === "comparison") {
    return `
You are "The Tiebreaker", an elite AI decision-making expert.
Analyze the following decision dilemma:
Decision Title: "${title}"
Selected Framework: Comparison Matrix Table
Options to compare: ${options.length ? options.join(', ') : 'Suggest at least 2 highly relevant options to compare.'}
${criteria.length ? `Specific evaluation criteria: ${criteria.join(', ')}` : 'Determine 3-5 standard, highly relevant comparison criteria tailored to this specific scenario.'}
${context ? `Additional user context & considerations: ${context}` : ''}

Instructions:
1. Provide a comprehensive, objective overview of the choices.
2. Determine the comparison criteria if not specified (e.g., "Cost", "Time Investment", "Growth Potential", "Risk Level", "Emotional Happiness", etc.).
3. For every option, grade it on every criterion. Each grade must have:
   - score: an integer rating from 1 to 5 (1 = poor/very low, 5 = excellent/very high).
   - text: a concise explanation (1 sentence) for this score.
4. Calculate an overall average score (1.0 to 5.0) for each option.
5. Provide a short specific verdict string for each option summarizing its character.
6. Formulate a decisive, insightful recommendation guiding the user based on different potential priorities.

You must return a valid JSON object matching this exact TS interface structure:
{
  "summary": string,
  "recommendation": string,
  "criteria": string[],
  "options": [
    {
      "name": string,
      "ratings": {
        "[CriterionName]": { "score": number, "text": string }
      },
      "overallScore": number,
      "verdict": string
    }
  ]
}
(Make sure the keys in "ratings" match exactly the criteria listed in "criteria"). No other chat text or wrappers.
`;
  }

  if (framework === "swot") {
    return `
You are "The Tiebreaker", an elite AI decision-making expert.
Analyze the following decision dilemma:
Decision Title: "${title}"
Selected Framework: SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
${options.length ? `Subject of SWOT analysis: ${options[0]}` : 'Analyze the primary path or decision as the core subject of the SWOT.'}
${context ? `Additional user context & considerations: ${context}` : ''}

Instructions:
1. Provide a strategic overview of the situation.
2. Generate 3-5 comprehensive, realistic items for each of the four SWOT quadrants:
   - strengths: Internal factors, resources, or capabilities that favor this option.
   - weaknesses: Internal challenges, lack of resources, or constraints that hinder it.
   - opportunities: External trends, environmental factors, or shifts that can be leveraged.
   - threats: External risks, negative trends, or challenges that might pose a threat.
3. For each SWOT item, provide a "title" (short 2-5 words title) and a "description" (1-2 sentences of detail).
4. Provide a highly strategic, actionable recommendation explaining how the user can leverage strengths to exploit opportunities, while mitigating weaknesses and countering threats.

You must return a valid JSON object matching this exact TS interface structure:
{
  "summary": string,
  "recommendation": string,
  "strengths": [{ "title": string, "description": string }],
  "weaknesses": [{ "title": string, "description": string }],
  "opportunities": [{ "title": string, "description": string }],
  "threats": [{ "title": string, "description": string }]
}
Do not include any other text or wrappers except the raw JSON.
`;
  }

  return "";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body = parseBody(req);
    const { title, framework, options = [], context = "", criteria = [] } = body;

    if (!title || !title.trim()) {
      sendJson(res, 400, { error: "Decision title is required." });
      return;
    }

    if (!framework) {
      sendJson(res, 400, { error: "Framework type is required." });
      return;
    }

    const ai = getAiClient();
    const prompt = buildPrompt(title, framework, options, context, criteria);

    if (!prompt) {
      sendJson(res, 400, { error: "Invalid framework type." });
      return;
    }

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response received from the Gemini model.");
    }

    const cleanedText = cleanJsonOutput(rawText);
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (parseErr: any) {
      console.error("JSON parsing failed. Raw response:", rawText);
      sendJson(res, 500, {
        error: "Failed to parse decision model response.",
        details: parseErr.message,
        rawText: rawText
      });
      return;
    }

    const responsePayload = {
      id: Math.random().toString(36).substring(2, 11),
      input: { title, framework, options, context, criteria },
      timestamp: new Date().toISOString(),
      framework,
      prosCons: framework === "pros_cons" ? parsedResult : undefined,
      comparison: framework === "comparison" ? parsedResult : undefined,
      swot: framework === "swot" ? parsedResult : undefined,
    };

    sendJson(res, 200, responsePayload);
  } catch (err: any) {
    console.error("API error in /api/decide:", err);
    sendJson(res, 500, {
      error: "An error occurred while generating your decision helper details.",
      message: err.message
    });
  }
}
