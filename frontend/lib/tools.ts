export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  clientSide: boolean;
};

export type Category = {
  id: string;
  label: string;
  tools: Tool[];
};

export const TOOLS: Tool[] = [
  // PDF Tools
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one file in seconds.",
    icon: "⊕",
    category: "pdf",
    clientSide: true,
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Extract pages or split a PDF into separate files.",
    icon: "✂",
    category: "pdf",
    clientSide: true,
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Convert every PDF page to a high-quality JPG image.",
    icon: "🖼",
    category: "pdf",
    clientSide: true,
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while keeping it readable.",
    icon: "⬇",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate all pages in a PDF by 90°, 180°, or 270°.",
    icon: "↻",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "reorder-pdf",
    name: "Reorder PDF Pages",
    description: "Rearrange pages in any order and save a new PDF.",
    icon: "⇅",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "watermark-pdf",
    name: "Add Watermark",
    description: "Stamp custom text as a diagonal watermark on every page.",
    icon: "💧",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    description: "Add a password to prevent unauthorised access.",
    icon: "🔒",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    description: "Remove password protection from a PDF you own.",
    icon: "🔓",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    description: "Turn any PDF into an editable Word document.",
    icon: "📄",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract tables from PDFs into editable spreadsheets.",
    icon: "📊",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "pdf-to-pptx",
    name: "PDF to PowerPoint",
    description: "Convert each PDF page into a PowerPoint slide.",
    icon: "📽",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "page-numbers",
    name: "Page Numbers",
    description: "Add page numbers to every page of a PDF.",
    icon: "🔢",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "repair-pdf",
    name: "Repair PDF",
    description: "Fix corrupted or damaged PDF files automatically.",
    icon: "🔧",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "pdf-to-markdown",
    name: "PDF to Markdown",
    description: "Extract PDF text into clean, structured Markdown.",
    icon: "📝",
    category: "pdf",
    clientSide: false,
  },
  {
    slug: "crop-pdf",
    name: "Crop PDF",
    description: "Remove margins from every page of a PDF by specifying crop amounts.",
    icon: "✂️",
    category: "pdf",
    clientSide: false,
  },

  // Image Tools
  {
    slug: "compress-image",
    name: "Compress Image",
    description: "Shrink JPEG, PNG, or WebP images without visible quality loss.",
    icon: "🗜",
    category: "image",
    clientSide: true,
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert one or more images into a single PDF file.",
    icon: "📷",
    category: "image",
    clientSide: true,
  },

  // Word Tools
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert .docx files to PDF with perfect formatting.",
    icon: "📝",
    category: "word",
    clientSide: false,
  },

  // PowerPoint Tools
  {
    slug: "pptx-to-pdf",
    name: "PowerPoint to PDF",
    description: "Convert .pptx presentations to PDF with all slides intact.",
    icon: "📽",
    category: "pptx",
    clientSide: false,
  },

  // Excel Tools
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Turn spreadsheets into clean, shareable PDFs.",
    icon: "📈",
    category: "excel",
    clientSide: false,
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract tables from PDFs into editable spreadsheets.",
    icon: "📊",
    category: "excel",
    clientSide: false,
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "pdf",
    label: "PDF Tools",
    tools: TOOLS.filter((t) => t.category === "pdf"),
  },
  {
    id: "image",
    label: "Image Tools",
    tools: TOOLS.filter((t) => t.category === "image"),
  },
  {
    id: "word",
    label: "Word Tools",
    tools: TOOLS.filter((t) => t.category === "word"),
  },
  {
    id: "pptx",
    label: "PowerPoint Tools",
    tools: TOOLS.filter((t) => t.category === "pptx"),
  },
  {
    id: "excel",
    label: "Excel Tools",
    tools: TOOLS.filter((t) => t.category === "excel"),
  },
];
