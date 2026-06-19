import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 hover:bg-gray-100 rounded-xl",
        gradient: "gradient-bg text-primary-foreground rounded-xl glow hover:glow-intense hover:brightness-110",
        destructive: "bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 rounded-xl",
        outline: "border border-white/10 bg-transparent hover:bg-white/5 rounded-xl",
        secondary: "bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-white rounded-xl",
        ghost: "hover:bg-white/5 hover:text-white rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
        "ghost-accent": "border border-primary/30 text-primary hover:bg-primary/10 rounded-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
