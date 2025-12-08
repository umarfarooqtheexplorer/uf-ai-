import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-light-primary dark:bg-primary/70 rounded-lg my-2 overflow-hidden border border-light-accent dark:border-accent">
      <div className="flex justify-between items-center px-4 py-2 bg-light-secondary dark:bg-secondary/50">
        <span className="text-sm text-light-text-muted dark:text-gray-400 capitalize">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-light-text-muted dark:text-gray-400 hover:text-light-text-main dark:hover:text-text-main transition-colors">
          {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-left">
        <code>{code}</code>
      </pre>
    </div>
  );
};