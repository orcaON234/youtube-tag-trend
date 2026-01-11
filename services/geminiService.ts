
import { GoogleGenAI, Type } from "@google/genai";
import { TrendResponse, LogicMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchTrendData = async (tags: string[], startYear: number, endYear: number, logicMode: LogicMode = 'NONE'): Promise<TrendResponse> => {
  let promptDescription = "";
  
  switch(logicMode) {
    case 'AND':
      promptDescription = `monthly count for videos that have BOTH tags [${tags.join(' AND ')}] simultaneously`;
      break;
    case 'OR':
      promptDescription = `monthly count for videos that have EITHER tags [${tags.join(' OR ')}] (the union of these topics)`;
      break;
    case 'NOT':
      promptDescription = `monthly count for videos that do NOT have any of these tags: [${tags.join(', ')}] (representing general trends excluding these specific niches)`;
      break;
    default:
      promptDescription = `separate monthly counts for each of these tags: [${tags.join(', ')}] so they can be compared`;
  }

  const prompt = `Generate realistic (simulated) monthly YouTube video count data from ${startYear} to ${endYear} for: ${promptDescription}. 
  
  Provide the output in a JSON format that includes:
  An array called 'series', where each element contains:
  1. 'tag': the name of the tag (if logic is AND/OR/NOT, use a name like "Merged: ${tags.join(' & ')}").
  2. 'data': an array of objects with 'date' (YYYY-MM) and 'count' (estimated integer video count for that month).
  3. 'peakDate': (string YYYY-MM).
  4. 'growthPercentage': (string like "+45%").
  5. 'totalCount': (estimated total number of videos for this query in this period as an integer).
  
  Make sure all data feels authentic to YouTube's scale. If multiple tags are requested for separate comparison (NONE mode), return an entry for each.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          series: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tag: { type: Type.STRING },
                peakDate: { type: Type.STRING },
                growthPercentage: { type: Type.STRING },
                totalCount: { type: Type.NUMBER },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      date: { type: Type.STRING },
                      count: { type: Type.NUMBER }
                    },
                    required: ["date", "count"]
                  }
                }
              },
              required: ["tag", "data", "peakDate", "growthPercentage", "totalCount"]
            }
          }
        },
        required: ["series"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Invalid data received from AI service");
  }
};
