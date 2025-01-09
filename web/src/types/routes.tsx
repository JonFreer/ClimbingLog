export interface Route{
    id:string;
    grade:string;
    location:string;
    circuit_id:string;
    style:string;
    name:string;
    x:number;
    y:number;
}

export interface Circuit{
    id:string;
    name:string;
    open:boolean;
    color:string;
}

export interface User{
    id:string;
    email:string;
    username:string;
    about:string;
    is_active:boolean;
    is_verified:boolean;
    is_superuser:boolean;
    profile_visible:boolean;
    send_visible:boolean;
}

export interface Climb{
    id:string;
    sent: boolean;
    time: string;
    route: string;
    user: string;
}