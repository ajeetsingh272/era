"use client";

/** Submit button that asks for confirmation before a destructive server action. */
export function ConfirmButton({ children, message, className = "a-btn danger sm" }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
