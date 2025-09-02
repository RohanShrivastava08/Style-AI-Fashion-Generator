'use server';
/**
 * @fileOverview Recommends specific items for each outfit style and explains the styling choices.
 *
 * - recommendItemsAndExplainCombinations - A function that handles the outfit recommendations and explanations.
 * - RecommendItemsAndExplainCombinationsInput - The input type for the recommendItemsAndExplainCombinations function.
 * - RecommendItemsAndExplainCombinationsOutput - The return type for the recommendItemsAndExplainCombinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendItemsAndExplainCombinationsInputSchema = z.object({
  itemType: z.string().describe('The type of clothing item (e.g., shirt, dress, pants).'),
  itemColor: z.string().describe('The color of the clothing item.'),
  itemFabric: z.string().describe('The fabric of the clothing item.'),
  itemStyle: z.string().describe('The style of the clothing item.'),
});
export type RecommendItemsAndExplainCombinationsInput = z.infer<typeof RecommendItemsAndExplainCombinationsInputSchema>;

const OutfitRecommendationSchema = z.object({
  styleName: z.string().describe('The name of the outfit style (e.g., Casual, Formal/Smart, Trendy/Party).'),
  recommendedItems: z.array(z.string()).describe('An array of recommended items for the outfit style (e.g., top, bottom, footwear, accessories).'),
  explanation: z.string().describe('An explanation of why the combination works, including color coordination, occasion fit, and fashion trends.'),
  description: z.string().describe('A short, user-friendly description of the outfit style.'),
  shoppingLinks: z.array(z.string()).describe('An array of valid, clickable shopping links to similar items on reputable fashion e-commerce sites.'),
});

const RecommendItemsAndExplainCombinationsOutputSchema = z.array(OutfitRecommendationSchema);
export type RecommendItemsAndExplainCombinationsOutput = z.infer<typeof RecommendItemsAndExplainCombinationsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'recommendItemsAndExplainCombinationsPrompt',
  input: {schema: RecommendItemsAndExplainCombinationsInputSchema},
  output: {schema: RecommendItemsAndExplainCombinationsOutputSchema},
  prompt: `You are an AI fashion stylist. Given a clothing item with the following characteristics:

Item Type: {{{itemType}}}
Item Color: {{{itemColor}}}
Item Fabric: {{{itemFabric}}}
Item Style: {{{itemStyle}}}

Suggest three distinct outfit styles (Casual, Formal/Smart, Trendy/Party). For each outfit style, provide:

- A list of recommended items (tops, bottoms, footwear, accessories).
- An explanation of why the combination works, focusing on color coordination, occasion appropriateness, and current fashion trends.
- A short, user-friendly description of the outfit style.
- Valid, clickable shopping links for similar items on reputable fashion e-commerce sites (e.g., Amazon Fashion, Myntra, Zara, H&M).

Ensure all suggestions are practical, stylish, and modern. Structure the output as a JSON array of outfit recommendations.

[
  {
    "styleName": "Casual",
    "recommendedItems": ["T-shirt", "Jeans", "Sneakers", "Baseball cap"],
    "explanation": "This combination is comfortable and suitable for everyday activities. The colors complement each other, and the style is relaxed and informal.",
    "description": "A laid-back and easy-to-wear outfit for casual occasions.",
    "shoppingLinks": ["https://www.amazon.com/T-shirt/dp/example1", "https://www.myntra.com/jeans/dp/example2"]
  },
  {
    "styleName": "Formal/Smart",
    "recommendedItems": ["Button-down shirt", "Dress pants", "Loafers", "Watch"],
    "explanation": "This combination is suitable for business or formal occasions. The colors are coordinated, and the style is professional and elegant.",
    "description": "A sophisticated and polished outfit for formal events.",
    "shoppingLinks": ["https://www.zara.com/shirt/dp/example3", "https://www.hm.com/pants/dp/example4"]
  },
  {
    "styleName": "Trendy/Party",
    "recommendedItems": ["Crop top", "Skirt", "Heels", "Clutch"],
    "explanation": "This combination is fashionable and eye-catching, suitable for parties or trendy events. The colors and styles are bold and modern.",
    "description": "A stylish and attention-grabbing outfit for parties and social gatherings.",
    "shoppingLinks": ["https://www.amazon.com/top/dp/example5", "https://www.myntra.com/skirt/dp/example6"]
  }
]
`,
});

const recommendItemsAndExplainCombinationsFlow = ai.defineFlow(
  {
    name: 'recommendItemsAndExplainCombinationsFlow',
    inputSchema: RecommendItemsAndExplainCombinationsInputSchema,
    outputSchema: RecommendItemsAndExplainCombinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function recommendItemsAndExplainCombinations(
  input: RecommendItemsAndExplainCombinationsInput
): Promise<RecommendItemsAndExplainCombinationsOutput> {
  return recommendItemsAndExplainCombinationsFlow(input);
}
