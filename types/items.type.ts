namespace ItemNS {
    export interface IItem {
        id: string;
        name: string;
        description: string;
        price: number;
        addDate: string;
        category: 'phone' | 'clothe' | 'food' | 'computer' | 'watch';
        store: {
            name: string;
            owner: string;
        };
    }
}
export default ItemNS;