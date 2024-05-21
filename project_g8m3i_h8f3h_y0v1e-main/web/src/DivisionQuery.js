import React, {useEffect, useState} from 'react';
import ShowResultInTable from "./ShowResultInTable";


export default function DivisionQuery() {
    const [year, setYear] = useState(0);
    const [month, setMonth] = useState(0);
    const [day, setDay] = useState(0);
    const [data, setData] = useState('');
    const columns = ["ticketID"];

    const handleYearChange = (e) => {
        setYear(e.target.value);
    }

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    }

    const handleDayChange = (e) => {
        setDay(e.target.value);
    }

    const handleQuery = async (e) => {
        e.preventDefault();

        const formattedMonth = month.toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');
        const date = `${year}-${formattedMonth}-${formattedDay}`;

        const url = "/get-all-visitors-joining-promotion-events/" + date;

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
        <div className="DivisionQuery">
            <h2> Finding all visitors participating in all promotion events on the designated date.  </h2>
            <form onSubmit={handleQuery}>
                <label>
                    <input type = "number" name = "year" min = "2020" max = "2024" value={year} onChange={handleYearChange}/>
                </label>
                <label>
                    <input type = "number" name = "month" min = "01" max = "12" value={month} onChange={handleMonthChange}/>
                </label>
                <label>
                    <input type = "number" name = "day" min = "01" max = "31" value={day} onChange={handleDayChange}/>
                </label>
                <button>
                    query
                </button>
            </form>
            <p> {!data ?
                <p> Select the year, day and month above. </p> :
                data.success === false ?
                    data.message :
                    <div>
                        <h3> Ticket IDs of visitors who participate in all promotional events on the selected date: </h3>
                        <ShowResultInTable columnsName={columns} data={data} />
                    </div>}
            </p>
        </div>
    )

};
