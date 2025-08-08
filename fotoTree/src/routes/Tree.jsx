import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MyTree = () => {
  //boolean if the have a tree show it, if not...let them get started
  const { hasTree, setHasTree } = useState(false);
  //initializing empty treeObj.
  const { treeObject, setTreeObject } = useState({});

  return (

     // display treeObject if there OR if not let's get started! 
    <>
      <h1>MyTree:</h1>
     
 <div>   {treeObject ||
 
(
  <>
    <p>You don't have a tree yet</p>
    <Link to="/person" className='btn btn-warning'>Create First Person</Link>
  </>
) } 

 </div>
    </>
  );
};

export default MyTree;
