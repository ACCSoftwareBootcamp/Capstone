import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './CustomNodes.css';

const CustomNode = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const list = data.people || [];
  const filteredPeople = label
    ? list.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(label.toLowerCase())
      )
    : list;

  // auto highlight first match
  useEffect(() => {
    if (showDropdown && filteredPeople.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [filteredPeople, showDropdown]);

  const startEditing = () => {
    setIsEditing(true);
    setShowDropdown(true);
    setHoveredIndex(-1);
  };

  const commitLabel = (newLabel) => {
    setLabel(newLabel);
    if (data.onChange) data.onChange(id, newLabel);
  };

  const handleBlur = (e) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setIsEditing(false);
      setShowDropdown(false);
      commitLabel(label);
      setHoveredIndex(-1);
    }
  };

  const handleChange = (e) => {
    setLabel(e.target.value);
    setShowDropdown(true);
    setHoveredIndex(-1);
  };

  const selectPerson = (fullName) => {
    commitLabel(fullName);
    setIsEditing(false);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    setHoveredIndex(-1);
  };

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
      const selected = highlightedIndex >= 0 ? filteredPeople[highlightedIndex] : filteredPeople[0];
      if (selected) selectPerson(`${selected.firstName} ${selected.lastName}`);
    } else if (e.key === 'Tab') {
      const selected = highlightedIndex >= 0 ? filteredPeople[highlightedIndex] : filteredPeople[0];
      if (selected) {
        e.preventDefault();
        selectPerson(`${selected.firstName} ${selected.lastName}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
      setHoveredIndex(-1);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
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
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            value={label}
            placeholder="Type to filter existing people"
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            onWheel={(e) => e.stopPropagation()}
            style={{ flex: 1, boxSizing: 'border-box' }}
          />

          {showDropdown && (
            <div
              ref={dropdownRef}
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
                overflowY: 'auto',
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              {filteredPeople.length > 0 ? (
                filteredPeople.map((p, index) => {
                  const fullName = `${p.firstName} ${p.lastName}`;
                  const isActive = index === highlightedIndex || index === hoveredIndex;
                  return (
                    <div
                      key={p._id}
                      tabIndex={-1}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(-1)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPerson(fullName)}
                      style={{
                        padding: '4px 8px',
                        cursor: 'pointer',
                        background: isActive ? '#eee' : 'transparent',
                      }}
                    >
                      {fullName}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '4px 8px', color: '#888' }}>No matches found</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div onDoubleClick={startEditing}>{label}</div>
      )}
    </div>
  );
};

export default CustomNode;
