"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Sparkles,
  ShoppingBag,
  Info,
  RotateCcw,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getOutfitSuggestions } from "./actions";
import type { SuggestOutfitStylesOutput, OutfitStyleSuggestion } from "@/ai/schemas";

type SuggestionWithStatus = OutfitStyleSuggestion & {
  imageStatus: 'generating' | 'complete' | 'error';
};

type SuggestionsWithStatus = {
  outfitSuggestions: SuggestionWithStatus[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleGenerate = async () => {
    if (!file || !previewUrl) return;

    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await getOutfitSuggestions(previewUrl);
      if (result && result.outfitSuggestions) {
        setSuggestions({
          outfitSuggestions: result.outfitSuggestions.map(s => ({...s, imageStatus: s.aiStyledImage ? 'complete' : 'error' }))
        });
      } else {
        throw new Error("The AI returned an empty response. Please try another image.");
      }
    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Generating Styles",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setSuggestions(null);
    setLoading(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderInitialState = () => (
    <Card
      className="w-full max-w-lg mx-auto shadow-2xl bg-card/80 backdrop-blur-sm border-2 border-dashed"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader>
        <div className="flex justify-center items-center mb-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg">
            <Sparkles className="w-10 h-10" />
          </div>
        </div>
        <CardTitle className="text-center text-4xl font-bold tracking-tight">
          StyleAI Stylist
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-8 text-lg">
          Upload a photo of a clothing item. Get instant style advice.
        </p>
        <div className="border-2 border-dashed border-border rounded-xl p-12 cursor-pointer transition-all hover:border-accent hover:bg-accent/10"
             onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="font-semibold text-lg">Drag & drop or click to upload</p>
          <p className="text-sm text-muted-foreground mt-2">PNG, JPG, or WEBP. Max 5MB.</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderPreviewState = () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
      <Card className="w-full max-w-sm shadow-2xl overflow-hidden bg-card/90">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Your Item</CardTitle>
        </CardHeader>
        <CardContent>
          {previewUrl && (
            <div className="aspect-square relative rounded-lg overflow-hidden ring-1 ring-border shadow-lg">
              <Image
                src={previewUrl}
                alt="Uploaded item"
                fill
                className="object-cover"
                data-ai-hint="uploaded clothing"
              />
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="mr-2 h-5 w-5" />
          Change Image
        </Button>
        <Button onClick={handleGenerate} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Styles
        </Button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
      <Loader2 className="w-16 h-16 animate-spin text-accent mb-6" />
      <h2 className="text-3xl font-bold mb-3">Curating your styles...</h2>
      <p className="text-muted-foreground text-lg">Our AI stylist is analyzing your item and creating unique outfits. This may take a moment.</p>
    </div>
  );

  const renderSuggestionsState = () => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tighter">Your AI-Styled Outfits</h1>
        <p className="text-muted-foreground mt-3 text-xl max-w-2xl mx-auto">Here are three unique looks, styled by AI and ready for you to explore.</p>
      </div>

      {suggestions && (
        <Tabs defaultValue={suggestions.outfitSuggestions[0]?.styleName} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto h-auto sm:h-12">
            {suggestions.outfitSuggestions.map((suggestion) => (
              <TabsTrigger key={suggestion.styleName} value={suggestion.styleName} className="text-base h-full py-2 sm:py-0 whitespace-normal sm:whitespace-nowrap">
                {suggestion.styleName}
              </TabsTrigger>
            ))}
          </TabsList>

          {suggestions.outfitSuggestions.map((suggestion) => (
            <TabsContent key={suggestion.styleName} value={suggestion.styleName} className="mt-8">
              <Card className="overflow-hidden shadow-2xl border-2">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-w-1 aspect-h-1 relative bg-muted/50">
                    {suggestion.imageStatus === 'complete' && suggestion.aiStyledImage ? (
                      <Image
                        src={suggestion.aiStyledImage}
                        alt={`${suggestion.styleName} outfit`}
                        fill
                        className="object-cover"
                        data-ai-hint={`${suggestion.styleName} outfit`}
                      />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/30">
                          <Camera className="w-12 h-12 text-destructive mb-4"/>
                          <p className="text-destructive-foreground bg-destructive px-3 py-1 rounded-md font-semibold">Image Generation Failed</p>
                          <p className="mt-3 text-muted-foreground text-sm">The AI couldn't create an image for this style, but you can still shop the look.</p>
                        </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col bg-card">
                    <h3 className="text-4xl font-bold tracking-tight mb-3">{suggestion.styleName}</h3>
                    <p className="text-muted-foreground text-lg mb-8">{suggestion.description}</p>
                    
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                        <AccordionItem value="item-1">
                        <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                            <Info className="h-6 w-6 text-accent" />
                            <span>Style Explanation</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pt-2">
                            {suggestion.explanation}
                        </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                        <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                            <ShoppingBag className="h-6 w-6 text-accent" />
                            <span>Shop The Look</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          {suggestion.recommendedItems && suggestion.recommendedItems.length > 0 ? (
                            <ul className="space-y-4 pt-2">
                            {suggestion.recommendedItems.map((item, index) => (
                                <li key={index} className="flex justify-between items-center gap-4 p-3 rounded-lg bg-secondary/50">
                                <div className="flex flex-col">
                                    <Badge variant="secondary" className="mr-2 mb-1 w-fit">{item.type}</Badge>
                                    <span className="font-medium text-base">{item.name}</span>
                                </div>
                                <Button asChild variant="outline" size="sm" className="bg-background">
                                    <a href={item.shoppingLink} target="_blank" rel="noopener noreferrer">
                                    Shop Now
                                    </a>
                                </Button>
                                </li>
                            ))}
                            </ul>
                           ) : (
                              <p className="text-muted-foreground italic">No specific items were recommended for this look.</p>
                           )}
                        </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <div className="mt-auto pt-8 flex justify-end">
                      <Button onClick={handleReset} variant="default" size="lg">
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Start Over
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-gradient-to-br from-background via-secondary/50 to-background dark:from-background dark:via-secondary/10 dark:to-background">
      <div className="w-full max-w-7xl">
        {loading ? (
          renderLoadingState()
        ) : suggestions ? (
          renderSuggestionsState()
        ) : previewUrl ? (
          renderPreviewState()
        ) : (
          renderInitialState()
        )}
      </div>
    </main>
  );
}
