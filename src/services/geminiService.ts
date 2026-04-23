import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `Act as a Technical Director at a major educational publisher. Your goal is to design and write the complete content for a massive 'Zero to Hero' learning program (target length: 500+ equivalent pages) focused on the provided topic.

The tone should be authoritative, clear, and deeply technical yet accessible to a beginner.

Follow these structural and stylistic guidelines:

1. Architectural Structure:
   * The Path: Break the topic into 'Stages' (Beginner, Intermediate, Advanced).
   * Module Layout: You MUST design at least 10 comprehensive Modules. Each module must cover core concepts in-depth.
   * Each section must include a 'Big Picture' overview, followed by deep dives, and ending with a 'Knowledge Check.'

2. Content Components:
   * Language: All code examples MUST be written in SWIFT. Use production-ready Swift code with comments.
   * Explanations: Use the 'First Principles' approach. Explain the why before the how.
   * Visual Descriptions: Use PLantUML for all architectural diagrams. Wrap the PlantUML code in '$$PLANTUML: [PlantUML Code] $$'.
   * Imagery: Describe high-quality images that should accompany the text using '$$IMAGE: [description] $$'.

3. Design & Theme Instructions:
   * Maintain a consistent 'Geometric Balance' style. Use clear Heading levels (H1, H2, H3).

4. Portability:
   * Use page-break markers like ---PAGE BREAK---.

When a topic is given:
1. First, generate a Comprehensive Table of Contents with AT LEAST 10 Modules spanning the 3 Stages.
2. Then, provide the full content for Module 1.`;

export async function generateCourseStructure(topic: string, language: string) {
  const isNoneLanguage = language.includes("NONE");
  const codeRequirement = isNoneLanguage 
    ? '- "Deep Theory Mastery": Absolute first-principles mathematical or logic-based foundation without code implementation.\n   - "Architectural UML": Use clear PlantUML code for conceptual flows and system structures.'
    : `- All code MUST be in [STACK/ENVIRONMENT]: ${language}.\n3. Every module MUST include:\n   - "Big Picture Theory": The absolute first-principles mathematical or logic-based foundation.\n   - "Deep Dive Mechanics": Extreme technical detail including stack-specific best practices.\n   - "Architectural UML": Use clear PlantUML code wrapped in '$$PLANTUML: [Code] $$'.\n   - "Production-Spec Code": Robust, typed code examples matching the ${language} ecosystem (e.g., TS for React/Node/Nest, Python for FastAPI, SQL for PostgreSQL/MySQL, C# for .NET, Java for Spring Boot, Swift/Kotlin for Native Mobile).`;

  const MIT_INSTRUCTION = `Act as a Distinguished Professor of Computer Science at MIT and a Chief System Architect. Your goal is to design a rigorous, 50-chapter 'Masterpiece' curriculum for [TOPIC]: ${topic}.

Target Audience: High-capacity engineers looking to become Lead Architects.
Curriculum Depth: Graduate-level (MIT 6.824 level or higher).

Structural Constraints:
1. DESIGN exactly 50 Modules across 5 Progressive Tiers (Foundations, Architecture, Implementation, Scaling, Future-Proofing).
2. ${codeRequirement}

Formatting: Use 'Geometric Balance' design patterns. Page-breaks as ---PAGE BREAK---.

Initial Task: Generate a Complete Table of Contents (all 50 modules) and then write the complete, exhaustive content for Module 1.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Topic: ${topic}\nPrimary Language: ${language}\n\nPlease architect the 50-chapter curriculum and Module 1.`,
    config: {
      systemInstruction: MIT_INSTRUCTION,
      temperature: 0.4, // Lower temperature for more rigorous academic tone
    },
  });

  return response.text;
}

export async function generateModule(topic: string, language: string, moduleTitle: string, previousContext: string) {
  const isNoneLanguage = language.includes("NONE");
  const taskDescription = isNoneLanguage
    ? `Task: Write the exhaustive, MIT-level content for Chapter: ${moduleTitle}. Focus on extreme theoretical depth, system design, and architectural patterns. Use PlantUML for diagrams. DO NOT include programming code blocks.`
    : `Task: Write the exhaustive, MIT-level content for Chapter: ${moduleTitle}. Ensure use of PlantUML for diagrams and appropriate code for the ${language} stack (e.g., TS for Node JS, Python for Django) for all implementation segments.`;

  const MIT_INSTRUCTION = `Act as an MIT Professor. Continue the 50-chapter curriculum for ${topic} in ${language}. 
Context of previous chapters: [Truncated content provided].
${taskDescription}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
        { text: `Topic: ${topic}\nLanguage: ${language}\nContext: ${previousContext}` },
        { text: `Generate MIT-level content for: ${moduleTitle}` }
    ],
    config: {
      systemInstruction: MIT_INSTRUCTION,
      temperature: 0.4,
    },
  });

  return response.text;
}
