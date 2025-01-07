import { useEffect, useState } from "react";
import { Route } from "../types/routes";
import { RouteList } from "./route-list";

export function RoutesPage(){

    const [routes, setRoutes] = useState<Route[]>([]);
    
    
    useEffect(() => {
    fetch('api/routes/get_all')
        .then(response => response.json())
        .then(data => setRoutes(data))
        .catch(error => console.error('Error fetching routes:', error));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('api/climbs/me/get_all', {
            headers: {
            'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => console.log("climbs",data))
            .catch(error => console.error('Error fetching routes:', error));
        }, []);
    
    return (
        <div>
             <h1 className='mx-8 mt-5 font-bold text-3xl'>All Routes</h1>
            <RouteList routes={routes}/>
        </div>
    );
}