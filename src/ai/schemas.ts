import {z} from 'genkit';

export const SuggestOutfitStylesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestOutfitStylesInput = z.infer<
  typeof SuggestOutfitStylesInputSchema
>;

const RecommendedItemSchema = z.object({
  type: z
    .string()
    .describe(
      'The type of clothing item (e.g., top, bottom, footwear, accessory).'
    ),
  name: z.string().describe('The name or description of the recommended item.'),
  shoppingLink: z
    .string()
    .url()
    .describe(
      'A valid, clickable URL to a similar item on a fashion e-commerce site.'
    ),
});

export const OutfitStyleSuggestionSchema = z.object({
  styleName: z
    .string()
    .describe(
      'The name of the outfit style (e.g., Casual, Formal/Smart, Trendy/Party).'
    ),
  description: z
    .string()
    .describe('A short, user-friendly description of the outfit style.'),
  recommendedItems: z
    .array(RecommendedItemSchema)
    .describe(
      'A list of recommended clothing items, footwear and accessories for the outfit style.'
    ),
  explanation: z
    .string()
    .describe(
      'An explanation of why the outfit combination works, including color coordination, occasion fit, and fashion trends.'
    ),
  aiStyledImage: z
    .string()
    .optional()
    .describe(
      'A data URI for an AI-styled image showing the original item styled with the recommended pieces.'
    ),
});
export type OutfitStyleSuggestion = z.infer<typeof OutfitStyleSuggestionSchema>;

export const SuggestOutfitStylesOutputSchema = z.object({
  outfitSuggestions: z
    .array(OutfitStyleSuggestionSchema)
    .describe('An array of outfit style suggestions.'),
});
export type SuggestOutfitStylesOutput = z.infer<
  typeof SuggestOutfitStylesOutputSchema
>;

export const StyleGuidancePromptSchema = z.object({
  itemType: z.string(),
  color: z.string(),
  fabric: z.string(),
  style: z.string(),
  outfitSuggestions: z.array(
    OutfitStyleSuggestionSchema.pick({
      styleName: true,
      description: true,
      recommendedItems: true,
      explanation: true,
    })
  ),
});
