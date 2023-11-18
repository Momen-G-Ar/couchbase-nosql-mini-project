namespace OrderNS {
    export interface IOrder {
        id: string;
        employeeName: string;
        itemsIds: string[];
    }
}
export default OrderNS;


/*
    - The provided schemas only for explanation proposes and 
    provided from the typescript it self not the couchbase db.

    - We save the store information in the items it self because
    that application design suppose that the queries in general 
    asks about the items and orders not the stores itself information.  
*/