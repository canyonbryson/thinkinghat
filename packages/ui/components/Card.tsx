"use client";

import React, { HTMLAttributes, forwardRef } from "react";
import { useThemeTokens } from "../ThemeContext";

export type CardVariant = "default" | "elevated" | "outlined" | "glass";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const tokens = useThemeTokens();
    const { colors, radii, spacing, shadows, misc } = tokens;

    const paddingMap = {
      none: 0,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.xl,
    };

    const variantStyles: Record<CardVariant, React.CSSProperties> = {
      default: {
        backgroundColor: colors.surface,
        border: `1px solid ${colors.borderSubtle}`,
      },
      elevated: {
        backgroundColor: colors.surface,
        boxShadow: shadows.md,
      },
      outlined: {
        backgroundColor: "transparent",
        border: `1px solid ${colors.borderStrong}`,
      },
      glass: {
        backgroundColor: colors.surface,
        backdropFilter: misc.blurAmount > 0 ? `blur(${misc.blurAmount}px)` : undefined,
        WebkitBackdropFilter: misc.blurAmount > 0 ? `blur(${misc.blurAmount}px)` : undefined,
        border: `1px solid ${colors.borderSubtle}`,
      },
    };

    const baseStyles: React.CSSProperties = {
      borderRadius: radii.lg,
      padding: paddingMap[padding],
      transition: "all 0.2s ease",
      ...variantStyles[variant],
      ...style,
    };

    return (
      <div ref={ref} style={baseStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

