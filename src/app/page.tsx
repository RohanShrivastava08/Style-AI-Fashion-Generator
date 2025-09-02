"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  Sparkles,
  ShoppingBag,
  Info,
  Palette,
  Shirt,
  Wind,
  Shuffle,
  RotateCcw,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getOutfitSuggestions } from "./actions";
import type { SuggestOutfitStylesOutput } from "@/ai/flows/suggest-outfit-styles";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestOutfitStylesOutput | null>(null);
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
      if (result) {
        setSuggestions(result);
      } else {
        throw new Error("The AI returned an empty response. Please try another image.");
      }
    } catch (e: any) {
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
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
      className="w-full max-w-lg mx-auto shadow-lg"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader>
        <div className="flex justify-center items-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-center text-3xl font-headline">
          StyleAI Fashion Stylist
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">
          Upload a photo of a clothing item and get instant style advice.
        </p>
        <div className="border-2 border-dashed border-border rounded-lg p-12 cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/20"
             onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="font-semibold">Drag & drop an image or click to upload</p>
          <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or WEBP</p>
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
      <Card className="w-full max-w-sm shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center">Your Item</CardTitle>
        </CardHeader>
        <CardContent>
          {previewUrl && (
            <div className="aspect-square relative rounded-lg overflow-hidden">
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
      <div className="flex gap-4">
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Change Image
        </Button>
        <Button onClick={handleGenerate} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Styles
        </Button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg sticky top-8">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mx-auto" />
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <Skeleton className="h-10 w-1/2 mt-6" />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="w-full aspect-video rounded-lg mb-6" />
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/6 mb-2" />
        </CardContent>
      </Card>
    </div>
  );

  const renderSuggestionsState = () => (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg sticky top-8">
        <CardHeader>
          <CardTitle className="text-center font-headline">Your Item</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {previewUrl && (
            <div className="aspect-square relative w-full rounded-lg overflow-hidden mb-6">
              <Image
                src={previewUrl}
                alt="Uploaded item"
                fill
                className="object-cover"
                data-ai-hint="uploaded clothing"
              />
            </div>
          )}
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center font-headline">AI Outfit Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions && (
            <Tabs defaultValue={suggestions.outfitSuggestions[0]?.styleName} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {suggestions.outfitSuggestions.map((suggestion) => (
                  <TabsTrigger key={suggestion.styleName} value={suggestion.styleName}>
                    {suggestion.styleName}
                  </TabsTrigger>
                ))}
              </TabsList>
              {suggestions.outfitSuggestions.map((suggestion) => (
                <TabsContent key={suggestion.styleName} value={suggestion.styleName}>
                  <div className="mt-4">
                    <Card className="overflow-hidden">
                      <div className="aspect-video relative">
                        <Image
                          src={suggestion.aiStyledImage}
                          alt={`${suggestion.styleName} outfit`}
                          fill
                          className="object-cover"
                          data-ai-hint={`${suggestion.styleName} outfit`}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-semibold mb-2 font-headline">{suggestion.styleName}</h3>
                        <p className="text-muted-foreground mb-6">{suggestion.description}</p>
                        
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                           <AccordionItem value="item-1">
                            <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                <span className="font-semibold">Style Explanation</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {suggestion.explanation}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                            <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                <span className="font-semibold">Recommended Items</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-3">
                                {suggestion.recommendedItems.map((item, index) => (
                                  <li key={index} className="flex justify-between items-center">
                                    <span>
                                      <Badge variant="secondary" className="mr-2">{item.type}</Badge>
                                      {item.name}
                                    </span>
                                    <Button asChild variant="link" size="sm" className="p-0 h-auto">
                                      <a href={item.shoppingLink} target="_blank" rel="noopener noreferrer">
                                        Shop Now
                                      </a>
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
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
