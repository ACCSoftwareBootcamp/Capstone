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
    onChange: () => {}, // Placeholder
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

/* 
  purpose-dynamic id creation, to avoid bugs when a tree is loaded
  - finds the highest numeric node ID in the current set
  - ensures new nodes always increment from the max id
*/
const getMaxNodeId = (nodes) => {
  return nodes.reduce((max, node) => {
    const match = node.id.match(/^n(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);
};

let idCounter = 0;
const getId = () => `n${++idCounter}`;

// --- Flow component (renders the graph) ---
const Flow = ({ initialNodes, initialEdges, treeId }) => {
  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes?.length ? initialNodes : defaultNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges?.length ? initialEdges : defaultEdges
  );

  const { screenToFlowPosition } = useReactFlow();

  // 🔹 reset idCounter when nodes are initialized
  idCounter = getMaxNodeId(nodes);

  const connectingHandleId = useRef(null);
  const connectingNodeId = useRef(null);
  const isCreatingNode = useRef(false);

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

  // connection start handler
  const onConnectStart = useCallback((_, { handleId, nodeId }) => {
    connectingHandleId.current = handleId;
    connectingNodeId.current = nodeId;
    isCreatingNode.current = true; // mark potential node creation
  }, []);

  // connect existing nodes
  const onConnect = useCallback(
    (params) => {
      if (isCreatingNode.current) {
        // suppress default connect while creating a new node
        return;
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // connect + create new node
  const onConnectEnd = useCallback(
    (event) => {
      if (!isCreatingNode.current) return;

      const sourceHandle = connectingHandleId.current;
      const sourceNodeId = connectingNodeId.current;

      // sanity check: ensure source node still exists
      const sourceNodeExists = nodes.some((n) => n.id === sourceNodeId);
      if (!sourceHandle || !sourceNodeId || !sourceNodeExists) {
        connectingHandleId.current = null;
        connectingNodeId.current = null;
        isCreatingNode.current = false;
        return;
      }

      const newNodeId = getId();
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      let position = screenToFlowPosition({ x: clientX, y: clientY });
      const snap = (val, gridSize = 20) => Math.round(val / gridSize) * gridSize;
      position = { x: snap(position.x), y: snap(position.y) };

      const targetHandle = getOppositeHandle(sourceHandle);

      const newNode = {
        id: newNodeId,
        position,
        data: { label: `Node ${newNodeId}`, onChange: onLabelChange },
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

      // reset refs
      connectingHandleId.current = null;
      connectingNodeId.current = null;
      isCreatingNode.current = false;
    },
    [nodes, screenToFlowPosition, onLabelChange, setNodes, setEdges]
  );

  // Save flow state with updated nodes/edges to backend
  const saveFlow = useCallback(async () => {
    if (!treeId) {
      alert("Error: Tree ID is undefined.");
      return;
    }

    const flowData = {
      nodes: nodes.map(({ id, type, position, data }) => ({
        id,
        type,
        position,
        data: { label: data.label },
      })),
      edges: edges.map(({ id, source, target, sourceHandle, targetHandle, type }) => ({
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
        type,
      })),
    };

    try {
      const response = await fetch(`http://localhost:5000/tree/${treeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const updatedTree = await response.json();
      setNodes(updatedTree.nodes);
      setEdges(updatedTree.edges);

      alert("Flow saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save flow.");
    }
  }, [nodes, edges, treeId]);

  const saveRef = useRef(saveFlow);
  saveRef.current = saveFlow;

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
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 50, includeHiddenNodes: true, minZoom: 1.5, maxZoom: 3 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        translateExtent={[[-2000, -2000], [2000, 2000]]}
        nodeExtent={[[-2000, -2000], [2000, 2000]]}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        preventScrolling={false}
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Background />
        <MiniMap />
        <Controls />
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1001,
            background: "rgba(255,255,255,0.9)",
            padding: "5px",
            borderRadius: "4px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button onClick={() => saveRef.current?.()}>💾 Save</button>
          <button onClick={() => window.history.back()}>← Back</button>
        </div>
      </ReactFlow>
    </div>
  );
};

// --- Wrap Flow in ReactFlowProvider ---
const FlowTree = ({ nodes, edges, treeId }) => {
  if (!treeId) {
    console.error("Tree ID is missing or undefined.");
    alert("Tree ID is missing! Unable to save flow.");
    return null;
  }

  return (
    <div
      className="flowtree-isolation-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: "white",
        overflow: "visible",
        contain: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1001,
          background: "rgba(255,255,255,0.9)",
          padding: "5px",
          borderRadius: "4px",
        }}
      >
        <button onClick={() => window.history.back()}>← Back</button>
      </div>
      <ReactFlowProvider>
        <Flow initialNodes={nodes} initialEdges={edges} treeId={treeId} />
      </ReactFlowProvider>
    </div>
  );
};

export default FlowTree;
