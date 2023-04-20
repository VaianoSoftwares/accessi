import { useState } from "react";

type TUseImage = [
  string,
  {
    updateImage: (image: unknown) => void;
    setNoImage: () => void;
  }
];

function defaultUrlFormatter(data: unknown) {
  return String(data);
}

export default function useImage(
  urlFormatter: (data: unknown) => string = defaultUrlFormatter,
  initialState: string = ""
): TUseImage {
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
  ];
}
