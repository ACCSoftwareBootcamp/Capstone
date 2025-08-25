import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './CustomNodes.css';

const CustomNode = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Double-click enables editing
  const handleDoubleClick = () => setIsEditing(true);

  // Blur disables editing and notifies parent
  const handleBlur = (e) => {
    // If click was inside container (like the dropdown), don't blur
    if (containerRef.current && containerRef.current.contains(e.relatedTarget)) return;
    setIsEditing(false);
    if (data.onChange) data.onChange(id, label);
  };

  const handleChange = (e) => setLabel(e.target.value);

  const handleSelectChange = (e) => {
    const selectedPerson = e.target.value;
    if (selectedPerson) {
      setLabel(selectedPerson);
      if (data.onChange) data.onChange(id, selectedPerson);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <div
      ref={containerRef}
      className={`custom-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} id="top" style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Top} id="top" style={{ top: -8, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="target" position={Position.Right} id="right" style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="target" position={Position.Left} id="left" style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Left} id="left" style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }} />

      {/* Editable label + dropdown */}
      {/* when clicking drop down i want clear input to see all people, type to filter, click to clear again. enter/arrows to  */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            ref={inputRef}
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          {data.people && data.people.length > 0 && (
            <select
              value=""
              onChange={handleSelectChange}
              onBlur={handleBlur} // ensure blur behaves the same
              style={{ width: '100%' }}
            >
              <option value="">Select a person...</option>
              {data.people.map((p) => (
                <option key={p._id} value={`${p.firstName} ${p.lastName}`}>
                  {`${p.firstName} ${p.lastName}`}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div>{label}</div>
      )}
    </div>
  );
};

export default CustomNode;
