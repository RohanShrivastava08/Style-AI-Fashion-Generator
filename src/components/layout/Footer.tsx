import { Feather } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Feather className="h-8 w-8 mr-3 text-primary" />
            <p className="text-2xl font-bold">StyleAI</p>
          </div>
          <p className="text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} StyleAI. All rights reserved. <br/>
            Your personal AI-powered fashion companion.
          </p>
        </div>
      </div>
    </footer>
  );
}
