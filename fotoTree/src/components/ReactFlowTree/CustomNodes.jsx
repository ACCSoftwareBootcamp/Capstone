import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './CustomNodes.css';

const CustomNode = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef(null);

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => {
  setIsEditing(false);
  if (data.onChange) {
    data.onChange(id, label); // Notify App.jsx of label change
  }
};

  const handleChange = (e) => setLabel(e.target.value);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`custom-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* Right */}
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }}
      />

      {/* Bottom */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }}
      />

      {/* Editable Label */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          className="node-input"
        />
      ) : (
        <div className="custom-node-label">{label}</div>
      )}
    </div>
  );
};

export default CustomNode;
