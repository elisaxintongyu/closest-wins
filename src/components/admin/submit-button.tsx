"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  style,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      className={className}
      style={style}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
