import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-uploaded-image.ts';
import '@/ai/flows/suggest-outfit-styles.ts';
import '@/ai/flows/recommend-items-and-explain-combinations.ts';
import '@/ai/flows/generate-ai-styled-outfit-image.ts';