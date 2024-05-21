import React, {useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";
import {sanitizeInput} from "./Utils";


export default function InsertInput() {
    const [staffID, setStaffID] = useState(0);
    const [staffName, setStaffName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [position, setPosition] = useState('');
    const [data, setData] = useState('');
    const columns = ["staffID", "name", "specialization", "position"];

    const handleStaffIDChange = (e) => {
        setStaffID(e.target.value);
    }

    const handleStaffNameChange = (e) => {
        setStaffName(e.target.value);
    }

    const handleSpecializationChange = (e) => {
        setSpecialization(e.target.value);
    }

    const handlePositionChange = (e) => {
        setPosition(e.target.value);
    }

    const handleInsert = async (e) => {
        e.preventDefault();

        if (!sanitizeInput(staffName)) {
            alert("Only alphanumeric characters (i.e. a-z, A-Z, 0-9) and space characters are allowed in staff name.");
            return;
        }

        if (!sanitizeInput(specialization)) {
            alert("Only alphanumeric characters (i.e. a-z, A-Z, 0-9) and space characters are allowed in specialization.");
            return;
        }

        if (!sanitizeInput(position)) {
            alert("Only alphanumeric characters (i.e. a-z, A-Z, 0-9) and space characters are allowed in position.");
            return;
        }

        const requestBody = {
            staffID: staffID,
            staffName: staffName,
            specialization: specialization,
            position: position
        }

        console.log(requestBody);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }

        try {
            const response = await fetch('/insert-staff', options);
            const result = await response.json();
            if (response.status !== 200) {
                alert(result.data.message);
            } else {
                setData(result.data.tableData);
            }
        } catch (e) {
            alert(e.message);
        }
    }


    return (
        <div className="InsertInput">
            <h2> Adding a new Staff </h2>
            <form onSubmit={handleInsert}>
                <label>
                    <input type = "number" name = "staffID" min = "0" value={staffID} onChange={handleStaffIDChange}/>
                </label>
                <label>
                    <input type = "text" name = "staffName" value={staffName} placeholder="name" onChange={handleStaffNameChange}/>
                </label>
                <label>
                    <input type = "text" name = "specialization" value={specialization} placeholder="specialization" onChange={handleSpecializationChange}/>
                </label>
                <label>
                    <input type = "text" name = "position" value={position} placeholder="position" onChange={handlePositionChange}/>
                </label>
                <button>
                    insert
                </button>
            </form>
            <p> {!data ?
                <p>Input the values for adding a new staff in the park.</p> :
                data.success === false ?
                    data.message :
                    <div>
                        <p> Insertions is successful. </p>
                        <p> All staff in the park </p>
                        <ShowResultInTable columnsName={columns} data={data} />
                    </div>}
            </p>
        </div>
    )

};
