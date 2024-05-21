import React, {useEffect, useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";


export default function NestedAggregationQuery() {
    const [group, setGroup] = useState('');
    const [count, setCount] = useState(0);
    const [data, setData] = useState('');
    const columns = [group, "AVERAGE AGE"];
    const groups = ["SPECIES", "NAME", "CLASS", "SUN EXPOSURE", "HABITAT NAME"];

    const handleGroupChange = (e) => {
        setGroup(e.target.value);
    }

    const handleCountChange = (e) => {
        setCount(e.target.value);
    }

    const handleQuery = async (e) => {
        e.preventDefault();

        let formattedGroup = group;

        if (group === "SUN EXPOSURE") {
            formattedGroup = "SUNEXPOSURE";
        } else if (group === "HABITAT NAME") {
            formattedGroup = "HABITATNAME";
        }

        const url = "/get-average-age-of-group-over-count/" + formattedGroup + "/" + count;

        try {
            const response = await fetch(url);
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
        <div className="NestedAggregationQuery">
            <h2> Finding the average age group by the selected choice with more than n creatures in the park</h2>
            <form onSubmit={handleQuery}>
                <select value = {group} onChange = {handleGroupChange}>
                    <option>  </option>
                    {groups.map((group) => (
                        <option key={group} value={group}>
                            {group}
                        </option>
                    ))
                    }
                </select>
                <label>
                    <input type = "number" name = "count" min = "0" value={count} onChange={handleCountChange}/>
                </label>
                <button>
                    query
                </button>
            </form>
            <p> {!data ?
                <p> Select the group and the count from above. </p> :
                data.success === false ?
                    data.message :
                    <div>
                        <h3>Average age of creatures satisfying the requirements: </h3>
                        <ShowResultInTable columnsName={columns} data={data} />
                    </div>}
            </p>
        </div>
    )

};
