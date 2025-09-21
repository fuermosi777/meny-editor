// src/Tiptap.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { useEffect } from 'react'
import './Tiptap.scss'

// Add a type declaration for the webkit messageHandlers on the window object
// to satisfy TypeScript.
declare global {
  interface Window {
    webkit: {
      messageHandlers: {
        [key: string]: {
          postMessage: (message: any) => void;
        };
      };
    };
    // Also declare the functions you'll be adding
    ClientInitEditor: (base64String: string) => void;
    ClientUpdateContent: (base64String: string) => void;
  }
}

/**
 * Decodes a Base64 string, correctly handling Unicode characters.
 * Swift's .toBase64() will produce a string that this can decode.
 * @param base64 The Base64 encoded string.
 * @returns The decoded string.
 */
const decodeBase64 = (base64: string): string => {
  try {
    // atob is the standard way to decode Base64
    const binaryString = atob(base64);
    // However, atob can corrupt unicode characters. This sequence correctly rebuilds them.
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error("Failed to decode Base64 string:", error);
    return "";
  }
};

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    // The initial content is now minimal, as Swift will provide the actual document.
    content: `<p>Loading document...</p>`,
    // This `onUpdate` callback is crucial for two-way data binding.
    // It sends the content back to Swift whenever the user makes a change.
    onUpdate: ({ editor }) => {
      const webkit = window.webkit;
      if (webkit && webkit.messageHandlers && webkit.messageHandlers.DocChanged) {
        // Tiptap outputs HTML, which is what we want to save.
        const contentAsHtml = editor.getHTML();
        webkit.messageHandlers.DocChanged.postMessage(contentAsHtml);
      }
    },
  })

  // This useEffect hook is the core of the solution.
  // It runs once the editor is initialized.
  useEffect(() => {
    // Don't do anything until the editor is fully ready.
    if (!editor) {
      return;
    }

    /**
     * Sets the initial content of the editor. Called by Swift once
     * the webview has loaded.
     */
    window.ClientInitEditor = (base64String: string) => {
      const htmlContent = decodeBase64(base64String);
      // setContent replaces the entire document.
      // The `false` argument prevents this action from triggering the `onUpdate` callback,
      // which would create an unnecessary loop.
      editor.commands.setContent(htmlContent, { emitUpdate: false });
    };

    /**
     * Updates the content of the editor. This is useful for programmatic
     * changes originating from the Swift side.
     */
    window.ClientUpdateContent = (base64String: string) => {
      const htmlContent = decodeBase64(base64String);
      editor.commands.setContent(htmlContent, { emitUpdate: false });
    };

    // --- Signal to Swift that the webview is ready to receive commands ---
    const webkit = window.webkit;
    if (webkit && webkit.messageHandlers && webkit.messageHandlers.Loaded) {
      webkit.messageHandlers.Loaded.postMessage('Editor is ready');
    }

    // --- Cleanup ---
    // When the component is unmounted, remove the global functions to prevent memory leaks.
    return () => {
      // @ts-ignore
      delete window.ClientInitEditor;
      // @ts-ignore
      delete window.ClientUpdateContent;
    };
  }, [editor]); // The dependency array ensures this effect runs only when the editor instance changes.


  return <EditorContent editor={editor} />
}

export default Tiptap