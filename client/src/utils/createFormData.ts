import { GenericForm } from "../types/GenericForm";

export function createFormData(form: GenericForm) {
    const formData = new FormData();
    Object.entries(form)
      .filter(([key, value]) => value != null)
      .map(([key, value]) => value instanceof File ? [key, value as Blob] : [key, value as string])
      .forEach(([key, value]) => formData.append(key as string, value));
    return formData;
}