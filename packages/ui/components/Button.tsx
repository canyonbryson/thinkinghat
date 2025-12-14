"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { useThemeTokens } from "../ThemeContext";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const tokens = useThemeTokens();
    const { colors, radii, spacing, typography, shadows } = tokens;

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: `${spacing.xs}px ${spacing.md}px`,
        fontSize: typography.fontSizeSm,
        borderRadius: radii.sm,
      },
      md: {
        padding: `${spacing.sm}px ${spacing.lg}px`,
        fontSize: typography.fontSizeMd,
        borderRadius: radii.md,
      },
      lg: {
        padding: `${spacing.md}px ${spacing.xl}px`,
        fontSize: typography.fontSizeLg,
        borderRadius: radii.lg,
      },
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary,
        color: colors.primaryText,
        border: "none",
        boxShadow: shadows.sm,
      },
      secondary: {
        backgroundColor: colors.surface,
        color: colors.text,
        border: `1px solid ${colors.borderStrong}`,
      },
      ghost: {
        backgroundColor: "transparent",
        color: colors.text,
        border: "none",
      },
      danger: {
        backgroundColor: colors.danger,
        color: "#FFFFFF",
        border: "none",
      },
    };

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      fontFamily: typography.fontFamilyBody,
      fontWeight: typography.weightMedium,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.6 : 1,
      transition: "all 0.15s ease",
      width: fullWidth ? "100%" : "auto",
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={baseStyles}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";

