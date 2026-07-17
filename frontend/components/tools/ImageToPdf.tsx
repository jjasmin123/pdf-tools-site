"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import UploadZone from "./UploadZone";
import FileList from "./FileList";
import ProgressBar from "./ProgressBar";

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");

  function onFiles(incoming: File[]) {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
    setStatus("idle");
    setPdfUrl("");
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function convert() {
    if (files.length === 0) return;
    setStatus("processing");
    setError("");
    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;

        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdf.embedJpg(arrayBuffer);
        } else if (file.type === "image/png") {
          image = await pdf.embedPng(arrayBuffer);
        } else {
          // Convert other formats to PNG via canvas
          const bitmap = await createImageBitmap(file);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(bitmap, 0, 0);
          const pngBlob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), "image/png"),
          );
          const pngBuffer = await pngBlob.arrayBuffer();
          image = await pdf.embedPng(pngBuffer);
        }

        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
      setStatus("error");
    }
  }

  function reset() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setFiles([]);
    setPdfUrl("");
    setStatus("idle");
    setError("");
  }

  return (
    <div className="space-y-6">
      {status !== "done" && (
        <>
          <UploadZone
            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
            multiple
            onFiles={onFiles}
            hint="Select images in the order you want them in the PDF · JPEG, PNG, WebP"
          />
          <FileList files={files} onRemove={removeFile} />

          {files.length > 0 && status !== "processing" && (
            <button
              onClick={convert}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Convert {files.length} image{files.length > 1 ? "s" : ""} to PDF
            </button>
          )}
          {status === "processing" && <ProgressBar label="Building PDF…" />}
          {status === "error" && <p className="text-red-500 text-sm text-center">{error}</p>}
        </>
      )}

      {status === "done" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl mx-auto">
            ✅
          </div>
          <div>
            <p className="font-semibold text-gray-800">Your PDF is ready!</p>
            <p className="text-sm text-gray-400">
              {files.length} image{files.length > 1 ? "s" : ""} converted
            </p>
          </div>
          <a
            href={pdfUrl}
            download="images-to-pdf.pdf"
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </a>
          <div>
            <button
              onClick={reset}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Convert more images
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
