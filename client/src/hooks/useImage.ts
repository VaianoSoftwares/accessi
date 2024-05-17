import { useState } from "react";

function defaultUrlFormatter(data: unknown) {
  return String(data);
}

export default function useImage(
  urlFormatter: (data: unknown) => string = defaultUrlFormatter,
  initialState: string = ""
) {
  const [imageUrl, setImageUrl] = useState(initialState);

  function updateImage(data: unknown) {
    if (data instanceof Blob) updateByBlob(data);
    else updatedByGenericData(data);
  }

  function updateByBlob<T extends Blob>(obj: T) {
    const reader = new FileReader();
    reader.readAsDataURL(obj);
    reader.onload = () => setImageUrl(reader.result as string);
  }

  function updatedByGenericData(data: unknown) {
    const url = urlFormatter(data);
    setImageUrl(url);
  }

  function setNoImage() {
    setImageUrl("");
  }

  return [
    imageUrl,
    {
      updateImage,
      setNoImage,
    },
  ] as const;
}
