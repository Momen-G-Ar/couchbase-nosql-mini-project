import express from 'express';
import dbFunctions from '../utilities/db-functions.js';

const dbCreationRouter: express.Router = express();

dbCreationRouter.post('/create-scope', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const SCOPE_NAME = req.query.SCOPE_NAME;
        const result = await clusterConnection.query(`
            CREATE SCOPE ${process.env.BUCKET_NAME}.${SCOPE_NAME};
        `);
        res.status(200).send({ message: "The Scope created correctly", result });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error });
    }
});

dbCreationRouter.post('/create-collection', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const COLLECTION_NAME = req.query.COLLECTION_NAME;
        const result = await clusterConnection.query(`
            CREATE COLLECTION ${process.env.BUCKET_NAME}.development.${COLLECTION_NAME};
        `);
        res.status(200).send({ message: "The Collection created correctly", result });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error });
    }
});

dbCreationRouter.post('/create-index', async (req: express.Request, res: express.Response) => {
    try {
        const clusterConnection = await dbFunctions.connection();
        const COLLECTION_NAME = req.query.COLLECTION_NAME;
        const result = await clusterConnection.query(`
            CREATE INDEX db_price_index
            ON ${process.env.BUCKET_NAME}.development.${COLLECTION_NAME}(price)
            USING GSI;
        `);
        res.status(200).send({ message: "The Index created correctly", result });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", error });
    }
});


export default dbCreationRouter;