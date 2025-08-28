import { useCallback, useRef, useEffect, useState } from "react";
//for back button functionality
import { useNavigate } from "react-router-dom";
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
import Header from "../header/Header";

// use my custom node types
const nodeTypes = { custom: CustomNode };

// --- Default nodes/edges for empty DB ---
const defaultNodes = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Me", onChange: () => {}, people: [] },
    type: "custom",
  },
];
const defaultEdges = [];

// dynamic id creation, to avoid bugs when a tree is loaded with existing nodes
const getMaxNodeId = (nodes) =>
  nodes.reduce((max, node) => {
    const match = node.id.match(/^n(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);

let idCounter = 0;
const getId = () => `n${++idCounter}`;

// --- Flow graph component ---
const Flow = ({ initialNodes, initialEdges, treeId, mongoId }) => {
  const reactFlowWrapper = useRef(null);
  const [people, setPeople] = useState([]);
  const navigate = useNavigate(); // <--- useNavigate hook

  // fetch people for dropdowns
  useEffect(() => {
    if (!mongoId) return;
    const fetchPeople = async () => {
      try {
        const res = await fetch(`http://localhost:5001/person?creator=${mongoId}`);
        if (!res.ok) throw new Error("Failed to fetch people");
        const data = await res.json();
        setPeople(data);
      } catch (err) {
        console.log("err", err);
      }
    };
    fetchPeople();
  }, [mongoId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes?.length
      ? initialNodes.map((n) => ({ ...n, data: { ...n.data, people } }))
      : defaultNodes.map((n) => ({ ...n, data: { ...n.data, people } }))
  );

  useEffect(() => {
    if (people.length === 0) return;
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, people },
      }))
    );
  }, [people, setNodes]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges?.length ? initialEdges : defaultEdges
  );

  const { screenToFlowPosition } = useReactFlow();
  idCounter = getMaxNodeId(nodes);

  const connectingHandleId = useRef(null);
  const connectingNodeId = useRef(null);

  const getOppositeHandle = (handleId) =>
    ({ top: "bottom", bottom: "top", left: "right", right: "left" }[handleId] || "top");

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
                  people: node.data.people,
                },
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const onConnectStart = useCallback((_, { handleId, nodeId }) => {
    connectingHandleId.current = handleId;
    connectingNodeId.current = nodeId;
  }, []);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, type: "straight" }, eds));
    },
    [setEdges]
  );

  const onConnectEnd = useCallback(
    (event) => {
      const sourceHandle = connectingHandleId.current;
      const sourceNodeId = connectingNodeId.current;

      if (!sourceHandle || !sourceNodeId || !nodes.some((n) => n.id === sourceNodeId)) {
        connectingHandleId.current = null;
        connectingNodeId.current = null;
        return;
      }

      const targetElement = document.elementFromPoint(event.clientX, event.clientY);
      if (targetElement?.classList.contains("react-flow__handle")) {
        connectingHandleId.current = null;
        connectingNodeId.current = null;
        return;
      }

      const newNodeId = getId();
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      let position = screenToFlowPosition({ x: clientX, y: clientY });
      const snap = (val, g = 20) => Math.round(val / g) * g;
      position = { x: snap(position.x), y: snap(position.y) };

      setNodes((nds) =>
        nds.concat({
          id: newNodeId,
          position,
          data: { label: `Node ${newNodeId}`, onChange: onLabelChange, people },
          type: "custom",
        })
      );

      setEdges((eds) =>
        eds.concat({
          id: `e${Date.now()}`,
          source: sourceNodeId,
          sourceHandle,
          target: newNodeId,
          targetHandle: getOppositeHandle(sourceHandle),
          type: "straight",
        })
      );

      connectingHandleId.current = null;
      connectingNodeId.current = null;
    },
    [nodes, screenToFlowPosition, onLabelChange, setNodes, setEdges, people]
  );

  const saveFlow = useCallback(async () => {
    if (!treeId) return;

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
      const res = await fetch(`http://localhost:5001/tree/${treeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flowData),
      });
      if (!res.ok) throw new Error(res.statusText);
      const updated = await res.json();
      setNodes(updated.nodes);
      setEdges(updated.edges);
      alert("Flow saved!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save flow.");
    }
  }, [nodes, edges, treeId]);

  const usedLabels = nodes.map((n) => n.data.label);

  const nodesWithFilteredPeople = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      people: people.filter(
        (p) =>
          !usedLabels.includes(`${p.firstName} ${p.lastName}`) ||
          `${p.firstName} ${p.lastName}` === n.data.label
      ),
    },
  }));

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodesWithFilteredPeople}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />

        {/* Save + Back Buttons */}
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
          <button
            onClick={() => {
              const proceed = window.confirm(
                "If you have made any unsaved changes, all edits will be lost. Continue?"
              );
              if (proceed) {
                navigate(-1); // go back in history
              }
            }}
            style={{
              cursor: "pointer",
              padding: "5px 10px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
            title="Go back"
          >
            ← Back
          </button>

          <button onClick={saveFlow}>💾 Save</button>
        </div>
      </ReactFlow>
    </div>
  );
};

// --- Wrapper ---
const FlowTree = ({ nodes, edges, treeId, mongoId }) => {
  if (!treeId) {
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
        background: "white",
      }}
    >
      <Header/>
      <ReactFlowProvider>
        <Flow initialNodes={nodes} initialEdges={edges} treeId={treeId} mongoId={mongoId} />
      </ReactFlowProvider>
    </div>
  
  );
};

export default FlowTree;
