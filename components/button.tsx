import { cn } from "@/lib/utils";
import React from "react";

export const Button: React.FC<{
  children?: React.ReactNode;
  className?: string;
  variant?: "simple" | "outline" | "primary";
  size?: "sm" | "md" | "lg";
  as?: React.ElementType;
  [x: string]: any;
}> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  as: Tag = "button",
  ...props
}) => {
  const sizeClass =
    size === "sm"
      ? "text-xs px-3 py-1.5"
      : size === "lg"
      ? "text-base px-6 py-3"
      : "text-sm md:text-sm px-4 py-2";

  const variantClass =
    variant === "simple"
      ? "bg-transparent hover:bg-hover border border-transparent text-foreground hover:text-hover-foreground transition font-medium duration-200 rounded-full flex items-center justify-center"
      : variant === "outline"
      ? "bg-background hover:bg-primary hover:shadow-xl text-foreground border border-border hover:text-primary-foreground transition font-medium duration-200 rounded-full flex items-center justify-center"
      : variant === "primary"
      ? "bg-primary hover:bg-primary/90 border border-transparent text-primary-foreground transition font-medium duration-200 rounded-full flex items-center justify-center shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.25)_inset,_0px_1px_0px_0px_rgba(255,255,255,0.25)_inset]"
      : "";
  return (
    <Tag
      className={cn(
        "relative z-10",
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children ?? `Get Started`}
    </Tag>
  );
};
