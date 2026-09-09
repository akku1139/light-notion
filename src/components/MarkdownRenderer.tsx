import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';

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
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
      prose-img:rounded-lg prose-img:shadow-md
      prose-li:leading-7
      prose-table:border-collapse
      [&_table]:w-full [&_table]:border [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 dark:[&_th]:bg-gray-800 [&_td]:border [&_td]:px-3 [&_td]:py-2
      [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
      prose-code:text-sm prose-code:font-mono
      prose-code:bg-gray-100 dark:prose-code:bg-gray-800
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-code:before:content-none prose-code:after:content-none
      [&_pre]:bg-gray-900 dark:[&_pre]:bg-gray-950
      [&_pre]:rounded-lg [&_pre]:p-0 [&_pre]:overflow-hidden
      [&_pre_code]:bg-transparent [&_pre_code]:p-4 [&_pre_code]:block
      [&_pre_code]:text-sm [&_pre_code]:leading-relaxed
      [&_pre_code_span]:bg-transparent!">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [
            rehypePrettyCode,
            {
              theme: 'github-dark',
              keepBackground: false,
            },
          ],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
