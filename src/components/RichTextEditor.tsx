"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import of ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => (
        <div className="h-64 w-full bg-gray-50 animate-pulse rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
            Memuat Editor...
        </div>
    ),
});

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
    ],
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="rich-text-editor">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all"
            />
            <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border: none;
          border-bottom: 1px solid #f3f4f6;
          background-color: #f9fafb;
          padding: 0.75rem;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border: none;
          min-height: 250px;
          font-family: inherit;
          font-size: 1rem;
        }
        .rich-text-editor .ql-editor {
          min-height: 250px;
          padding: 1rem;
          color: #111827;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
        </div>
    );
}
