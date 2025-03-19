
import { API } from "../types/api";
import { Circuit, Climb, Projects, Route, Set, User } from "../types/routes";
import { useEffect, useState } from "react";
import { RouteCard } from "./route-card";
import { RouteCardProfile } from "./profile";

export default function Feed(props: {
    routes: Route[];
    climbs: Climb[];
    circuits: Record<string, Circuit>;
    sets: Record<string, Set>;
    projects: Projects;
    user: User | false;
    updateData: () => void;
  }){
  
      const [user,setUser]= useState<User|false>(false);
      const [climbs, setClimbs] = useState<Climb[]>([]);
      const [sidebarRoute, setSidebarRoute] = useState<string | undefined>(undefined);
  
    function fetchClimbs() {
          API("GET", "/api/climbs/get_all")
            .then((data) => {
      
              setClimbs(data.data);
              console.log("User Climbs", data.data);
            })
            .catch((error) => {
              console.error("Error fetching climbs:", error);
            });
        }

        useEffect(() => {
            fetchClimbs();
        }
        , []);
        const clumped_climbs = climbs.reduce((acc, climb) => {
            const climbDate = new Date(climb.time).toDateString();
            if (!acc[climbDate]) {
            acc[climbDate] = {};
            }
            if (!acc[climbDate][climb.username]) {
            acc[climbDate][climb.username] = [];
            }
            acc[climbDate][climb.username].push(climb);
            return acc;
        }, {} as Record<string, Record<string, Climb[]>>);

        const sorted_clumped_climbs = Object.keys(clumped_climbs)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .reduce((acc, date) => {
            acc[date] = clumped_climbs[date];
            return acc;
            }, {} as Record<string, Record<string, Climb[]>>);

        console.log("clumped_climbs", clumped_climbs);
    
    if (props.routes === undefined){
        return (<div></div>)
    }
    return (
        <div className="bg-gray-100 p-4">
            <div className="bg-white p-8 py-4 rounded-lg ">
                <div className="font-bold text-xl">Send Feed</div>
            </div>
                
                {Object.keys(sorted_clumped_climbs).map((date) => (
                    <div key={date}>
                        {Object.keys(clumped_climbs[date]).map((user) => (
                            <div className="bg-white p-4 rounded-lg mt-4 pb-2" key={user}>
                                <div className="font-bold flex items-center text-slate-800">
                                    {clumped_climbs[date][user][0].has_profile_photo ? (
                                    <img src={`/api/profile_photo/${clumped_climbs[date][user][0].user}`} className="rounded-full h-10 w-10" />
                                    ) : null}
                                    <div className="ml-4">{user}</div> <div className="ml-auto font-normal">{date}</div></div>

                                <div className="m-2">
                                <div className="flex flex-col bg-white m-auto p-auto mt-5 relative">
                                    <div className="flex overflow-x-scroll pb-10 hide-scroll-bar">
                                        <div className="flex gap-4 flex-nowrap">
                                            {clumped_climbs[date][user]
                                                .map((climb) => (
                                                    <RouteCardProfile 
                                                        key={climb.route}
                                                        route={props.routes.find(route => route.id === climb.route)}
                                                        circuits={props.circuits}
                                                        sets={props.sets}
                                                        climb={climb}
                                                        setSidebarRoute={setSidebarRoute}
                                                    />
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                              
                            </div>
                        ))}
                    </div>
                ))}
            
        </div>
    );
}