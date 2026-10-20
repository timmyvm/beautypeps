"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { Field } from "@/components/ui/form";
import type { FormState } from "@/lib/utils";
import { toast } from "./toast";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const FormStateContext = createContext<{ state: FormState; pending: boolean }>({ state: {}, pending: false });

/**
 * <form> bound to a server action via useActionState. Results are surfaced as
 * toasts; field errors are available to <ActionField name="..."> children.
 *
 * Submissions are dispatched manually so React's automatic post-action form
 * reset doesn't wipe what the admin typed when validation fails. Pass
 * `resetOnSuccess` to clear the form after a successful submit.
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
  // Toast as soon as the action resolves — the form may be unmounted by the
  // refreshed page (e.g. a status button that no longer applies).
  const [state, formAction, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.message) toast(result.message, !!result.ok);
    return result;
  }, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <FormStateContext.Provider value={{ state, pending }}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter;
          const formData = new FormData(e.currentTarget, submitter);
          startTransition(() => formAction(formData));
        }}
        className={className}
        id={id}
      >
        {children}
      </form>
    </FormStateContext.Provider>
  );
}

export function useActionFormState() {
  return useContext(FormStateContext).state;
}

/** True while the surrounding ActionForm's action is running. */
export function useActionFormPending() {
  return useContext(FormStateContext).pending;
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
