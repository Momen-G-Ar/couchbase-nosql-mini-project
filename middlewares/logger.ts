import express from 'express';
export default (req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`Method: ${req.method}, URL: ${req.originalUrl}, Time: ${new Date().toISOString()}`);
    next();
};