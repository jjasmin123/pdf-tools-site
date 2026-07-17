import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOOLS } from "@/lib/tools";
import ImageCompressor from "@/components/tools/ImageCompressor";
import ImageToPdf from "@/components/tools/ImageToPdf";
import MergePdf from "@/components/tools/MergePdf";
import SplitPdf from "@/components/tools/SplitPdf";
import PdfToJpg from "@/components/tools/PdfToJpg";
import ServerToolUpload from "@/components/tools/ServerToolUpload";
import CompressPdf from "@/components/tools/CompressPdf";
import RotatePdf from "@/components/tools/RotatePdf";
import ReorderPdf from "@/components/tools/ReorderPdf";
import WatermarkPdf from "@/components/tools/WatermarkPdf";
import ProtectPdf from "@/components/tools/ProtectPdf";
import UnlockPdf from "@/components/tools/UnlockPdf";
import PageNumbers from "@/components/tools/PageNumbers";
import CropPdf from "@/components/tools/CropPdf";
import AdSlot from "@/components/AdSlot";

type Props = { params: Promise<{ slug: string }> };

const CLIENT_TOOLS: Record<string, React.ComponentType> = {
  "compress-image": ImageCompressor,
  "compress-pdf": CompressPdf,
  "rotate-pdf": RotatePdf,
  "reorder-pdf": ReorderPdf,
  "watermark-pdf": WatermarkPdf,
  "protect-pdf": ProtectPdf,
  "unlock-pdf": UnlockPdf,
  "image-to-pdf": ImageToPdf,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "pdf-to-jpg": PdfToJpg,
  "page-numbers": PageNumbers,
  "crop-pdf": CropPdf,
};

type ServerToolConfig = React.ComponentProps<typeof ServerToolUpload>;

const SERVER_TOOLS: Record<string, ServerToolConfig> = {
  "word-to-pdf": {
    endpoint: "/api/word/to-pdf",
    acceptMime:
      "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    acceptLabel: ".docx, .doc",
    outputExtension: "pdf",
    outputMime: "application/pdf",
    accentColor: "indigo",
  },
  "pptx-to-pdf": {
    endpoint: "/api/pptx/to-pdf",
    acceptMime:
      "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    acceptLabel: ".pptx, .ppt",
    outputExtension: "pdf",
    outputMime: "application/pdf",
    accentColor: "red",
  },
  "pdf-to-word": {
    endpoint: "/api/pdf/to-word",
    acceptMime: "application/pdf",
    acceptLabel: ".pdf",
    outputExtension: "docx",
    outputMime:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    accentColor: "indigo",
  },
  "pdf-to-pptx": {
    endpoint: "/api/pdf/to-pptx",
    acceptMime: "application/pdf",
    acceptLabel: ".pdf",
    outputExtension: "pptx",
    outputMime:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    accentColor: "red",
  },
  "pdf-to-markdown": {
    endpoint: "/api/pdf/to-markdown",
    acceptMime: "application/pdf",
    acceptLabel: ".pdf",
    outputExtension: "md",
    outputMime: "text/markdown",
    accentColor: "blue",
  },
  "repair-pdf": {
    endpoint: "/api/pdf/repair",
    acceptMime: "application/pdf",
    acceptLabel: ".pdf",
    outputExtension: "pdf",
    outputMime: "application/pdf",
    accentColor: "green",
  },
  "excel-to-pdf": {
    endpoint: "/api/excel/to-pdf",
    acceptMime:
      "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    acceptLabel: ".xlsx, .xls",
    outputExtension: "pdf",
    outputMime: "application/pdf",
    accentColor: "green",
  },
  "pdf-to-excel": {
    endpoint: "/api/pdf/to-excel",
    acceptMime: "application/pdf",
    acceptLabel: ".pdf",
    outputExtension: "xlsx",
    outputMime:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    accentColor: "green",
  },
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  "compress-image":
    "Image compression reduces file size by removing redundant data while preserving visual quality. Use this tool to prepare images for websites, email attachments, or social media where file size limits apply. Supports JPEG, PNG, and WebP formats. Runs entirely in your browser — your images are never uploaded to a server.",
  "image-to-pdf":
    "Convert one or more images into a single, shareable PDF document. Useful for combining scanned documents, receipts, or photos into a single file. Each image becomes one page. Supports JPEG, PNG, WebP, and GIF. Processing happens locally in your browser, so nothing is sent to our servers.",
  "merge-pdf":
    "Combine multiple PDF files into one document in seconds. Simply upload your PDFs in the order you want them merged and download the result. Perfect for combining reports, contracts, or chapters. All processing is done locally — no files are uploaded to any server.",
  "split-pdf":
    "Split a PDF into individual pages or extract a specific range of pages into a new file. Great for separating chapters, removing pages, or sharing only part of a document. Processing is entirely in-browser — your PDF never leaves your device.",
  "pdf-to-jpg":
    "Convert every page of a PDF into a high-resolution JPG image. Each page is rendered at 2x resolution for crisp output. Ideal for presentations, previews, or sharing PDF content as images. Runs fully in your browser with no server upload required.",
  "word-to-pdf":
    "Convert Word documents (.docx, .doc) to PDF with pixel-perfect formatting. Powered by LibreOffice for accurate rendering of fonts, tables, images, and layout. Your file is uploaded securely, converted, and deleted from our server after download.",
  "pptx-to-pdf":
    "Convert PowerPoint presentations (.pptx, .ppt) into a PDF document, preserving all slides, text, and images. Powered by LibreOffice. Your file is processed securely and deleted from our server after download.",
  "pdf-to-word":
    "Turn any PDF into a fully editable Word document. Our converter preserves text, headings, tables, and layout as closely as possible. Useful for editing contracts, reports, or scanned documents. Files are deleted from our server immediately after conversion.",
  "pdf-to-pptx":
    "Convert each page of a PDF into a PowerPoint slide. Each page is rendered as a high-quality image and embedded in its own slide. Perfect for presenting documents or repurposing PDF content in slide decks. Files are deleted from our server after download.",
  "pdf-to-markdown":
    "Extract the text content of a PDF and output it as clean, structured Markdown. Headings, paragraphs, and page breaks are preserved automatically. Ideal for feeding PDF content into notes, wikis, or AI tools that accept Markdown. Files are deleted after download.",
  "repair-pdf":
    "Attempt to fix corrupted or damaged PDF files by re-parsing and re-saving the document. Works on most common corruption types such as broken cross-reference tables and malformed objects. Files are processed and deleted from our server immediately.",
  "page-numbers":
    "Add automatic page numbers to every page of a PDF. Choose the position (bottom-center, top-right, etc.), font size, and starting number. Ideal for reports, manuscripts, and multi-page documents. Files are deleted from our server after download.",
  "excel-to-pdf":
    "Convert Excel spreadsheets (.xlsx, .xls) to clean, shareable PDF documents. Powered by LibreOffice for accurate rendering of cell formatting, charts, and multiple sheets. Files are deleted from our server the moment your download is ready.",
  "pdf-to-excel":
    "Extract tables and data from PDF files into editable Excel spreadsheets. Each detected table is placed in its own worksheet. Ideal for pulling data from reports, statements, and invoices into a format you can work with.",
  "crop-pdf":
    "Remove unwanted margins or whitespace from every page of a PDF by specifying how many millimetres to cut from each side. Useful for trimming scanned documents, removing scanner borders, or adjusting page dimensions for printing. Files are deleted from our server immediately after processing.",
  "compress-pdf":
    "Reduce PDF file size by removing unused objects, compressing streams, and optimising fonts — without re-rendering pages or changing layout. Ideal for shrinking large reports before emailing them. Files are deleted from our server immediately after conversion.",
  "rotate-pdf":
    "Rotate all pages in a PDF by 90°, 180°, or 270° in one click. Useful for fixing scanned documents that are upside-down or sideways. The rotation is stored in the PDF standard — it works in all viewers. Files are deleted from our server immediately after conversion.",
  "reorder-pdf":
    "Rearrange the pages of a PDF into any order. Simply upload your document, use the arrows to move pages up or down, then download the reordered PDF. Useful for reorganising chapters, reports, or scanned multi-page documents. Files are deleted from our server immediately.",
  "watermark-pdf":
    "Stamp a custom text watermark diagonally across every page of a PDF. Choose from common presets like CONFIDENTIAL or DRAFT, or type your own text. Control the opacity and colour to match your branding. Files are deleted from our server immediately after processing.",
  "protect-pdf":
    "Add AES-256 password encryption to any PDF. Once protected, the file cannot be opened without the correct password. Important: save your password — there is no way to recover it if lost. Files are deleted from our server immediately after encryption.",
  "unlock-pdf":
    "Remove password protection from a PDF you already have access to. You must know the current password — this tool does not crack or bypass unknown passwords. After removal, the PDF can be opened freely in any viewer. Files are deleted from our server immediately.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return {};
  return {
    title: `${tool.name} – Free, Fast, No Signup Required`,
    description: `${tool.description} Free online tool. No signup needed. Files deleted immediately after conversion.`,
  };
}

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();

  const ClientComponent = CLIENT_TOOLS[slug];
  const serverConfig = SERVER_TOOLS[slug];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Tool header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{tool.icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
        <p className="text-gray-500">{tool.description}</p>
      </div>

      {/* Trust badge */}
      <p className="text-center text-xs text-green-700 bg-green-50 border border-green-200 rounded-full inline-block px-4 py-1.5 mb-8 w-full">
        🔒 Files are automatically deleted after conversion. We never store or view your files.
      </p>

      {/* Tool UI */}
      {ClientComponent ? (
        <ClientComponent />
      ) : serverConfig ? (
        <ServerToolUpload {...serverConfig} />
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 bg-gray-50 text-center">
          <p className="text-gray-400 text-sm font-medium">Coming soon.</p>
        </div>
      )}

      <AdSlot />

      {/* SEO description */}
      <div className="mt-10 text-gray-500 leading-relaxed text-[14px] space-y-2">
        <h2 className="text-base font-semibold text-gray-700">About {tool.name}</h2>
        <p>
          {TOOL_DESCRIPTIONS[slug] ??
            `Use this free online tool to ${tool.description.toLowerCase()}`}
        </p>
      </div>
    </div>
  );
}
