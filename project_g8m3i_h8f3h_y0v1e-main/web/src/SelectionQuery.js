import React, {useEffect, useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";


export default function QueryInput() {
    //table chosen: Staff1(staffID, name, specialization, position)

    //{k:idx, val:text/select}
    const [data, setData] = useState({andOr:{}, columns:{}, values:{}});

    const ddlColNames = ['staffID', 'name', 'specialization', 'position'];
    const ddlAndOr = ['AND', 'OR'];
    const [andOr, setAndOr] = useState({});
    const [colName, setColName] = useState({});
    const [vals, setVals] = useState({});
    const [brackets, setBrackets] = useState({}); //{key:index, val:[cond1,cond2] where cond1<=cond2}


    const [noOfBrackets, setNoBrackets] = useState(0);
    //onSubmit: show 
    //set which table is selected

    const [noOfCond, setNoOfCond] = useState(1);
    const [listOfCond,setListOfCond] = useState([]);

    const [queryError, setQueryError] = useState("");


    useEffect(() => {
        let tmp = [...listOfCond]
        if (tmp.length < noOfCond) tmp.push(noOfCond);
        else tmp.pop();

        setListOfCond(tmp);

        let tmpBrackets = {...brackets};
        for (let i=0; i<noOfBrackets; i++) {
          for (let j=0; j<2; j++) {
            if (tmpBrackets[i+1][j] > noOfCond) {
              tmpBrackets[i+1][j] = noOfCond;
            } 
          }
        }
        setBrackets(tmpBrackets);

    }, [noOfCond])

		useEffect(() => {
			let tmp = {...brackets}
			if (Object.keys(tmp).length < noOfBrackets) {
				if (!Object.keys(tmp).includes(noOfBrackets)) {
					tmp[noOfBrackets] = [1,1]
				}
			}
				setBrackets(tmp);
		}, [noOfBrackets]);


    const handleAndOrChange = (e, idx) => {
        let val = e.target.value;
        console.log(val, idx);
        setAndOr((andOr) => {
            const newAndOr = {...andOr}
            newAndOr[idx] = val;
            return newAndOr;
        })
    };

    const handleColNameChange = (e,idx) => {
        let val = e.target.value;
        console.log(val, idx);
        setColName((colName) => {
            const newColName = {...colName}
            newColName[idx] = val;
            return newColName;
        })
    }

    const handleValChange = (e,idx) => {
        let val = e.target.value;
        //ensure not inputing () or other special char
        if(e.target.value.match("^[a-zA-Z0-9 ]*$")!=null) {
            console.log(val, idx);
            setVals((vals) => {
                const newVals = {...vals}
                newVals[idx] = val;
                return newVals;
            })
        }
    }

    const handleBracketsChange = (e, idx, j) => {
        let val = e.target.value;

        console.log(brackets, idx,j);
        console.log(brackets[1]);
        console.log(brackets[idx][0], brackets[idx][1]);
        setBrackets((brackets) => {
            const newbrackets = {...brackets}
            newbrackets[idx][j] = val;
            return newbrackets;
        })
    };

    const handleSelect = (e) => {
      //check empty colName / andOr

      for (let i=1; i<=noOfCond; i++) {
        if (colName[i] ===undefined ||colName[i] === "" || (i>1 && (andOr[i] === undefined || andOr[i] === ""))) {
          console.log("UNDEFINED", colName[i], andOr[i]);
          setQueryError(`Query columns/operators cannot be empty in condition #${i}.`);
          return;
        }

        //check if valid number for staffID
        if (colName[i] === 'staffID' && (vals[i] === undefined || vals[i].match(/^[0-9]*$/) === null)) {
          setQueryError(`staffID in condition #${i} is not a valid number.`);
          return;
        }

        if (vals[i] !== undefined && vals[i].length>100) {
          setQueryError(`value in condition #${i} is too long. Maximum length is 100.`);
          return;
        }
      }
      setQueryError("");
      //add bracket
      console.log(brackets);
      let openBracket = []
      let closeBracket = []
      Object.entries(brackets).map(([key, val],i) => {
        if (i<noOfBrackets && val[0] != val[1]) {
          
          openBracket.push(Math.min(val[0], val[1]));
          closeBracket.push(Math.max(val[0], val[1]));
        }
      });

      //concat string
      console.log(colName, vals, andOr);
      let queryString = "SELECT * FROM Staff1 WHERE ";
      for (let i=1; i<=noOfCond; i++) {
        if (i>1) queryString = queryString.concat(" " + andOr[i] + " ");
        //open bracket
        for (let j=0; j<openBracket.filter(x => x===i).length; j++) 
         queryString += "(";

        queryString = queryString.concat(colName[i] + "='" + (vals[i]===undefined ? "" : vals[i])+"'");
        //close bracket
        for (let j=0; j<closeBracket.filter(x => x===i).length; j++) 
         queryString += ")";
        
      }
      console.log(queryString);
      

      const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        accept: 'application/json',
        body: JSON.stringify({queryStr: queryString})
      };

      fetch(`/selection-query`, init)
        .then((res) => res.json())
        .then(res => {
          setData({
              ...data,
              projectionResult: res.data
          });
          return data;
        })
        .catch(e => {});

    };


    

    return (
        <div className="SelectionQuery">
        <h2>Selection Query</h2>
        <h4>Select from table Staff1 based on:</h4>
        <div>
					Number of conditions: {noOfCond}
					<button onClick={() => setNoOfCond(noOfCond+1)}> Add Conditions </button>
					{noOfCond>1 && <button onClick={() => setNoOfCond(noOfCond-1)}> Delete </button>}
        </div>
        <div>
            {listOfCond.map((idx) => (
                <div id={"cond"+idx} key={"cond"+idx}>
									<h3> Condition #{idx}</h3>
									{idx > 1 && 
										<select id={"ddlAndOr"+idx} value={andOr[idx] ?? ""} onChange={(e)=>handleAndOrChange(e,idx)}> 
												<option value=""></option>
												{ddlAndOr.map((r) => (
														<option key={r} value={r}>
																{r}
														</option>
												))}
										</select>
									}
									<select id={"ddlColName"+idx} value={colName[idx] ?? ""} onChange={(e)=>handleColNameChange(e,idx)}> 
										<option value=""></option>
										{ddlColNames.map((r) => (
												<option key={r} value={r}>
														{r}
												</option>
										))}
									</select>
									=
									<input id={"textboxVals"+idx} value={vals[idx] ?? ""} onChange={(e) => handleValChange(e,idx)} />
                </div>

            ))}
        </div>

        <div>
              Conditions to be evaluated first (if necessary):
              {noOfBrackets>0 && 
								Object.entries(brackets).map(([i,val],idx) => (
                  idx<noOfBrackets && 
									<div key={"bracket_"+idx}>
                  {/* Add brackets between conditions  */}
                  Between conditions
									<select id={"ddlBracket"+idx+"_1"} value={val[0] ?? ""} onChange={(e)=>handleBracketsChange(e,idx+1,0)}> 
										{listOfCond.map((r) => (
												<option key={r} value={r}>
														{r}
												</option>
										))}
									</select>
									and
									<select id={"ddlBracket"+idx+"_2"} value={val[1] ?? ""} onChange={(e)=>handleBracketsChange(e,idx+1,1)}> 
										{listOfCond.map((r) => (
												<option key={r} value={r}>
														{r}
												</option>
										))}
									</select>

								</div>
                  

								))
								
              }
              <button onClick={() => setNoBrackets(noOfBrackets+1)}> Add </button>    
              {noOfBrackets>0 && <button onClick={() => setNoBrackets(noOfBrackets-1)}> Delete </button>}              
        </div>
    
        <button onClick={handleSelect}>Select</button>
        {queryError!=="" ? <div>{queryError}</div> :

        <div> Selection Result: 
            {data.projectionResult?.length >= 0 && 
                <div>
                    <ShowResultInTable columnsName={ddlColNames} data={data.projectionResult} />
                </div>
                
            }
                
        </div>
        }
        </div>

    )

};
