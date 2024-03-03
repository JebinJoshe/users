"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = 2121;
app.use(body_parser_1.default.json());
const pool = mysql_1.default.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '145678',
    database: 'profile-details',
});
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error Connecting to MYSQL database;', err);
        return;
    }
    console.log('Connected to MYSQL database');
    connection.release();
});
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
app.get('/', (req, res) => {
    res.send("Hi from server");
});
// Express route for PAN and GST validation and posting details
app.post('/api/validate-seller', (req, res) => {
    const data = req.body;
    // PAN Verification using Regular Expression
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panRegex.test(data.PanNumber)) {
        console.log('Valid Pan Number');
        // GST Verification using Regular Expression
        // const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        // if (!gstRegex.test(data.GstNumber)) {
        //     return res.status(400).json({ error: 'Invalid GST number' });
        // }
        // If both PAN and GST are valid, proceed to post details
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting MYSQL connection:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            connection.query('INSERT INTO SELLERO2 SET ?', data, (error, results) => {
                connection.release();
                if (error) {
                    console.error('Error inserting sellero2 details:', error);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.status(201).json({ message: 'Sellero2 details inserted successfully with Pan Number' });
                console.log("Sellero2 details inserted successfully with pan Number");
            });
        });
    }
    else {
        return res.status(400).json({ error: 'Invalid PAN number' });
    }
});
app.get('/api/users', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MYSQL connection:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT * FROM SELLERO2', (error, results) => {
            connection.release();
            if (error) {
                console.error('Error querying MYSQL:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    });
});
