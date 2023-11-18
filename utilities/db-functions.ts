import * as couchbase from 'couchbase';

const connection = async () => {
    var clusterConnection = await couchbase.connect(process.env.CLUSTER_CONNECTION_STRING as string, {
        username: process.env.USER_NAME,
        password: process.env.PASSWORD,
    });
    return clusterConnection;
};

export default {
    connection
};