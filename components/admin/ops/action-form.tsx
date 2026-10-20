"use client";

import { createContext, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { Field } from "@/components/ui/form";
import type { FormState } from "@/lib/utils";
import { toast } from "./toast";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const FormStateContext = createContext<FormState>({});

/**
 * <form> bound to a server action via useActionState. Results are surfaced as
 * toasts; field errors are available to <ActionField name="..."> children.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  id,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  id?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, !!state.ok);
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <FormStateContext.Provider value={state}>
      <form ref={formRef} action={formAction} className={className} id={id}>
        {children}
      </form>
    </FormStateContext.Provider>
  );
}

export function useActionFormState() {
  return useContext(FormStateContext);
}

/** Field wrapper that picks up its error from the surrounding ActionForm. */
export function ActionField({
  name,
  htmlFor,
  label,
  hint,
  className,
  children,
}: {
  name: string;
  /** Id of the control, when it differs from `name`. */
  htmlFor?: string;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const state = useActionFormState();
  return (
    <Field label={label} htmlFor={htmlFor ?? name} error={state.errors?.[name]} hint={hint} className={className}>
      {children}
    </Field>
  );
}
