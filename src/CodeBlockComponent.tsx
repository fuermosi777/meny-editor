import { useState } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { Check, Copy } from 'lucide-react';
import './CodeBlockComponent.scss';

// ✅ Type the component's props with NodeViewProps
function CodeBlockComponent({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    // 💡 A more reliable way to get the node's text content
    const codeContent = node.textContent;

    if (codeContent) {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <NodeViewWrapper className="code-block">
      <button onClick={copyToClipboard} className="copy-button">
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>

      <pre>
        {/* @ts-ignore */}
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

export default CodeBlockComponent;