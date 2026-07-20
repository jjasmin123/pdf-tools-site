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

const SEO_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  "merge-pdf": {
    title: "Merge PDF Files Online Free — Combine PDFs Instantly",
    description:
      "Combine multiple PDF files into one document in seconds. Free online PDF merger — no signup, no watermark. Upload, arrange, and download your merged PDF instantly.",
    keywords: [
      "merge pdf", "combine pdf", "join pdf files", "merge pdf online free",
      "combine pdf files free", "pdf merger", "merge multiple pdfs", "online pdf combiner",
    ],
  },
  "split-pdf": {
    title: "Split PDF Online Free — Extract Pages from PDF",
    description:
      "Split a PDF into individual pages or extract a specific page range. Free online PDF splitter — no signup required. Separate chapters, remove pages, or extract sections instantly.",
    keywords: [
      "split pdf", "split pdf online free", "extract pages from pdf", "pdf splitter free",
      "separate pdf pages", "divide pdf", "cut pdf pages", "pdf page extractor",
    ],
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter Free — High-Quality PDF to Image Online",
    description:
      "Convert every page of your PDF to high-quality JPG images in seconds. Free online PDF to image converter — no signup. Each page rendered at 2× resolution for crisp output.",
    keywords: [
      "pdf to jpg", "pdf to image", "convert pdf to jpg online free", "pdf to jpeg free",
      "pdf to png", "export pdf as image", "pdf page to image", "free pdf to jpg converter",
    ],
  },
  "compress-pdf": {
    title: "Compress PDF Online Free — Reduce PDF File Size Instantly",
    description:
      "Shrink PDF file size without changing layout or losing quality. Free online PDF compressor — no signup. Ideal for email attachments, uploads, and storage. Files deleted after download.",
    keywords: [
      "compress pdf", "reduce pdf size", "compress pdf online free", "shrink pdf file",
      "pdf compressor", "make pdf smaller", "reduce pdf file size", "pdf size reducer online",
    ],
  },
  "rotate-pdf": {
    title: "Rotate PDF Online Free — Fix Upside-Down PDF Pages",
    description:
      "Rotate all pages in a PDF by 90°, 180°, or 270° with one click. Free online PDF rotator — no signup. Fix scanned documents that are upside-down or sideways instantly.",
    keywords: [
      "rotate pdf", "rotate pdf online free", "rotate pdf pages", "flip pdf pages",
      "turn pdf sideways", "fix rotated pdf", "pdf page rotator", "rotate scanned pdf",
    ],
  },
  "reorder-pdf": {
    title: "Reorder PDF Pages Online Free — Rearrange PDF Pages",
    description:
      "Rearrange pages in your PDF into any order. Free online PDF page reorderer — no signup. Move pages up or down, then download the reorganised document in seconds.",
    keywords: [
      "reorder pdf pages", "rearrange pdf pages", "reorganize pdf", "move pdf pages",
      "pdf page reorder online", "change page order pdf", "sort pdf pages", "pdf page organizer",
    ],
  },
  "watermark-pdf": {
    title: "Add Watermark to PDF Free — Custom Text Watermark Online",
    description:
      "Stamp a custom text watermark diagonally across every page of a PDF. Choose CONFIDENTIAL, DRAFT, or your own text. Free online tool — no signup. Files deleted after download.",
    keywords: [
      "add watermark to pdf", "pdf watermark online free", "text watermark pdf",
      "confidential watermark pdf", "stamp pdf watermark", "pdf watermark tool",
      "add text watermark to pdf", "watermark pdf pages",
    ],
  },
  "protect-pdf": {
    title: "Password Protect PDF Free — Encrypt PDF with AES-256 Online",
    description:
      "Add AES-256 password encryption to any PDF in seconds. Free online PDF protector — no signup. Prevent unauthorised access to sensitive documents. Files deleted immediately after encryption.",
    keywords: [
      "protect pdf with password", "encrypt pdf online free", "password protect pdf",
      "secure pdf file", "pdf encryption tool", "lock pdf with password",
      "add password to pdf", "pdf security online",
    ],
  },
  "unlock-pdf": {
    title: "Unlock PDF Online Free — Remove PDF Password",
    description:
      "Remove password protection from a PDF you own. Free online PDF unlocker — no signup needed. Enter your password to unlock and download an unprotected copy. Files deleted immediately.",
    keywords: [
      "unlock pdf online free", "remove pdf password", "pdf unlocker", "decrypt pdf",
      "unlock protected pdf", "remove password from pdf", "pdf password remover",
      "open locked pdf free",
    ],
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Free — Convert PDF to Editable DOCX",
    description:
      "Turn any PDF into a fully editable Word document. Free online PDF to Word converter — no signup. Preserves text, headings, tables, and layout. Files deleted from server after conversion.",
    keywords: [
      "pdf to word", "pdf to docx free", "convert pdf to word online free",
      "pdf to word converter", "editable word from pdf", "pdf to doc",
      "extract text from pdf to word", "free pdf to docx converter",
    ],
  },
  "pdf-to-excel": {
    title: "PDF to Excel Converter Free — Extract Tables from PDF Online",
    description:
      "Extract tables and data from PDF files into editable Excel spreadsheets. Free online PDF to Excel converter — no signup. Each detected table becomes its own worksheet. Files deleted after download.",
    keywords: [
      "pdf to excel", "pdf to xlsx free", "convert pdf to excel online free",
      "extract table from pdf", "pdf data extraction", "pdf to spreadsheet",
      "pdf to excel converter", "table extraction from pdf",
    ],
  },
  "pdf-to-pptx": {
    title: "PDF to PowerPoint Free — Convert PDF to PPTX Online",
    description:
      "Convert each page of a PDF into a PowerPoint slide. Free online PDF to PPTX converter — no signup. Each page renders as a high-quality image slide. Files deleted from server after download.",
    keywords: [
      "pdf to powerpoint", "pdf to pptx free", "convert pdf to pptx online free",
      "pdf to presentation", "pdf to slides", "pdf to powerpoint converter",
      "export pdf to pptx", "pdf to ppt online",
    ],
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free — Online PDF Numbering Tool",
    description:
      "Add automatic page numbers to every page of a PDF. Choose position, font size, and starting number. Free online tool — no signup. Perfect for reports and manuscripts. Files deleted after download.",
    keywords: [
      "add page numbers to pdf", "pdf page numbering online free", "number pdf pages",
      "insert page numbers pdf", "pdf footer page number", "page number stamp pdf",
      "pdf page counter tool", "auto page numbers pdf",
    ],
  },
  "repair-pdf": {
    title: "Repair PDF Online Free — Fix Corrupted or Damaged PDF Files",
    description:
      "Attempt to fix corrupted or damaged PDF files automatically. Free online PDF repair tool — no signup. Works on broken cross-reference tables and malformed PDF objects. Files deleted immediately.",
    keywords: [
      "repair pdf online free", "fix corrupted pdf", "pdf repair tool", "recover damaged pdf",
      "corrupt pdf fix online", "pdf file repair", "restore broken pdf", "pdf recovery tool",
    ],
  },
  "pdf-to-markdown": {
    title: "PDF to Markdown Converter Free — Extract PDF Text as Markdown",
    description:
      "Extract text from a PDF and output clean, structured Markdown. Free online PDF to Markdown converter — no signup. Headings and paragraphs preserved. Ideal for wikis, notes, and AI tools.",
    keywords: [
      "pdf to markdown", "convert pdf to markdown free", "pdf text extraction",
      "pdf to md converter", "extract text from pdf as markdown", "pdf to text free",
      "pdf content to markdown", "pdf to plain text online",
    ],
  },
  "crop-pdf": {
    title: "Crop PDF Online Free — Remove Margins from PDF Pages",
    description:
      "Remove unwanted margins or whitespace from every page of a PDF. Free online PDF cropper — no signup. Specify crop amounts in mm per side. Files deleted from server immediately after processing.",
    keywords: [
      "crop pdf online free", "remove margins from pdf", "trim pdf pages",
      "pdf crop tool", "cut pdf margins", "resize pdf page online",
      "pdf whitespace remover", "pdf margin cutter",
    ],
  },
  "compress-image": {
    title: "Compress Image Online Free — Reduce Image File Size",
    description:
      "Compress JPEG, PNG, or WebP images without visible quality loss. Free online image compressor — no signup, no upload. Runs entirely in your browser. Perfect for web, email, and social media.",
    keywords: [
      "compress image online free", "reduce image size", "image compressor",
      "jpeg compressor online", "png compressor free", "shrink image file size",
      "image optimizer online", "compress photo free no upload",
    ],
  },
  "image-to-pdf": {
    title: "Image to PDF Converter Free — JPG, PNG to PDF Online",
    description:
      "Convert JPG, PNG, WebP, or GIF images into a single PDF document. Free online image to PDF converter — no signup. Combine multiple photos into one PDF. Runs locally in your browser.",
    keywords: [
      "image to pdf online free", "jpg to pdf", "png to pdf converter",
      "convert image to pdf", "photo to pdf free", "pictures to pdf online",
      "multiple images to pdf", "jpg to pdf no signup",
    ],
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free — Convert DOCX to PDF Online",
    description:
      "Convert Word documents (.docx, .doc) to PDF with pixel-perfect formatting. Free online Word to PDF converter — no signup. Powered by LibreOffice. Files deleted from server after download.",
    keywords: [
      "word to pdf online free", "docx to pdf converter", "convert word to pdf",
      "doc to pdf online", "microsoft word to pdf free", "docx to pdf no signup",
      "convert document to pdf", "word file to pdf",
    ],
  },
  "pptx-to-pdf": {
    title: "PowerPoint to PDF Free — Convert PPTX to PDF Online",
    description:
      "Convert PowerPoint presentations (.pptx, .ppt) to PDF while preserving all slides, text, and images. Free online PPTX to PDF converter — no signup. Files deleted from server after download.",
    keywords: [
      "powerpoint to pdf online free", "pptx to pdf converter", "convert pptx to pdf",
      "ppt to pdf free", "presentation to pdf online", "slides to pdf converter",
      "convert presentation to pdf free", "pptx to pdf no signup",
    ],
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free — Convert XLSX to PDF Online",
    description:
      "Convert Excel spreadsheets (.xlsx, .xls) into clean, shareable PDFs. Free online Excel to PDF converter — no signup. Preserves cell formatting, charts, and multiple sheets. Files deleted after download.",
    keywords: [
      "excel to pdf online free", "xlsx to pdf converter", "convert excel to pdf",
      "xls to pdf free", "spreadsheet to pdf online", "excel file to pdf converter",
      "convert excel to pdf no signup", "excel to pdf tool",
    ],
  },
};

const BASE_URL = "https://www.getpdftap.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return {};

  const seo = SEO_META[slug] ?? {
    title: `${tool.name} — Free Online Tool, No Signup`,
    description: `${tool.description} Free online tool. No signup needed. Files deleted immediately after conversion.`,
    keywords: [tool.name.toLowerCase(), "free online tool", "pdf tool"],
  };

  const canonicalUrl = `${BASE_URL}/tools/${slug}`;
  const ogImage = `${BASE_URL}/og-image.png`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      siteName: "PDFTap",
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${tool.name} — PDFTap` }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
  };
}

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

function ToolJsonLd({ slug, tool }: { slug: string; tool: { name: string; description: string } }) {
  const seo = SEO_META[slug];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: seo?.description ?? tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `${BASE_URL}/tools/${slug}`,
    provider: {
      "@type": "Organization",
      name: "PDFTap",
      url: BASE_URL,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();

  const ClientComponent = CLIENT_TOOLS[slug];
  const serverConfig = SERVER_TOOLS[slug];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <ToolJsonLd slug={slug} tool={tool} />

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
