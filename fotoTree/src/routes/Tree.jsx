import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import FlowTree from "../components/ReactFlowTree/FlowTree";

const MyTree = () => {
  const { user } = useUser();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mongoId, setMongoId] = useState("");

  useEffect(() => {
    // clerk id to get user's mongoId to reference the tree then load it
    const fetchMongoUserId = async () => {
      const res = await fetch(`http://localhost:5001/user/${user.id}`);
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
    const res = await fetch(`http://localhost:5001/tree/${mongoId}`);
    if (!res.ok) throw new Error("No tree found");

    const data = await res.json();
    console.log("Tree data:", data);

    // Make sure to pass the tree ID as part of the treeData object
    setTreeData({
      _id: data._id, // This ensures the tree ID is available to FlowTree
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
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
    <div className="treePageWrapper"> {/* Add tree-page class */}
      {loading ? (
        <div> {/* Use constrained container for loading */}
          <Header />
          <br />
          <br />
          <h1>My Tree</h1>
          <p>Loading your tree...</p>
          <Footer />
        </div>
      ) : treeData ? (
        /* Full viewport for tree display */
   <>
        <FlowTree nodes={treeData.nodes} edges={treeData.edges} treeId={treeData._id} mongoId={mongoId}/>
  </>
      ) : (
        <div > 
          <Header />
          <br />
          <br />
          <h1>My Tree</h1>
          <div>
            <p>You don't have a tree yet.</p>
            <Link to="/person">
              Create First Person
            </Link>
          </div>
          <br />
          <br />
          <Footer />
        </div>
      )}
    </div>
  );
};

export default MyTree;