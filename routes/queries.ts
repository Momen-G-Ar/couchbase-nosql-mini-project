import express, { Router } from 'express';
import dbFunctions from '../utilities/db-functions.js';
import ItemNS from '../types/items.type.js';
import OrderNS from '../types/orders.type.js';

const queriesRouter: express.Router = express();

// ----------------------- items collection ------------------------------
queriesRouter.post('/add-item', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = String(Math.floor(Math.random() * 1000))
            + new Date().toISOString()
            + Math.floor(Math.random() * 1000);
        const item: ItemNS.IItem = {
            ...req.body,
            id: KEY,
            addDate: new Date().toISOString(),
        };
        const result = await clusterConnection.query(`
            INSERT INTO ${BUCKET_NAME}.${SCOPE_NAME}.items (KEY, VALUE)
            VALUES ("${KEY}", ${JSON.stringify(item)}) RETURNING *;
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-items', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const result = await clusterConnection.query(`
            SELECT *, META().id AS key_id
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.items db
            ORDER BY price DESC;
        `);
        res.status(200).send({ message: "Process done correctly", length: result.rows.length, rows: result.rows });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-item', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;
        const result = await clusterConnection.query(`
            SELECT *, META().id AS key_id
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.items db
            USE KEYS "${KEY}";
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.post('/update-item', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;
        const item: ItemNS.IItem = {
            ...req.body,
            id: KEY,
            addDate: new Date().toISOString(),
        };
        const result = await clusterConnection.query(`
            UPSERT INTO ${BUCKET_NAME}.${SCOPE_NAME}.items (KEY, VALUE)
            VALUES ("${KEY}", ${JSON.stringify(item)}) RETURNING *;
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.delete('/delete-item', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;

        const result = await clusterConnection.query(`
            DELETE FROM ${BUCKET_NAME}.${SCOPE_NAME}.items item
            USE KEYS "${KEY}"
            RETURNING item;
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-number-of-items-by-store', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;
        const result = await clusterConnection.query(`
            SELECT store.name AS store_name, COUNT(DISTINCT items) AS number_of_items 
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.items
            GROUP BY items.store.name
            ORDER BY number_of_items DESC;
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-filtered', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const sorted: 'ASC' | 'DESC' | undefined = req.query.sorted as ('ASC' | 'DESC' | undefined);
        const limit: number | undefined = req.query.limit as (number | undefined);
        const offset: number | undefined = req.query.offset as (number | undefined);
        const search: string | undefined = req.query.search as (string | undefined);
        const category: string | undefined = req.query.category as (string | undefined);

        const query =
            `
            SELECT * 
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.items
            ${search !== undefined
                ? `
                    WHERE LOWER(items.name) LIKE '%${search.toLowerCase().trim()}%'
                    OR LOWER(items.descreption) LIKE '%${search.toLowerCase().trim()}%'
                    ${category !== undefined ? `AND items.category = ${category}` : ''}
                `
                : `
                    ${category !== undefined ? `WHERE items.category LIKE '${category}'` : ''}
                `}
            ${sorted !== undefined ? `ORDER BY price ${sorted}` : ''}
            ${limit !== undefined ? `LIMIT ${limit}` : ''}
            ${offset !== undefined ? `OFFSET ${offset}` : ''}
        ;`;
        console.log(query);

        const result = await clusterConnection.query(query);
        res.status(200).send({ message: "Process done correctly", length: result.rows.length, rows: result.rows });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

// ----------------------- orders collection ------------------------------
queriesRouter.post('/add-order', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = String(Math.floor(Math.random() * 1000))
            + new Date().toISOString()
            + Math.floor(Math.random() * 1000);
        const order: OrderNS.IOrder = {
            ...req.body,
            id: KEY,
        };
        const result = await clusterConnection.query(`
            INSERT INTO ${BUCKET_NAME}.${SCOPE_NAME}.orders (KEY, VALUE)
            VALUES ("${KEY}", ${JSON.stringify(order)}) RETURNING *;
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-orders', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const result = await clusterConnection.query(`
            SELECT *, META().id AS key_id
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.orders db;
        `);
        res.status(200).send({ message: "Process done correctly", length: result.rows.length, rows: result.rows });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-order', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;
        const result = await clusterConnection.query(`
            SELECT *, META().id AS key_id
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.orders db
            USE KEYS "${KEY}";
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

// ----------------------- orders + items collection ------------------------------
queriesRouter.get('/get-order-items', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;
        const result = await clusterConnection.query(`
            SELECT items AS item
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.orders 
            JOIN ${BUCKET_NAME}.${SCOPE_NAME}.items
            ON META(items).id IN orders.itemsIds
            WHERE META(orders).id = "${KEY}";
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});

queriesRouter.get('/get-order-price', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = process.env.SCOPE_NAME;
        const BUCKET_NAME = process.env.BUCKET_NAME;

        const KEY: string = req.query.id as string;
        const result = await clusterConnection.query(`
            SELECT SUM(items.price) AS total_price
            FROM ${BUCKET_NAME}.${SCOPE_NAME}.orders 
            JOIN ${BUCKET_NAME}.${SCOPE_NAME}.items
            ON META(items).id IN orders.itemsIds
            WHERE META(orders).id = "${KEY}";
        `);
        res.status(200).send({ message: "Process done correctly", result });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error", error });
    }
});


export default queriesRouter;