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
  Feather,
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
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type SuggestionWithStatus = OutfitStyleSuggestion & {
  imageStatus: 'generating' | 'complete' | 'error';
};

type SuggestionsWithStatus = {
  outfitSuggestions: SuggestionWithStatus[];
};

const inspirationImages = [
  { src: "https://picsum.photos/800/1200", hint: "woman fashion" },
  { src: "https://picsum.photos/800/1200?random=2", hint: "man fashion" },
  { src: "https://picsum.photos/800/1200?random=3", hint: "street style" },
  { src: "https://picsum.photos/800/1200?random=4", hint: "elegant dress" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setSuggestions(null);
        setError(null);
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
        setSuggestions(null);
        setError(null);
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

  const scrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const renderUploader = () => (
     <div ref={uploaderRef} className="w-full max-w-2xl mx-auto text-center py-20">
      <h2 className="text-4xl font-bold tracking-tight mb-4">Upload Your Item</h2>
      <p className="text-muted-foreground mb-8 text-lg">
        Share a photo of a clothing item to get instant style advice.
      </p>
       <div className="border-2 border-dashed border-border rounded-xl p-12 cursor-pointer transition-all hover:border-primary hover:bg-white/5"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
       >
         <UploadCloud className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
         <p className="font-semibold text-lg text-foreground">Drag & drop or click to upload</p>
         <p className="text-sm text-muted-foreground mt-2">PNG, JPG, or WEBP. Max 5MB.</p>
         <input
           type="file"
           ref={fileInputRef}
           onChange={handleFileChange}
           className="hidden"
           accept="image/png, image/jpeg, image/webp"
         />
       </div>
     </div>
  );

  const renderInitialState = () => (
    <>
      <div className="text-center pt-24 pb-16">
        <h1 style={{fontFamily: "'Playfair Display', serif"}} className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
          Your Personal AI Stylist
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Unlock the potential of your wardrobe. Get curated outfit recommendations, AI-generated looks, and direct shopping links.
        </p>
        <Button onClick={scrollToUploader} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-7 px-10 rounded-full shadow-lg">
          <Sparkles className="mr-3 h-6 w-6" />
          Get Started
        </Button>
      </div>

      <div className="py-20">
        <h2 className="text-center text-4xl font-bold mb-12">Style Inspiration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {inspirationImages.map((image, index) => (
            <div key={index} className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-2xl">
              <Image 
                src={image.src} 
                alt={`Inspiration ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                data-ai-hint={image.hint}
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>
      {renderUploader()}
    </>
  );

  const renderPreviewAndSuggestions = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-16">
        {/* Left column for uploaded item */}
        <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full max-w-sm shadow-2xl overflow-hidden bg-secondary sticky top-8">
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
            <div className="mt-6 flex flex-col gap-4 w-full max-w-sm">
                 <Button onClick={handleGenerate} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            {suggestions ? "Regenerate Styles" : "Generate Styles"}
                        </>
                    )}
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg" className="w-full">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Start Over
                </Button>
            </div>
        </div>

        {/* Right column for suggestions */}
        <div className="lg:col-span-2">
            {loading ? renderLoadingState() : suggestions ? renderSuggestionsState() : renderSuggestionsPlaceholder()}
        </div>
    </div>
  );
  
  const renderSuggestionsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center bg-secondary/50 rounded-lg p-12 border-2 border-dashed">
      <Feather className="w-16 h-16 text-muted-foreground mb-6"/>
      <h2 className="text-3xl font-bold">Awaiting Your Masterpiece</h2>
      <p className="text-muted-foreground text-lg mt-2">Click "Generate Styles" and let our AI craft the perfect looks for you.</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="w-full flex flex-col items-center justify-center text-center p-12 rounded-lg bg-secondary/50">
      <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
      <h2 className="text-3xl font-bold mb-3">Curating your styles...</h2>
      <p className="text-muted-foreground text-lg">Our AI stylist is analyzing your item and creating unique outfits. This may take a moment.</p>
    </div>
  );

  const renderSuggestionsState = () => (
    <div className="w-full">
      <div className="text-left mb-10">
        <h1 className="text-5xl font-bold tracking-tighter">Your AI-Styled Outfits</h1>
        <p className="text-muted-foreground mt-3 text-xl max-w-2xl">Here are three unique looks, styled by AI and ready for you to explore.</p>
      </div>

      {suggestions && (
        <Tabs defaultValue={suggestions.outfitSuggestions[0]?.styleName} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-12 bg-secondary">
            {suggestions.outfitSuggestions.map((suggestion) => (
              <TabsTrigger key={suggestion.styleName} value={suggestion.styleName} className="text-base h-full py-2 sm:py-0 whitespace-normal sm:whitespace-nowrap data-[state=active]:bg-background">
                {suggestion.styleName}
              </TabsTrigger>
            ))}
          </TabsList>

          {suggestions.outfitSuggestions.map((suggestion) => (
            <TabsContent key={suggestion.styleName} value={suggestion.styleName} className="mt-8">
              <Card className="overflow-hidden shadow-2xl border-2 bg-secondary">
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
                       <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black/30">
                          <Camera className="w-12 h-12 text-destructive mb-4"/>
                          <p className="text-white bg-destructive px-3 py-1 rounded-md font-semibold">Image Generation Failed</p>
                          <p className="mt-3 text-muted-foreground text-sm">The AI couldn't create an image for this style, but you can still shop the look.</p>
                        </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col">
                    <h3 className="text-4xl font-bold tracking-tight mb-3" style={{fontFamily: "'Playfair Display', serif"}}>{suggestion.styleName}</h3>
                    <p className="text-muted-foreground text-lg mb-8">{suggestion.description}</p>
                    
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                        <AccordionItem value="item-1">
                        <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                            <Info className="h-6 w-6 text-primary" />
                            <span>Style Explanation</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pt-2 text-muted-foreground">
                            {suggestion.explanation}
                        </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                        <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                            <span>Shop The Look</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          {suggestion.recommendedItems && suggestion.recommendedItems.length > 0 ? (
                            <ul className="space-y-4 pt-2">
                            {suggestion.recommendedItems.map((item, index) => (
                                <li key={index} className="flex justify-between items-center gap-4 p-3 rounded-lg bg-background/50">
                                <div className="flex flex-col">
                                    <Badge variant="secondary" className="mr-2 mb-1 w-fit">{item.type}</Badge>
                                    <span className="font-medium text-base">{item.name}</span>
                                </div>
                                <Button asChild variant="outline" size="sm">
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
    <div className="bg-background text-foreground">
      <Header onGetStartedClick={scrollToUploader} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {previewUrl ? renderPreviewAndSuggestions() : renderInitialState()}
      </main>
      <Footer />
    </div>
  );
}
