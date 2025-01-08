import { useEffect, useState } from "react";
import { Circuit, Route } from "../types/routes";
import { RouteList } from "./route-list";

export function RoutesPage(props:{routes:Route[],climbs:any[],circuits:Circuit[], updateData : () => void}) {

    return (
        <div>
             <h1 className='mx-8 mt-5 font-bold text-3xl'>All Routes</h1>
            <RouteList routes={props.routes} circuits ={props.circuits} climbs={props.climbs} updateData={props.updateData}/>
        </div>
    );
}