import React from 'react';
import './ShowResultInTable.css';


//to show query result in a table,
//PARAM:    columnsName:array of name of columns
//          data: a 2D array, array of entries(each entry is a array)
//          isUpdate: boolean indicated if it is in update mode (for Update query)
//PRE: columnsName should have same order with each row of data
export default function ShowResultInTable(props) {
    let columnsName = props.columnsName;
    let data = props.data;

    return (
        <table>
            <thead>
                <tr>
                    {columnsName.map((c) => (
                        <th key={c}>{c}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.length > 0 && 
                    data.map((row, idx) => (
                        <tr key={row[0]}>
                            {row.map((item) => (
                                <td key={item}>{item}</td>
                            ))}
                        </tr>
                    ))
                }       
            </tbody>

        

        </table>
    );

};