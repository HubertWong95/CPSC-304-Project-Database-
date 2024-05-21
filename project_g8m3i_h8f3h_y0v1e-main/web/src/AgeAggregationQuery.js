import React, { useState } from 'react';

function AgeAggregationQuery() {
    const [aggregationType, setAggregationType] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Submitting "Aggregate Visitor Age" request with type: ${aggregationType}`);

        const init = {
            method: 'GET',
            accept: 'application/json'
        };

        const response = await fetch(`/aggregate-visitor-age?type=${aggregationType}`, init);
        const data = await response.json();
        console.log(`Receiving "Aggregate Visitor Age" result: `, data.data);
        if (data.success) {
            setResult(data.data);
        } else {
            alert(data.message);
            setResult(null);
        }
    };

    return (
        <div>
            <h2>Aggregate Multiple Visitor Ages Per Ticket Type (Having)</h2>
            <p>Description: Aggregate the ages of more than two visitors per ticket type,
             based on the selected aggregation method</p>
            <select value={aggregationType} onChange={(e) => {
                setAggregationType(e.target.value);
                if (e.target.value === "") {
                    setResult(null);
                }
            }}>
                <option value=""></option>
                <option value="max">Maximum</option>
                <option value="min">Minimum</option>
                <option value="avg">Average</option>
            </select>

            {aggregationType && (
                <>
                    <button onClick={handleSubmit}>Submit</button>

                    {result && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Ticket Type</th>
                                    <th>Age</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.map((row, index) => (
                                    <tr key={index}>
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

export default AgeAggregationQuery;