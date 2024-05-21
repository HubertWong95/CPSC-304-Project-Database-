import React from "react";
import { Link } from 'react-router-dom';


// reference: https://www.w3schools.com/js/js_regexp.asp
export function sanitizeInput(str) {
    const regex = /[^a-zA-Z0-9 ]/;
    return !regex.test(str);
}

export function NavBar() {
    return (
    <nav>
        <ul>
           <li>
              <Link to="/">Home</Link>
           </li>
           <li>
              <Link to="/projection">Projection Query</Link>
           </li>
           <li>
              <Link to="/insertion">Insertion Query</Link>
           </li>
           <li>
              <Link to="/update">Update Query</Link>
           </li>
           <li>
              <Link to="/selection">Selection Query</Link>
           </li>
           <li>
              <Link to="/deletion">Deletion Query</Link>
           </li>
           <li>
              <Link to="/division">Division Query</Link>
           </li>
           <li>
              <Link to="/nested-aggregation">Nested Aggregation Query</Link>
           </li>
           <li>
              <Link to="/join">Join Query</Link>
           </li>
           <li>
              <Link to="/group-by-aggregation">Aggregation (Group By) Query</Link>
           </li>
           <li>
              <Link to="/having-aggregation">Aggregation (Having) Query</Link>
           </li>
        </ul>
    </nav>
    );
}