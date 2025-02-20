import React, { useMemo, useCallback } from 'react';
import { createEditor, Editor, Transforms, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

// Define initial value
const INITIAL_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const SlateEditor = ({ value = INITIAL_VALUE, onChange }) => {
  // Initialize the editor
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Ensure value is always valid
  const editorValue = useMemo(() => {
    try {
      return Array.isArray(value) && value.length > 0 ? value : INITIAL_VALUE;
    } catch (error) {
      console.error('Invalid editor value:', error);
      return INITIAL_VALUE;
    }
  }, [value]);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'paragraph':
        return <p {...props.attributes}>{props.children}</p>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback(props => {
    return (
      <span
        {...props.attributes}
        style={{
          fontWeight: props.leaf.bold ? 'bold' : 'normal',
          fontStyle: props.leaf.italic ? 'italic' : 'normal',
          textDecoration: props.leaf.underline ? 'underline' : 'none',
        }}
      >
        {props.children}
      </span>
    );
  }, []);

  const Toolbar = () => (
    <div className="toolbar">
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          const [match] = Editor.nodes(editor, {
            match: n => n.bold === true,
          });
          Transforms.setNodes(
            editor,
            { bold: !match },
            { match: n => Text.isText(n), split: true }
          );
        }}
      >
        Bold
      </button>
      {/* Add more formatting buttons here */}
    </div>
  );

  return (
    <div className="slate-editor">
      <Slate 
        editor={editor} 
        value={editorValue} 
        onChange={value => onChange(value)}
      >
        <Toolbar />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Start typing..."
          spellCheck
          autoFocus
          onKeyDown={event => {
            if (!event.ctrlKey) return;

            switch (event.key) {
              case 'b': {
                event.preventDefault();
                const [match] = Editor.nodes(editor, {
                  match: n => n.bold === true,
                });
                Transforms.setNodes(
                  editor,
                  { bold: !match },
                  { match: n => Text.isText(n), split: true }
                );
                break;
              }
              default: {
                // Handle any other key combinations
                break;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default SlateEditor; 