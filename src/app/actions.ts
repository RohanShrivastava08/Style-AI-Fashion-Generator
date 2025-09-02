"use server";

import { suggestOutfitStyles } from "@/ai/flows/suggest-outfit-styles";
import { type SuggestOutfitStylesOutput } from "@/ai/schemas";

export async function getOutfitSuggestions(
  photoDataUri: string
): Promise<SuggestOutfitStylesOutput | null> {
  try {
    // Increase the timeout for this server action
    const result = await suggestOutfitStyles({ photoDataUri });
    return result;
  } catch (error) {
    console.error("Error getting outfit suggestions:", error);
    // Propagate a more user-friendly error
    throw new Error("Failed to generate outfit suggestions. The AI model might be unavailable or the image could not be processed. Please try again later.");
  }
}
