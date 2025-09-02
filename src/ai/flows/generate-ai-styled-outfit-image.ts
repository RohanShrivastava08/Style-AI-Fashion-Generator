'use server';
/**
 * @fileOverview Generates an AI-styled outfit image showcasing the original clothing item paired with recommended pieces.
 *
 * - generateAIStyledOutfitImage - A function that generates an AI-styled outfit image.
 * - GenerateAIStyledOutfitImageInput - The input type for the generateAIStyledOutfitImage function.
 * - GenerateAIStyledOutfitImageOutput - The return type for the generateAIStyledOutfitImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIStyledOutfitImageInputSchema = z.object({
  clothingItemDataUri: z
    .string()
    .describe(
      "A photo of the clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tops: z.string().describe('Recommended tops for the outfit.'),
  bottoms: z.string().describe('Recommended bottoms for the outfit.'),
  footwear: z.string().describe('Recommended footwear for the outfit.'),
  accessories: z.string().describe('Recommended accessories for the outfit.'),
  styleDescription: z.string().describe('Description of the overall outfit style, specifying if it\'s for a man or woman and providing a realistic context.'),
});
export type GenerateAIStyledOutfitImageInput = z.infer<typeof GenerateAIStyledOutfitImageInputSchema>;

const GenerateAIStyledOutfitImageOutputSchema = z.object({
  aiStyledOutfitImageDataUri: z
    .string()
    .describe(
      'The generated AI-styled outfit image as a data URI with MIME type and Base64 encoding.'
    ),
});
export type GenerateAIStyledOutfitImageOutput = z.infer<typeof GenerateAIStyledOutfitImageOutputSchema>;

const generateAIStyledOutfitImageFlow = ai.defineFlow(
  {
    name: 'generateAIStyledOutfitImageFlow',
    inputSchema: GenerateAIStyledOutfitImageInputSchema,
    outputSchema: GenerateAIStyledOutfitImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      prompt: [
        {
          text: `Generate a high-quality, realistic, full-body photograph of a person wearing a complete, stylish outfit.

          **Style Description**: ${input.styleDescription}

          **The outfit must include**:
          - **Tops**: ${input.tops}
          - **Bottoms**: ${input.bottoms}
          - **Footwear**: ${input.footwear}
          - **Accessories**: ${input.accessories}

          **The image should feature the provided clothing item naturally integrated into the look.**
          `,
        },
        {
          media: {url: input.clothingItemDataUri},
        },
      ],
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a valid image.');
    }

    return {aiStyledOutfitImageDataUri: media.url};
  }
);

export async function generateAIStyledOutfitImage(
  input: GenerateAIStyledOutfitImageInput
): Promise<GenerateAIStyledOutfitImageOutput> {
  return generateAIStyledOutfitImageFlow(input);
}
