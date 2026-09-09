import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:tracking-tight
      prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
      prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
      prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
      prose-p:leading-7 prose-p:mb-4
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:rounded-lg prose-pre:p-4
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
      prose-img:rounded-lg prose-img:shadow-md
      prose-li:leading-7
      prose-table:border-collapse
      [&_table]:w-full [&_table]:border [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-800 [&_td]:border [&_td]:px-3 [&_td]:py-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
