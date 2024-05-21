import React, { useState } from 'react';

export default function StaffForEventQuery() {
    const [eventID, setEventID] = useState('');
    const [results, setResults] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Submitting "Find Staff" request with eventID: ${eventID}`);

        const init = {
            method: 'GET',
            accept: 'application/json'
        };

        const response = await fetch(`/fetch-staff-with-eventID?eventID=${eventID}`, init);
        const data = await response.json();
        console.log(`Receiving "Find Staff" result: `, data.data);
        if (data.success) {
            setResults(data.data);
        } else {
            alert(data.message);
            setResults([]);
        }
    };

    return (
        <div>
            <h2>Find Staff by Event (Join)</h2>
            <p>Description: Please enter an EventID to find the staff responsible for that event,
            based on the join between Staff1 and Event1 tables.</p>
            <label>
                Event ID:
                <input type="number" value={eventID} onChange={e => setEventID(e.target.value)} required />
            </label>
            <button onClick={handleSubmit}>Submit</button>

            {results.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Staff ID</th>
                            <th>Name</th>
                            <th>Specialization</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(row => (
                            <tr key={row[0]}>
                                {row.map((item, index) => (
                                    <td key={index}>{item}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}