"use client";

import { useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { createCategory } from "@/lib/actions/categories";
import type { FormState } from "@/lib/actions/customers";
import { FormField, Input } from "@/components/ui/Field";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function CategoryForm() {
  const [state, formAction] = useFormState<FormState, FormData>(createCategory, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <FormField label="Category Name" htmlFor="categoryName" required>
        <Input id="categoryName" name="categoryName" placeholder="e.g. Brake Parts" required />
      </FormField>
      <SubmitButton className="w-full">Add Category</SubmitButton>
    </form>
  );
}
