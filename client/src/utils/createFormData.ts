import { GenericForm } from "../types/GenericForm";

export default (() => {
  return (form: GenericForm) => {
    const formData = new FormData();
    Object.entries(form)
      .filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
      .forEach(([key, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach((file) => formData.append(key, file));
        } else if (value instanceof Blob) formData.append(key, value);
        else formData.append(key, value as string);
      });
    return formData;
  };
})();