import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './CustomNodes.css';

const CustomNode = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const handleBlur = () => {
    if (isEditing) {
      setIsEditing(false);
      setShowDropdown(false);
      if (data.onChange) data.onChange(id, label);
    }
  };

  const handleChange = (e) => {
    setLabel(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const handlePersonClick = (fullName) => {
    setLabel(fullName);
    if (data.onChange) data.onChange(id, fullName);
    setIsEditing(false);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const list = data.people || [];
  const filteredPeople = label
    ? list.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(label.toLowerCase())
      )
    : list; // show all when empty

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredPeople.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredPeople.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredPeople.length) % filteredPeople.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredPeople[highlightedIndex]) {
        const p = filteredPeople[highlightedIndex];
        handlePersonClick(`${p.firstName} ${p.lastName}`);
      } else {
        setIsEditing(false);
        setShowDropdown(false);
        if (data.onChange) data.onChange(id, label);
      }
    } else if (e.key === 'Tab') {
      if (filteredPeople.length > 0) {
        e.preventDefault();
        const p = highlightedIndex >= 0 ? filteredPeople[highlightedIndex] : filteredPeople[0];
        handlePersonClick(`${p.firstName} ${p.lastName}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <div
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
      {isEditing ? (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            value={label}
            placeholder="Type to filter existing people"
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, boxSizing: 'border-box' }}
          />

          {showDropdown && (
            <div
              tabIndex={-1}
              style={{
                border: '1px solid #ccc',
                borderRadius: 4,
                background: '#fff',
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 150,
                overflowY: 'auto'
              }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {filteredPeople.length > 0 ? (
                filteredPeople.map((p, index) => {
                  const fullName = `${p.firstName} ${p.lastName}`;
                  const isActive = index === highlightedIndex;
                  return (
                    <div
                      key={p._id}
                      tabIndex={-1}
                      onClick={() => handlePersonClick(fullName)}
                      style={{
                        padding: '4px 8px',
                        cursor: 'pointer',
                        background: isActive ? '#eee' : 'transparent'
                      }}
                    >
                      {fullName}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '4px 8px', color: '#888' }}>
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>{label}</div>
      )}
    </div>
  );
};

export default CustomNode;
