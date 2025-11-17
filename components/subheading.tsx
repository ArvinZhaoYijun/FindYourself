import { cn } from "@/lib/utils";
import { AnimationProps, MotionProps } from "framer-motion";
import React from "react";

export const Subheading = ({
  className,
  as: Tag = "p",
  children,
  ...props
}: {
  className?: string;
  as?: any;
  children: any;
  props?: React.HTMLAttributes<HTMLHeadingElement | AnimationProps>;
} & MotionProps &
  React.HTMLAttributes<HTMLHeadingElement | AnimationProps>) => {
  return (
    <Tag
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left my-4 mx-auto",
        "text-muted-foreground text-center font-normal",
        className
      )}
    >
      {children}
    </Tag>
  );
};
