import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/client";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// System prompt for water safety assistant
const SYSTEM_PROMPT = `You are a helpful water safety assistant for the Georgia Drinking Water Data Explorer. Your role is to:

1. Help users understand water quality data and regulations
2. Explain public water system information from the SDWIS database
3. Provide guidance on water safety and quality standards
4. Answer questions about violations, compliance, and water system performance
5. Help users navigate and understand the data available on this website

IMPORTANT GUIDELINES:
- Only discuss topics related to water safety, quality, regulations, and public water systems
- If asked about non-water topics, politely redirect to water-related subjects
- Use data from the Supabase database when available to provide accurate information
- Be informative but conversational in tone
- If you don't have specific data, provide general guidance about water safety
- Always prioritize public health and safety in your responses

Available data includes:
- Water system violations and compliance data
- Water quality parameters and standards
- Public water system information
- Regulatory requirements and enforcement actions

Keep responses focused, helpful, and relevant to water safety and quality.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Get relevant water system data for context
    let waterSystemContext = "";
    try {
      // Get recent violations data
      const { data: violations } = await supabase
        .from("violations")
        .select("*")
        .limit(5);

      // Get water systems data
      const { data: waterSystems } = await supabase
        .from("water_systems")
        .select("*")
        .limit(5);

      if (violations && violations.length > 0) {
        waterSystemContext += `\nRecent violations data: ${JSON.stringify(violations.slice(0, 2))}`;
      }

      if (waterSystems && waterSystems.length > 0) {
        waterSystemContext += `\nWater systems data: ${JSON.stringify(waterSystems.slice(0, 2))}`;
      }
    } catch (error) {
      console.error("Error fetching Supabase data:", error);
      // Continue without context if there's an error
    }

    // Create the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the full prompt with context
    const fullPrompt = `${SYSTEM_PROMPT}

${waterSystemContext ? `Current database context: ${waterSystemContext}` : ""}

User message: ${message}

Please provide a helpful response focused on water safety and quality.`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
} 