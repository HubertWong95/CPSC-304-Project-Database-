const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

/*
    Projection
*/
async function fetchDbTable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT table_name FROM user_tables');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchTableColumns(tableName) {

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT column_name FROM USER_TAB_COLUMNS WHERE table_name=:tableName`, [tableName]);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchTableProjection(tableName, columnNames) {

    columnNamesStr = columnNames.join(', ');
    console.log(tableName, columnNamesStr);
    console.log(`SELECT ${columnNamesStr} FROM ${tableName}`);
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT ${columnNamesStr} FROM ${tableName}`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

/*
    Insertion
    if the specialization exists in Staff1, insert into Staff2 Table
    else, reject the insertion
 */
async function insertStaff2Table(staffID, staffName, specialization, position) {
    return await withOracleDB(async (connection) => {
        const primaryKeyCheckQuery = `SELECT COUNT(*) FROM Staff1 WHERE staffID = :staffID`
        console.log(primaryKeyCheckQuery + " = " + staffID);
        const primaryKeyCount = await connection.execute(primaryKeyCheckQuery, [staffID]);
        if (primaryKeyCount.rows[0][0] > 0) {
            return { message: "The staff with the same staffID already exists. Only new staffID are accepted. ", rowsAffected: 0, tableData: [] };
        }

        const specializationCheckQuery = `SELECT COUNT(*) FROM Staff2 WHERE specialization = :specialization`;
        console.log(specializationCheckQuery + " = " + specialization);
        const specializationCount = await connection.execute(specializationCheckQuery, [specialization]);

        if (specializationCount.rows[0][0] === 0) {
            return { message: "Specialization specified does not exist in Staff2.", rowsAffected: 0, tableData: [] };
        }

        const insertQuery = `INSERT INTO Staff1 (staffID, name, specialization, position)
                             VALUES (:staffID, :staffName, :specialization, :position)`;
        console.log("EXECUTING: " + insertQuery + "staffID, staffName, specialization, position: " + staffID + ", " + staffName + ", " + specialization + ", " + position);
        const result = await connection.execute(insertQuery, [staffID, staffName, specialization, position], { autoCommit: true });

        // console.log(result);

        if (result.rowsAffected > 0) {
            const selectAllQuery = `SELECT * FROM Staff1 ORDER BY staffID`;
            const tableDataResult = await connection.execute(selectAllQuery, {});
            return {
                message: "Insert successful.",
                rowsAffected: result.rowsAffected,
                tableData: tableDataResult.rows
            };
        } else {
            return { message: "Insert failed.", rowsAffected: 0, tableData: [] };
        }
    }).catch((error) => {
    console.log(error.message);
    return { message: `An error occurred during insertion: ${error.message}`, rowsAffected: 0, tableData: [] };
    });
}

/*
    Deletion
 */

async function fetchStaff2FromDb() {
    return await withOracleDB(async (connection) => {
        const selectAllQuery = `SELECT * FROM Staff2`;
        console.log("EXECUTING: " + selectAllQuery);
        const tableDataResult = await connection.execute(selectAllQuery);
        return tableDataResult.rows;
    }).catch((error) => {
        console.log(error);
        return [];
    });
}

async function deleteStaff2Tuple(specialization) {
    return await withOracleDB(async (connection) => {
        console.log(`DELETE FROM Staff2
                     WHERE specialization = ${specialization}`);
        const deleteQuery = `DELETE FROM Staff2
                     WHERE specialization = :specialization`;
        const result = await connection.execute(deleteQuery, [specialization], {autoCommit: true});

        // console.log(result);
        if (result.rowsAffected > 0) {
            const selectAllQuery = `SELECT * FROM Staff2`;
            const tableDataResult = await connection.execute(selectAllQuery);
            return {
                message: "Delete successful.",
                rowsAffected: result.rowsAffected,
                tableData: tableDataResult.rows
            };
        } else {
            return { message: "Delete failed.", rowsAffected: 0, tableData: [] };
        }
    }).catch((error) => {
        console.log(error.message);
        return { message: `An error occurred during deletion: ${error.message}`, rowsAffected: 0, tableData: [] };
    });
}

/*
    Division
    find all visitors who have joined fundraising events on the given date
 */
async function findVisitorsJoiningAllPromotionOnCertainDate(date) {
    const startTime = date + " 10:00:00.00";
    const endTime = date + " 19:30:00.00";

    return await withOracleDB(async (connection) => {
        const divisionQuery =
            `SELECT V1.TICKETID FROM VISITOR1 V1
                   WHERE NOT EXISTS(
                       (SELECT E1.EVENTID
                        FROM EVENT1 E1
                        WHERE E1.STARTTIME >= TO_TIMESTAMP(:startTime, 'YYYY-MM-DD HH24:MI:SS.FF') AND
                              E1.ENDTIME <= TO_TIMESTAMP(:endTime, 'YYYY-MM-DD HH24:MI:SS.FF') AND
                              (E1.EVENTTYPE = 'promotion'))
                        MINUS
                        (SELECT J.EVENTID FROM JOINS J
                        WHERE J.TICKETID = V1.TICKETID))
                        ORDER BY V1.TICKETID`;

        console.log("EXECUTING: " + divisionQuery + "startTime: " + startTime + "endTime: " + endTime);

        const result = await connection.execute(divisionQuery, [startTime, endTime]);

        // console.log(result);

        return {
            message: "Query successful.",
            success: true,
            tableData: result.rows
        }
    }).catch((error) => {
        console.log(error.message);
        return { message: `An error occurred during querying: ${error.message}`, success: false, tableData: [] };
    });
}

/*
    Nested Aggregation
 */
async function findAverageAgeOfCertainGroupWithCertainCount(group, count) {
    return await withOracleDB(async (connection) => {
        const nestedAggregationQuery =
            `SELECT C1.${group}, AVG(C1.AGE) AS average_age FROM CREATURESLIVESIN C1
             GROUP BY C1.${group}
             HAVING :count < (SELECT COUNT(*) FROM CREATURESLIVESIN C2
                         WHERE C1.${group} = C2.${group})`;

        console.log("EXECUTING: " + nestedAggregationQuery + "WHERE group = " + group + ", count = " + count);

        const result = await connection.execute(nestedAggregationQuery, [count]);

        // console.log(result);

        return {
            message: "Query successful.",
            success: true,
            tableData: result.rows
        }
    }).catch((error) => {
        console.log(error.message);
        return { message: `An error occurred during querying: ${error.message}`, success: false, tableData: [] };
    });
}

/*
    Update
 */
async function updateQueryOnStaff1(staffId, staffName, specialization, position) {
    return await withOracleDB(async (connection) => {
        const insertQuery = `UPDATE Staff1 SET name=:staffName, specialization=:specialization, Position=:position
                            WHERE staffID=:staffId`;

        const result = await connection.execute(insertQuery,
            [staffName, specialization, position, staffId],
            { autoCommit: true });

        let success = result.rowsAffected && result.rowsAffected > 0;
        return {
            message: "Update successful.",
            success: success,
            data: []
        }
    }).catch((error) => {
        return { message: `An error occurred during Update: ${error.message}`, success: false, data: [] };
    });
}

async function selectionQueryOnStaff1(queryString) {
    console.log("EXECUTING: ", queryString);
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(queryString);
        console.log(result);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

/*
    JOIN with WHERE clause
*/
// receive eventID as request
// submit query to database
// query: join Staff1 s and Holds h, select staff where h.eventID = eventID
// return query result
async function findStaffForEvent(eventID) {
    console.log(`appService - Received eventID for query: ${eventID}`);

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT s.staffID, s.name, s.specialization, s.position
                FROM Staff1 s JOIN Holds h ON s.staffID = h.staffID
                WHERE h.eventID = ${eventID}`
            );
            console.log(`appService - Query success. Number of rows fetched: `, result.rows.length);
            return result.rows;
        } catch (error) {
            console.error('Query error:', error.message);
            throw error;
        }
    });
}

/*
    Aggregation (COUNT) with GROUP BY
*/
// receive group as request
// submit query to database
// query: count the number of staff in Staff1 grouped by group
// return query result
async function countStaffByGroup(group) {
    console.log(`appService - Received group for query: ${group}`);

    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT ${group}, COUNT(*) FROM Staff1 GROUP BY ${group}`
            );
            console.log(`appService - Query success. Number of rows fetched: `, result.rows.length);
            return result.rows;
        } catch(error) {
            console.error('Query error:', error.message);
            throw error;
        }
    });
}

/*
    Aggregation (MIN / MAX / AVG) with HAVING
*/
// receive min / max / avg as request
// submit query to database
// query: aggregate either the min / min / avg age per ticketType with count (*) > 1
// return query result
async function aggregateVisitorAge(aggType) {
    console.log(`appService - Received aggregation type for query: ${aggType}`);

    return await withOracleDB(async(connection) => {
        try {
            const result = await connection.execute(
                `SELECT v2.ticketType, ${aggType}(v2.age)
                FROM Visitor1 v1, Visitor2 v2
                WHERE v1.age = v2.age
                GROUP BY v2.ticketType
                HAVING COUNT(*) > 1`
            );
            console.log(`appService - Query success. Number of rows fetched: `, result.rows.length);
            return result.rows;
        } catch(error) {
            console.error('Query error:', error.message);
            throw error;
        }
    });
}

module.exports = {
    testOracleConnection,
    fetchDbTable,
    fetchTableColumns,
    fetchTableProjection,
    insertStaff2Table,
    selectionQueryOnStaff1,
    fetchStaff2FromDb,
    deleteStaff2Tuple,
    findVisitorsJoiningAllPromotionOnCertainDate,
    findAverageAgeOfCertainGroupWithCertainCount,
    updateQueryOnStaff1,
    findStaffForEvent,
    countStaffByGroup,
    aggregateVisitorAge
};
