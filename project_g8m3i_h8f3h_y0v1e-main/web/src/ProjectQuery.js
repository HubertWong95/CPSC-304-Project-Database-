import React, {useEffect, useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";

export default function QueryInput() {
    const [data, setData] = useState({selectedColumns:[]});

    //fetch all available columns

    //onSubmit: show 
    //set which table is selected
    const [tables, setTables] = useState([]); 
    const [columns, setColumns] = useState([]); 

    const handleTableChange = (e) => {
        setData({
            ...data,
            selectedColumns: [],
            selectedTable: e.target.value
        });
        
        const init = {
            method: 'GET',
            accept: 'application/json'
        };
        fetch(`/fetch-table-columns?table=${e.target.value}`, init)
            .then((res) => res.json())
            .then(d => {
                let colList = []
                d.data.map((arrayItem) => {
                    colList.push(arrayItem[0]);
                });
                setColumns(colList);
            });

    }

    const handleCheckboxChange = (e) => {
        if (data.selectedColumns.includes(e.target.value)) {
            setData({
                ...data,
                selectedColumns: data.selectedColumns.filter(item => item !== e.target.value)
            });
        
        } else {
        setData({
            ...data,
            selectedColumns: [...data.selectedColumns, e.target.value]
        });
        }
    }

    const onClickProject = (e) => {
        e.preventDefault();

        if (data.selectedColumns.length === 0)
            return;

        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            accept: 'application/json',
            body: JSON.stringify({
                tableName: data.selectedTable,
                selectedColumns: data.selectedColumns
            })
        };
        fetch(`/fetch-table-projection`, init)
            .then((res) => res.json())
            .then(res => {
                setData({
                    ...data,
                    projectionColumns: data.selectedColumns,
                    projectionResult: res.data
                });
                return data;
            })


    };

    
    useEffect(() => {
        fetch("/fetch-tables")
          .then((res) => res.json())
          .then(d => {
            let tableList = []
            d.data.map((arrayItem) => {
                tableList.push(arrayItem[0]);
            });
            setTables(tableList);
          })
      }, []);
      

    return (
        <div className="Query">
        <h2>Projection Query</h2>
        <p>Table: 
            <select id="ddlTable" value={data.selectedTable ?? ""} onChange={handleTableChange}>
                <option value=""></option>
                {tables.map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
        </p>
        <p> Columns to project: (To be shown after choosing table)
        </p>
            {columns.length > 0 &&
            <div>
                {columns.map((col) => (
                    <label key={col}>
                        <input
                            type="checkbox"
                            value = {col}
                            checked = {data.selectedColumns.includes(col) === true}
                            onChange = {handleCheckboxChange}
                        />
                        {col}
                    </label>
                ))}
                <button onClick={onClickProject}> Project </button>
                {data.selectedColumns.length === 0 && <div>Please select at least 1 column to project.</div>}
                {}
            </div>
            }
    
        <div> Projection Result: 
            {data.projectionResult?.length > 0 && 
                <div>
                    <ShowResultInTable columnsName={data.projectionColumns} data={data.projectionResult} />
                </div>
                
            }
                
        </div>
        </div>

    )

};
