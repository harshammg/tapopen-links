import React from "react";
import { Zap } from "lucide-react";

interface RedirectErrorProps {
  message: string;
}

const RedirectError: React.FC<RedirectErrorProps> = ({ message }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <Zap className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-display font-bold mb-2">Oops! Link Problem</h1>
      <p className="text-muted-foreground font-medium">{message}</p>
      <a href="/" className="mt-8 text-primary font-bold hover:underline underline-offset-4">Return to TapOpen</a>
    </div>
  );
};

export default RedirectError;
