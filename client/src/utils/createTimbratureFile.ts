export default function createResocontoFile(content: string) {
  const rawData = new Blob([content], { type: "application/unknown" });
  const fileUrl = window.URL.createObjectURL(rawData);

  const linkElement = document.createElement("a");
  linkElement.setAttribute("style", "display: none");
  linkElement.setAttribute("href", fileUrl);
  linkElement.setAttribute("download", "tmp");

  linkElement.click();

  window.URL.revokeObjectURL(fileUrl);
}
