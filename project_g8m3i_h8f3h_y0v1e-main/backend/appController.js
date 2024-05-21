const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    console.log("checking connection12\n");
    if (isConnect) {
        res.json({message: "Connected!"});
        //res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/fetch-tables', async (req, res) => {
    const tables = await appService.fetchDbTable();
    console.log(tables);
    if (tables) {
        res.json({ 
            success: true,  
            data: tables
        });
    } else {
        res.status(500).json({ 
            success: false, 
            data: tables
        });
    }
});

router.get('/fetch-table-columns', async (req, res) => {
    console.log(req.query.table);
    const table = req.query.table;
    const columns = await appService.fetchTableColumns(table);
    console.log(columns);
    if (columns) {
        res.json({ 
            success: true,  
            data: columns
        });
    } else {
        res.status(500).json({ 
            success: false, 
            data: columns
        });
    }
});

router.post('/fetch-table-projection', async (req, res) => {
    console.log("ENTER fetch-table-projection")
    console.log(req.body);
    const tableName = req.body.tableName;
    const columnNames = req.body.selectedColumns;
    const data = await appService.fetchTableProjection(tableName, columnNames);
    console.log(data);
    if (data) {
        res.json({
            success: true,  
            data: data
        });
    } else {
        res.status(500).json({
            success: false, 
            data: data
        });
    }
});

router.post('/insert-staff', async (req, res) => {
    console.log(`POST REQUEST to insert staff: ${req.body.staffID}`);
    const staffID = req.body.staffID;
    const staffName = req.body.staffName;
    const specialization = req.body.specialization;
    const position = req.body.position;
    const result = await appService.insertStaff2Table(staffID, staffName, specialization, position);
    console.log(result);
    if (result.rowsAffected > 0) {
        res.status(200).json({
            success: true,
            data: result
        });
    } else {
        res.status(400).json({
            success: false,
            data: result
        });
    }
});

/*
    Selection Query on Staff 1
    PRE: req.body contains a valid query string
*/
router.post('/selection-query', async (req, res) => {
    console.log(req.body);
    const data = await appService.selectionQueryOnStaff1(req.body.queryStr);
    if (data) {
        res.json({
            success: true,
            data: data
        });
    } else {
        res.status(500).json({
            success: false,
            data: data
        });
    }
});

/*
    JOIN with WHERE clause
*/
// receive event ID as request
// call findStaffForEvent(eventID)
// receive response from appService
// return response to front end
router.get('/fetch-staff-with-eventID', async (req, res) => {
    const { eventID } = req.query;
    console.log(`appCollector - Received Find Staff request with eventID: ${eventID}`);

    if (!eventID) {
        return res.status(400).json({ success: false, message: "eventID is required" });
    }

    try {
        const result = await appService.findStaffForEvent(eventID);
        console.log(`appCollector - Success: Staff(s) details: `, result);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/*
    Aggregation (COUNT) with GROUP BY
*/
// receive group as request
// call countStaffByGroup(group)
// receive response from appService
// return response to front end
router.get('/staff-count-by-group', async (req, res) => {
    const { group } = req.query;
    console.log(`appCollector - Received Staff Count request with group: ${group}`);

        if (!['specialization', 'position'].includes(group)) {
            return res.status(400).json({ success: false, message: 'Invalid group selection'});
        }

    try {
        const result = await appService.countStaffByGroup(group);
        console.log(`appCollector - Success: Staff Count details: `, result);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/*
    Aggregation (MIN / MAX / AVG) with HAVING
*/
// receive min / max / avg as request
// call aggregateVisitorAge(aggType)
// receive response from appService
// return response to front end
router.get('/aggregate-visitor-age', async (req, res) => {
    const aggType = req.query.type;
    console.log(`appCollector - Received Aggregate Visitor Age request with ${aggType}`);

    const validType = ['max', 'min', 'avg'];
    if (!validType.includes(aggType)) {
        return res.status(400).json({ success: false, message: "Invalid aggregation type" });
    }

    try {
        const result = await appService.aggregateVisitorAge(aggType);
        console.log(`appCollector - Success: Aggregation details: `, result);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/staff2', async (req, res) => {
    const tableContent = await appService.fetchStaff2FromDb();
    res.json({data: tableContent});
});

router.delete('/delete-specialization', async (req, res) => {
    const specialization = req.body.specialization;
    console.log(`DELETE REQUEST to delete a specialization: ${specialization}`);
    const result = await appService.deleteStaff2Tuple(specialization);
    console.log(result);
    if (result.rowsAffected > 0) {
        res.status(200).json({
            success: true,
            data: result
        });
    } else {
        res.status(400).json({
            success: false,
            data: result
        });
    }
});

router.get('/get-all-visitors-joining-promotion-events/:date', async (req, res) => {
    const date = req.params.date;
    console.log(`GET REQUEST to division query: ${date}`);
    const result = await appService.findVisitorsJoiningAllPromotionOnCertainDate(date);
    console.log(result);
    if (result.success === true) {
        res.status(200).json({
            success: true,
            data: result
        });
    } else {
        res.status(400).json({
            success: false,
            data: result
        });
    }
});

router.get('/get-average-age-of-group-over-count/:group/:count', async (req, res) => {
    const group = req.params.group;
    const count = req.params.count;
    console.log(`GET REQUEST to nested aggregation query: ${group}, ${count}`);
    const result = await appService.findAverageAgeOfCertainGroupWithCertainCount(group, count);
    if (result.success === true) {
        res.status(200).json({
            success: true,
            data: result
        });
    } else {
        res.status(400).json({
            success: false,
            data: result
        });
    }
});

router.post('/update-query-staff1', async (req, res) => {
    const staffID = req.body.staffId;
    const staffName = req.body.staffName;
    const specialization = req.body.specialization;
    const position = req.body.position;

    const result = await appService.updateQueryOnStaff1(staffID, staffName, specialization, position);

    res.json(result);
});

module.exports = router;
