"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { useThemeTokens } from "../ThemeContext";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  error?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "md",
      error = false,
      fullWidth = false,
      style,
      ...props
    },
    ref
  ) => {
    const tokens = useThemeTokens();
    const { colors, radii, spacing, typography, misc } = tokens;

    const sizeStyles: Record<InputSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing.xs}px ${spacing.sm}px`,
        fontSize: typography.fontSizeSm,
        borderRadius: radii.sm,
      },
      md: {
        padding: `${spacing.sm}px ${spacing.md}px`,
        fontSize: typography.fontSizeMd,
        borderRadius: radii.md,
      },
      lg: {
        padding: `${spacing.md}px ${spacing.lg}px`,
        fontSize: typography.fontSizeLg,
        borderRadius: radii.lg,
      },
    };

    const baseStyles: React.CSSProperties = {
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
      border: `1px solid ${error ? colors.danger : colors.borderSubtle}`,
      fontFamily: typography.fontFamilyBody,
      outline: "none",
      transition: "all 0.15s ease",
      width: fullWidth ? "100%" : "auto",
      ...sizeStyles[inputSize],
      ...style,
    };

    // Note: Focus styles would typically be handled via CSS or a style library
    // For inline styles, you'd need onFocus/onBlur handlers

    return (
      <input
        ref={ref}
        style={baseStyles}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

