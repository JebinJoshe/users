import express, { Request, Response } from 'express';
import mysql, { Pool, PoolConnection } from 'mysql';
import bodyParser from 'body-parser';

const app = express();
const port: number = 2121;
app.use(bodyParser.json());

const pool: Pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '145678',
    database: 'profile-details',
});

pool.getConnection((err: mysql.MysqlError | null, connection: PoolConnection) => {
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

app.get('/', (req: Request, res: Response) => {
    res.send("Hi from server");
});


app.post('/api/validate-seller', (req: Request, res: Response) => {
    const data: { PanNumber: string, GstNumber?: string } = req.body;

    // PAN Verification using Regular Expression
    const panRegex: RegExp = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (panRegex.test(data.PanNumber)) {

        console.log('Valid Pan Number')

        // GST Verification using Regular Expression
        // const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        // if (!gstRegex.test(data.GstNumber)) {
        //     return res.status(400).json({ error: 'Invalid GST number' });
        // }

       
        pool.getConnection((err: mysql.MysqlError | null, connection: PoolConnection) => {
            if (err) {
                console.error('Error getting MYSQL connection:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            connection.query('INSERT INTO SELLERO2 SET ?', data, (error: mysql.MysqlError | null, results: any) => {
                connection.release();

                if (error) {
                    console.error('Error inserting sellero2 details:', error);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.status(201).json({ message: 'Sellero2 details inserted successfully with Pan Number' });
                console.log("Sellero2 details inserted successfully with pan Number");
            });
        });
    } else {
        return res.status(400).json({ error: 'Invalid PAN number' });
    }
});


app.get('/api/users', (req: Request, res: Response) => {
    pool.getConnection((err: mysql.MysqlError | null, connection: PoolConnection) => {
        if (err) {
            console.error('Error getting MYSQL connection:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        connection.query('SELECT * FROM SELLERO2', (error: mysql.MysqlError | null, results: any) => {
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
