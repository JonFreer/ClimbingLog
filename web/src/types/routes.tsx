export interface Route{
    id:string;
    grade:string;
    location:string;
    circuit_id:string;
    style:string;
    name:string;
}

export interface Circuit{
    id:string;
    name:string;
    open:boolean;
    color:string;
}