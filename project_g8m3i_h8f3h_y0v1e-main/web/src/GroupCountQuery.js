import React, { useState } from 'react';

function GroupCountQuery() {
    const [group, setGroup] = useState('');
    const [counts, setCounts] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Submitting "Count Staff" request with group: ${group}`);

        const init = {
            method: 'GET',
            accept: 'application/json'
        };

        const response = await fetch(`/staff-count-by-group?group=${group}`, init);
        const data = await response.json();
        console.log(`Receiving "Count Staff" result: `, data.data);
        if (data.success) {
            setCounts(data.data);
        } else {
            alert(data.message);
            setCounts([]);
        }
    };

    return (
        <div>
            <h2>Staff Count (Group By)</h2>
            <p>Description: Counts the number of staff members, grouping them by either specialization or position,
            as selected from the dropdown menu</p>
            <select value={group} onChange={(e) => {
                setGroup(e.target.value);
                if (e.target.value === "") {
                    setCounts([]);
                }
            }}>
                <option value=""></option>
                <option value="specialization">Specialization</option>
                <option value="position">Position</option>
            </select>

            {group && (
                <>
                    <button onClick={handleSubmit}>Submit</button>

                    {counts.length > 0 && (
                      <table>
                        <thead>
                          <tr>
                            <th>{group.charAt(0).toUpperCase() + group.slice(1)}</th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {counts.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td>{row[0]}</td>
                              <td>{row[1]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </>
            )}
        </div>
    );
}

export default GroupCountQuery;