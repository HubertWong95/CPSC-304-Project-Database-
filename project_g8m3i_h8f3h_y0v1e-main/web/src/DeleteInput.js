import React, {useEffect, useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";


export default function DeleteInput() {
    const [specialization, setSpecialization] = useState('');
    const [data, setData] = useState('');
    // const [preDeleteData, setPreDeleteData] = useState([]);
    const columns = ["specialization", "department"];
    const [specializationList, setSpecializationList] = useState([]);

    const handleSpecializationChange = (e) => {
        setSpecialization(e.target.value);
    }

    const handleDelete = async (e) => {
        e.preventDefault();

        const requestBody = {
            specialization: specialization,
        }

        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }

        try {
            const response = await fetch('/delete-specialization', options);
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

    useEffect(() => {
        fetch("/staff2")
            .then((res) => res.json())
            .then((result) => {
                // setPreDeleteData(result.data);

                const specializations = result.data.map(arrayItem => arrayItem[0]);
                setSpecializationList(specializations);
            })
    }, []);



    return (
        <div className="DeleteInput">
            <h2> Remove a specialization (Deletion) </h2>
            {/*<div>*/}
            {/*    <ShowResultInTable columnsName={columns} data={preDeleteData} />*/}
            {/*</div>*/}
            <form onSubmit={handleDelete}>
                <select value = {specialization} onChange = {handleSpecializationChange}>
                    <option>  </option>
                    {specializationList && specializationList.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))
                    }
                </select>
                <button>
                    delete
                </button>
            </form>
            <p> {!data ?
                <p> Select the specialization to be deleted. Note that the staffs with the specified specialization will be deleted. </p> :
                data.success === false ?
                    data.message :
                    <div>
                        <p> Deletion is successful. The result is shown below. </p>
                        <h3>Staff in the park after the deletion of specialization: </h3>
                        <ShowResultInTable columnsName={columns} data={data} />
                    </div>}
            </p>
        </div>
    )

};
