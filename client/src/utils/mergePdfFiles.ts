import { PDFDocument } from "pdf-lib";

export default async function mergeDocs(files: FileList) {
  if (files.length < 1) {
    return null;
  } else if (files.length === 1) {
    const file = files.item(0);
    if (!file) {
      return null;
    }
    const arrayBuffer = await file.arrayBuffer();
    const fileRawData = new Uint8Array(arrayBuffer);
    const fileBlob = new Blob([fileRawData], { type: "application/pdf" });
    return fileBlob;
  }

  const MAX_FILES = 10;
  const numFiles = files.length < MAX_FILES ? files.length : MAX_FILES;

  const mergedPdf = await PDFDocument.create();

  let i = 0;
  for (; i < numFiles; ++i) {
    const currentFile = files.item(i);
    if (!currentFile) continue;
    const arrayBuffer = await currentFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  if (i < 1) {
    return null;
  }

  const mergedPdfBytes = await mergedPdf.save();
  const mergedBlob = new Blob([mergedPdfBytes], { type: "application/pdf" });

  return mergedBlob;
}