import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import FlowTree  from "../components/ReactFlowTree/FlowTree";

const MyTree = () => {
  const { user } = useUser();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mongoId, setMongoId] = useState("");

  useEffect(() => {
    // clerk id to get user's mongoId to reference the tree then load it
    const fetchMongoUserId = async () => {
      const res = await fetch(`http://localhost:3000/user/${user.id}`);
      const data = await res.json();
      setMongoId(data._id);
console.log("Mongo user data:", data);

      // we got the mongoId so now let's use it to load tree
      fetchTree(data._id);
    };

    // fetch tree data using mongoId
    const fetchTree = async (mongoId) => {
      try {
         console.log("Fetching tree for Mongo ID:", mongoId);
        const res = await fetch(`http://localhost:3000/tree/${mongoId}`);
        if (!res.ok) throw new Error("No tree found");

        const data = await res.json();
         console.log("Tree data:", data);
        setTreeData({nodes: data.nodes || [], edges: data.edges || []}); 
        
      } catch (error) {
        console.log("No existing tree. Prompt to create one.");
        setTreeData(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchMongoUserId();
  }, [user]);

  return (
    <>
      <Header />
      <br /><br />
      <h1>My Tree</h1>

      {loading ? (
        <p>Loading your tree...</p>
      ) : treeData ? (
        <div style={{ width: "100%", height: "80vh" }}>
          <FlowTree nodes={treeData.nodes} edges={treeData.edges} />
        </div>
      ) : (
        <div>
          <p>You don't have a tree yet.</p>
          <Link to="/person" className="btn btn-warning">
            Create First Person
          </Link>
        </div>
      )}

      <br /><br />
      <Footer />
    </>
  );
};

export default MyTree;
