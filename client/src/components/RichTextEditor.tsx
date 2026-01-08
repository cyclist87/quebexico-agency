import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  apiKey?: string;
}

export function RichTextEditor({ value, onChange, placeholder, height = 300, apiKey }: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const effectiveApiKey = apiKey || import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';

  return (
    <Editor
      tinymceScriptSrc={`https://cdn.tiny.cloud/1/${effectiveApiKey}/tinymce/6/tinymce.min.js`}
      onInit={(_evt: unknown, editor: TinyMCEEditor) => { editorRef.current = editor; }}
      value={value}
      onEditorChange={(content: string) => onChange(content)}
      init={{
        height,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'link image | removeformat | code | help',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
        placeholder: placeholder || 'Commencez à écrire...',
        branding: false,
        promotion: false,
        skin: 'oxide',
        content_css: 'default',
      }}
    />
  );
}
