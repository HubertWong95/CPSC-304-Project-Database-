import logo from './logo.svg';
import './App.css';
import React, {useState} from "react";
import ProjectQuery from "./ProjectQuery";
import InsertInput from "./InsertInput";
import SelectionQuery from "./SelectionQuery";
import DeleteInput from "./DeleteInput";
import DivisionQuery from "./DivisionQuery";
import NestedAggregationQuery from "./NestedAggregationQuery";
import UpdateQuery from "./UpdateQuery";
import {NavBar} from "./Utils";
import { Routes, Route } from 'react-router-dom';
import StaffForEventQuery from "./StaffForEventQuery";
import GroupCountQuery from "./GroupCountQuery";
import AgeAggregationQuery from "./AgeAggregationQuery";

function App() {
    const [data, setData] = React.useState(null);
    const [created, setCreated] = useState('');

    // check if backend can connect to db
    // also check if frontend can connect backend
    React.useEffect(() => {
        fetch("/check-db-connection")
          .then((res) => res.json())
          .then((data) => setData(data.message));
      }, []);

  return (
    <div className="App">
      <div className="Query">
            <Routes>
              <Route path="/" element={
                <>
                  <h3>Database Connection Status: {!data ? "Loading..." : data}</h3>
                  <NavBar />
                </>
                }></Route>
              <Route path="/projection" element={<ProjectQuery />} />
              <Route path="/insertion" element={<InsertInput />} />
              <Route path="/update" element={<UpdateQuery />} />
              <Route path="/selection" element={<SelectionQuery />} />
              <Route path="/deletion" element={<DeleteInput />} />
              <Route path="/division" element={<DivisionQuery />} />
              <Route path="/nested-aggregation" element={<NestedAggregationQuery />} />
              <Route path="/join" element={<StaffForEventQuery />} />
              <Route path="/group-by-aggregation" element={<GroupCountQuery />} />
              <Route path="/having-aggregation" element={<AgeAggregationQuery />} />
            </Routes> 
            
            
      </div>
    </div>
  );
}

export default App;
