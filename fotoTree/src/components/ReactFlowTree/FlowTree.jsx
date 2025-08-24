import { useCallback, useRef } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
// import "./index.css";
import CustomNode from "../ReactFlowTree/CustomNodes";

// register custom node types
const nodeTypes = {
  custom: CustomNode,
};

// --- Default example nodes (used if DB has no nodes/edges) ---
const defaultNodes = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Me" },
    type: "custom",
  },
  {
    id: "n2",
    position: { x: 0, y: 100 },
    data: { label: "My Child" },
    type: "custom",
  },
].map((node) => ({
  ...node,
  data: {
    ...node.data,
    onChange: () => {}, // Placeholder, will be overridden later
  },
}));

const defaultEdges = [
  {
    id: "e1",
    source: "n1",
    target: "n2",
    type: "straight",
    sourceHandle: "bottom",
    targetHandle: "top",
  },
];

let id = 3;
const getId = () => `n${id++}`;
const nodeOrigin = [0.5, 0];

// --- Flow component (renders the graph) ---
const Flow = ({ initialNodes, initialEdges }) => {
  const reactFlowWrapper = useRef(null);

  // ✅ use DB nodes/edges if present, otherwise fallback to defaults
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes?.length ? initialNodes : defaultNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges?.length ? initialEdges : defaultEdges
  );

  const { screenToFlowPosition } = useReactFlow();

  const connectingHandleId = useRef(null);
  const connectingNodeId = useRef(null);

  // helper to get opposite handle when connecting nodes
  const getOppositeHandle = (handleId) => {
    const opposites = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };
    return opposites[handleId] || "top";
  };

  // updates node label when edited
  const onLabelChange = useCallback(
    (id, newLabel) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  label: newLabel,
                  onChange: node.data.onChange,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  // ensures nodes always get the onChange handler
  const patchNodesWithOnChange = useCallback(
    (nodesToPatch) =>
      nodesToPatch.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: onLabelChange,
        },
      })),
    [onLabelChange]
  );

  // connection start handler
  const onConnectStart = useCallback((_, { handleId, nodeId }) => {
    connectingHandleId.current = handleId;
    connectingNodeId.current = nodeId;
  }, []);

  // connect existing nodes
  const onConnect = useCallback(
    (params) => {
      if (!reactFlowWrapper.current) {
        console.error("reactFlowWrapper ref is not attached!");
        return;
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // connect + create new node
// connect + create new node
const onConnectEnd = useCallback(
  (event) => {
    const sourceHandle = connectingHandleId.current;
    const sourceNodeId = connectingNodeId.current;

    if (!sourceHandle || !sourceNodeId) return;

    const newNodeId = getId();
    const { clientX, clientY } =
      "changedTouches" in event ? event.changedTouches[0] : event;

    // ✅ FIX: use clientX/clientY directly (no subtracting bounds)
    let position = screenToFlowPosition({ x: clientX, y: clientY });

    // ✅ Optional: snap to grid (20px here)
    const snap = (val, gridSize = 20) => Math.round(val / gridSize) * gridSize;
    position = {
      x: snap(position.x),
      y: snap(position.y),
    };

    const targetHandle = getOppositeHandle(sourceHandle);

    const newNode = {
      id: newNodeId,
      position,
      data: { label: `Node ${newNodeId}`, onChange: onLabelChange },
      origin: [0.5, 0.0],
      snapToGrid: true,
      type: "custom",
    };

    setNodes((nds) => nds.concat(newNode));

    setEdges((eds) =>
      eds.concat({
        id: `e${Date.now()}`,
        source: sourceNodeId,
        sourceHandle,
        target: newNodeId,
        targetHandle,
        type: "straight",
      })
    );

    connectingHandleId.current = null;
    connectingNodeId.current = null;
  },
  [screenToFlowPosition, onLabelChange, setNodes, setEdges]
);


  // Save flow state with dummy POST request
  const saveFlow = useCallback(async () => {
    const flowData = {
      nodes: nodes.map(({ id, type, position, data }) => ({
        id,
        type,
        position,
        data: { label: data.label },
      })),
      edges: edges.map(
        ({ id, source, target, sourceHandle, targetHandle, type }) => ({
          id,
          source,
          target,
          sourceHandle,
          targetHandle,
          type,
        })
      ),
    };

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      alert("Flow saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save flow.");
    }
  }, [nodes, edges]);

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "visible",
        position: "relative",
        contain: "none",
      }}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeOrigin={[0.5, 0.5]}
        snapToGrid={true}
        snapGrid={[20, 20]}
        style={{ 
          overflow: "visible",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
        fitView
        fitViewOptions={{
          padding: 50,
          includeHiddenNodes: true,
          minZoom: 1.5,
          maxZoom: 3,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        // Add these props to fix coordinate space
        translateExtent={[[-2000, -2000], [2000, 2000]]}
        nodeExtent={[[-2000, -2000], [2000, 2000]]}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={false}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background />
        <MiniMap />
        <Controls />
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            zIndex: 1000,
          }}
        >
          <button onClick={saveFlow}>💾 Save</button>
        </div>
      </ReactFlow>
    </div>
  );
};

// --- Wrap Flow in ReactFlowProvider so context works ---
const FlowTree = ({ nodes, edges }) => (
  <div 
    className="flowtree-isolation-container"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      background: 'white',
      overflow: 'visible',
      contain: 'none',
    }}
  >
    <div 
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1001,
        background: 'rgba(255,255,255,0.9)',
        padding: '5px',
        borderRadius: '4px',
      }}
    >
      <button onClick={() => window.history.back()}>← Back</button>
    </div>
    <ReactFlowProvider>
      <Flow initialNodes={nodes} initialEdges={edges} />
    </ReactFlowProvider>
  </div>
);

export default FlowTree;