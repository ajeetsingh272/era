import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets uncontrolled forms after a `<form action>` submission, which wipes what the
 * user typed when validation fails. Submitting through a transition keeps the values.
 */
export function keepValuesOnSubmit(dispatch: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
}
