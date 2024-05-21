import React, {useEffect, useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";
import {sanitizeInput} from "./Utils";


/*
    Update tuples in table Staff1

    Show all tuples in Staff1
    let user choose which tuples to update (dropbox: staffID)
    populate a form like insertion
*/

export default function UpdateQuery() {
    const tableName = 'Staff1';
    const columnsInStaff1 = ['staffID', 'name', 'specialization', 'position'];
    const [data, setData] = useState({});
    const [specializationsDdl, setSpecializationsDdl] = useState([]);

    useEffect(() => {
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            accept: 'application/json',
            body: JSON.stringify({
                tableName: tableName,
                selectedColumns: columnsInStaff1
            })
        };
        fetch(`/fetch-table-projection`, init)
            .then((res) => res.json())
            .then(res => {
                setData({
                    ...data,
                    projectionResult: res.data
                });
                return data;
            })
        fetch("/staff2")
            .then((res) => res.json())
            .then((result) => {
                setSpecializationsDdl(result.data.map(arrayItem => arrayItem[0]));
            })


    }, [])

    const handleStaffIdChange = (e) => {
        const val = e.target.value;
        let row = []
        data.projectionResult.map((r) => {
            if (r[0]==val) {
                row = r;
            }
        })
        setData({
            ...data,
            selectedStaffId: val,
            staffName: row[1],
            specialization: row[2],
            position: row[3]
        })
    }

    const handleDataChange = (e, colName) => {
        const val = e.target.value
        if (colName === 'name') {
            setData({
                ...data,
                staffName: val
            })
        } else if (colName === 'specialization') {
            setData({
                ...data,
                specialization: val,
            })
        } else if (colName === 'position') {
            setData({
                ...data,
                position: val,
            })
        }
    }

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!sanitizeInput(data.staffName)) {
            alert("Only alphanumeric characters (i.e. a-z, A-Z, 0-9) and space characters are allowed in staff name.");
            return;
        }

        if (!sanitizeInput(data.specialization)) {
            alert("Only alphanumeric characters (i.e. a-z, A-Z, 0-9) and space characters are allowed in specialization.");
            return;
        }

        if (!sanitizeInput(data.position)) {
            alert("Only alphanumeric characters (i.e. a-z, A-Z, 0-9) and space characters are allowed in position.");
            return;
        }
        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            accept: 'application/json',
            body: JSON.stringify({
                staffId: data.selectedStaffId,
                staffName: data.staffName,
                specialization: data.specialization,
                position: data.position
            })
        };

        fetch(`/update-query-staff1`, init)
        .then((res) => res.json())
        .then(res => {
            alert(res.message);
            if (res.success === true) {
                setData({
                    ...data,
                    selectedStaffId: ""
                })
                window.location.reload();
            }
        })
        .catch(e => {alert(e.message);});

    }

    return (
        <div>
        <h2> Update a Staff (Update Query) </h2>
            {data.projectionResult?.length > 0 && 
                <div>
                    <ShowResultInTable columnsName={columnsInStaff1} data={data.projectionResult} />
                    Select the StaffId that you would like to update their details:
                    
                        <select id="ddlStaffId" value={data.selectedStaffId ?? ""} onChange={handleStaffIdChange}>
                            <option value=""></option>
                            {data.projectionResult.map((row, idx) => (
                                <option key={row[0]} id={row[0]}>
                                    {row[0]}
                                </option>
                            ))}

                        </select>
                    {data.selectedStaffId !== undefined && data.selectedStaffId !== "" &&
                    <form onSubmit={handleUpdate}>
                        <label>
                            StaffID: {data.selectedStaffId}
                        </label>
                        <label>
                            <input type="text" name="staffName" value={data.staffName??""} placeholder="New Name" onChange={(e) => handleDataChange(e,"name")}/>
                        </label>
                        <label>
                        <select value = {data.specialization??""} onChange = {e => handleDataChange(e,"specialization")}>
                            <option value="" disabled>Select New Specialization</option>
                                {specializationsDdl?.length > 0 && specializationsDdl.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))
                            }
                            </select>
                        </label>
                        <label>
                            <input type="text" name="position" value={data.position??""} placeholder="New Position" onChange={(e) => handleDataChange(e,"position")}/>
                        </label>
                        <button>
                            Update
                        </button>
                    </form>

                    }
                </div>

                
            }

        </div>

    )

}
