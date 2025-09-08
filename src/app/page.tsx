"use client";

import { useState, useRef, useEffect } from "react";
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
  Palette,
  Bot,
  PictureInPicture
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getOutfitSuggestions } from "./actions";
import type { SuggestOutfitStylesOutput, OutfitStyleSuggestion } from "@/ai/schemas";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

type SuggestionWithStatus = OutfitStyleSuggestion & {
  imageStatus: 'generating' | 'complete' | 'error';
};

type SuggestionsWithStatus = {
  outfitSuggestions: SuggestionWithStatus[];
};

type Gender = 'woman' | 'man';

const inspirationImages = [
  { src: "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNsb3RoZXN8ZW58MHx8MHx8fDA%3D", hint: "clothing store" },
  { src: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdGhlc3xlbnwwfHwwfHx8MA%3D%3D", hint: "denim jacket" },
  { src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xvdGhlc3xlbnwwfHwwfHx8MA%3D%3D", hint: "clothes rack" },
  { src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNsb3RoZXN8ZW58MHx8MHx8fDA%3D", hint: "flat lay" },
  { src: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNsb3RoZXN8ZW58MHx8MHx8fDA%3D", hint: "fashion model" },
  { src: "https://plus.unsplash.com/premium_photo-1664202526475-8f43ee70166d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNsb3RoZXN8ZW58MHx8MHx8fDA%3D", hint: "street style" },
];

const howItWorksSteps = [
    {
        icon: Camera,
        title: "1. Upload Your Item",
        description: "Snap a photo or upload an image of any clothing item you want to style. The clearer the image, the better the results."
    },
    {
        icon: Palette,
        title: "2. Get Style Suggestions",
        description: "Our AI analyzes your item's color, type, and style to generate three unique, complete outfits: Casual, Formal, and Trendy."
    },
    {
        icon: PictureInPicture,
        title: "3. Visualize the Look",
        description: "See your item come to life! We generate an AI-styled image for each outfit, showing you how the pieces look together."
    },
    {
        icon: ShoppingBag,
        title: "4. Shop with a Click",
        description: "Love what you see? Each recommended item comes with a direct shopping link, so you can easily recreate the look."
    }
]

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('woman');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

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
      const result = await getOutfitSuggestions({ photoDataUri: previewUrl, gender });
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
     <div ref={uploaderRef} className="w-full max-w-3xl mx-auto text-center py-24">
      <h2 className="font-playfair text-4xl lg:text-5xl font-bold tracking-tight mb-4">Upload Your Item</h2>
      <p className="text-muted-foreground mb-10 text-lg">
        Share a photo of a clothing item to get instant style advice.
      </p>
       <div className="border-2 border-dashed border-border rounded-xl p-12 transition-all hover:border-primary/80 hover:bg-secondary/50
            group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
       >
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                 <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
                 <p className="font-semibold text-lg text-foreground">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">Click to upload</button> or drag & drop
                 </p>
                 <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or WEBP. Max 5MB.</p>
            </div>
        </div>
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
      <div className="text-center pt-28 pb-20">
        <h1 className="font-playfair text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          Your Personal AI Stylist
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
          Unlock the potential of your wardrobe. Get curated outfit recommendations, AI-generated looks, and direct shopping links.
        </p>
        <Button onClick={scrollToUploader} size="lg" className="text-lg py-7 px-10 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <Sparkles className="mr-3 h-6 w-6" />
          Get Started
        </Button>
      </div>

      <div className="py-24">
        <h2 className="text-center font-playfair text-4xl lg:text-5xl font-bold mb-16">Style Inspiration</h2>
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
            >
            <CarouselContent>
                {inspirationImages.map((image, index) => (
                    <CarouselItem key={index} className="basis-1/1 sm:basis-1/2 lg:basis-1/4">
                        <div className="p-1">
                            <div className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <Image 
                                    src={image.src} 
                                    alt={`Inspiration ${index + 1}`} 
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    data-ai-hint={image.hint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
      </div>

      {renderUploader()}

      <div className="py-24">
        <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-center font-playfair text-4xl lg:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-muted-foreground mb-16 text-lg">Transform your wardrobe in four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {howItWorksSteps.map((step, index) => (
                <div key={index} className="text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-secondary mb-6 flex items-center justify-center border">
                        <step.icon className="w-10 h-10 text-primary"/>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                </div>
            ))}
        </div>
      </div>
    </>
  );

  const renderPreviewAndSuggestions = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-16">
        <div className="lg:col-span-1 flex flex-col items-center space-y-8">
            <Card className="w-full max-w-sm shadow-2xl overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-playfair">Your Item</CardTitle>
                </CardHeader>
                <CardContent>
                    {previewUrl && (
                        <div className="aspect-square relative rounded-lg overflow-hidden ring-1 ring-border/50 shadow-lg">
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

            <div className="w-full max-w-sm sticky top-28 space-y-8">
                <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-playfair text-xl">Style For</CardTitle>
                    <CardDescription>Select the model for outfit suggestions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup defaultValue="woman" value={gender} onValueChange={(value: Gender) => setGender(value)} className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="woman" id="woman" className="peer sr-only" />
                        <Label htmlFor="woman" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                          Woman
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="man" id="man" className="peer sr-only" />
                        <Label htmlFor="man" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors">
                          Man
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="w-full flex flex-col gap-4">
                     <Button onClick={handleGenerate} size="lg" className="shadow-lg w-full rounded-full py-6 text-lg" disabled={loading}>
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
                    <Button onClick={handleReset} variant="outline" size="lg" className="w-full rounded-full py-6 text-lg">
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Start Over
                    </Button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2">
            {loading ? renderLoadingState() : suggestions ? renderSuggestionsState() : renderSuggestionsPlaceholder()}
        </div>
    </div>
  );
  
  const renderSuggestionsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center bg-secondary/30 rounded-lg p-12 border-2 border-dashed border-border/50 min-h-[500px] lg:sticky lg:top-28">
      <Feather className="w-16 h-16 text-muted-foreground mb-6"/>
      <h2 className="text-3xl font-bold font-playfair">Awaiting Your Masterpiece</h2>
      <p className="text-muted-foreground text-lg mt-2 max-w-sm">Click "Generate Styles" and let our AI craft the perfect looks for you.</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="w-full flex flex-col items-center justify-center text-center p-12 rounded-lg bg-secondary/30 min-h-[500px] lg:sticky lg:top-28">
      <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
      <h2 className="text-3xl font-bold mb-3 font-playfair">Curating your styles...</h2>
      <p className="text-muted-foreground text-lg max-w-sm">Our AI stylist is analyzing your item and creating unique outfits. This may take a moment.</p>
    </div>
  );

  const renderSuggestionsState = () => (
    <div className="w-full">
      <div className="text-left mb-10">
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter font-playfair">Your AI-Styled Outfits</h1>
        <p className="text-muted-foreground mt-3 text-xl max-w-2xl">Here are three unique looks, styled by AI and ready for you to explore.</p>
      </div>

      {suggestions && (
        <Tabs defaultValue={suggestions.outfitSuggestions[0]?.styleName} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-12 bg-secondary/50 rounded-lg border">
            {suggestions.outfitSuggestions.map((suggestion) => (
              <TabsTrigger key={suggestion.styleName} value={suggestion.styleName} className="text-base h-full py-2.5 sm:py-0 whitespace-normal sm:whitespace-nowrap rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground">
                {suggestion.styleName}
              </TabsTrigger>
            ))}
          </TabsList>

          {suggestions.outfitSuggestions.map((suggestion) => (
            <TabsContent key={suggestion.styleName} value={suggestion.styleName} className="mt-8">
              <Card className="overflow-hidden shadow-2xl border-2 bg-card/50">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-[3/4] bg-muted/30">
                    {suggestion.imageStatus === 'complete' && suggestion.aiStyledImage ? (
                      <Image
                        src={suggestion.aiStyledImage}
                        alt={`${suggestion.styleName} outfit`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        data-ai-hint={`${suggestion.styleName} outfit`}
                      />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black/10">
                          <Camera className="w-12 h-12 text-destructive mb-4"/>
                          <p className="text-white bg-destructive px-3 py-1 rounded-md font-semibold">Image Generation Failed</p>
                          <p className="mt-3 text-muted-foreground text-sm">The AI couldn't create an image for this style, but you can still shop the look.</p>
                        </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col">
                    <h3 className="text-4xl font-bold tracking-tight mb-3 font-playfair">{suggestion.styleName}</h3>
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
                                    <Badge variant="secondary" className="mr-2 mb-1.5 w-fit">{item.type}</Badge>
                                    <span className="font-medium text-base">{item.name}</span>
                                </div>
                                <Button asChild variant="outline" size="sm" className="rounded-full">
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
