import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  [{ background: ['#fff59d', '#ffcc80', '#a5d6a7', '#90caf9', '#f8bbd0', false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

/**
 * Rich text editor for business descriptions (bold, highlight, lists).
 */
const RichTextEditor = ({ value = '', onChange, placeholder = 'Write a description…' }) => {
  const modules = useMemo(
    () => ({
      toolbar: toolbarOptions,
      clipboard: { matchVisual: false },
    }),
    []
  );

  const formats = useMemo(
    () => ['bold', 'italic', 'underline', 'background', 'list'],
    []
  );

  return (
    <div className="rich-text-editor overflow-hidden rounded-xl border border-purple-100 bg-white">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={(html) => {
          // Quill empty state is often "<p><br></p>"
          const cleaned = html === '<p><br></p>' || html === '<p></p>' ? '' : html;
          onChange?.(cleaned);
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
