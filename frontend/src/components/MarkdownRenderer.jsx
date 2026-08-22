import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * 优雅的 Markdown 渲染组件，支持段落、加粗、无序/有序列表、行内高亮与排版美化
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`prose-chat-markdown ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="md-p">{children}</p>,
          strong: ({ children }) => <strong className="md-bold">{children}</strong>,
          em: ({ children }) => <em className="md-italic">{children}</em>,
          ul: ({ children }) => <ul className="md-ul">{children}</ul>,
          ol: ({ children }) => <ol className="md-ol">{children}</ol>,
          li: ({ children }) => <li className="md-li">{children}</li>,
          h1: ({ children }) => <h3 className="md-h1">{children}</h3>,
          h2: ({ children }) => <h4 className="md-h2">{children}</h4>,
          h3: ({ children }) => <h5 className="md-h3">{children}</h5>,
          code: ({ children }) => <code className="md-code">{children}</code>,
          blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>
        }}
      >
        {String(content)}
      </ReactMarkdown>
    </div>
  );
}
