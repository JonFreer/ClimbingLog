import { colors } from "../types/colors";
import { Circuit, Climb, Projects, Route, Set, User } from "../types/routes";
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'

export default function Profile(props: {
  routes: Route[];
  climbs: Climb[];
  circuits: Record<string, Circuit>;
  sets: Record<string, Set>;
  projects: Projects;
  user: User | false;
  updateData: () => void;
}){
    return(
        <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-t-xl">
            <img className="max-h-56 w-full object-cover shadow-lg rounded-t-xl  border-4 border-white" src="https://www.abcwalls.co.uk/wp-content/uploads/2024/01/DepotClimbingSocialUse-178-USE.jpg" alt="Profile" />
            <div className="relative">
                <UserCircleIcon className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg h-36 w-36 bg-white text-gray-700"></UserCircleIcon>
                {/* <img className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg" src="https://headshots-inc.com/wp-content/uploads/2023/03/business-headshot-example-2.jpg" alt="User Profile" style={{ width: '150px', height: '150px', top: '50%' }} /> */}
                <div className="absolute left-48 font-bold text-2xl text-gray-800 top-4">
                    @{props.user.username}
                </div>

                <div className="absolute left-48 top-22 font text-md text-gray-800 top-4">
                
                </div>
            </div>

            <div className="mt-16 m-8">
            {props.user.about}
            </div>

            <div className="mt-8 m-8 font-bold">
             Total sends: {props.climbs.filter(climb => climb.sent).length}
            </div>

            <div className="mt-8 m-8 font-bold">
                Recent Sends
                <div className="flex flex-col bg-white m-auto p-auto mt-5">
                    <div className="flex overflow-x-scroll pb-10 hide-scroll-bar">
                    <div className="flex gap-4 flex-nowrap lg:ml-40 md:ml-20 ml-10">
                    {props.climbs
                        .filter(climb => climb.sent)
                        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                        .slice(0, 20)
                        .map((climb) => (
                            <RouteCard 
                                key={climb.route}
                                route={props.routes.find(route => route.id === climb.route)}
                                circuits={props.circuits}
                                sets={props.sets}
                                climb={climb}
                            />
                    ))}
                </div>
                </div>
                </div>
            </div>
           
            {/* Additional profile details can be added here */}
        </div>
        </div>
    )
}

function RouteCard(props: {
  route: Route;
  circuits: Record<string, Circuit>;
  sets: Record<string, Set>;
  climb: Climb;
}){

    const days = Math.floor((Date.now() - new Date(props.climb.time).getTime()) / (1000 * 60 * 60 * 24));

    var day_text = (days == 0) ? "Today" : (days == 1) ? "Yesterday" : days + " days ago";

    return(
        <div className="cursor-pointer w-36 max-w-xs rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div className="bg-white relative">
                <img
                    className={"rounded-lg"}
                    src={"/api/img_thumb/" + props.route.id + ".webp"}
                ></img>
                <div className={"absolute bottom-1 m-1 p-1 px-3 rounded text-white " + (props.sets[props.route.set_id] ? colors[props.circuits[props.sets[props.route.set_id].circuit_id].color] : "bg-gray-500")}>{props.route.name} </div>
                <div className="absolute text-center -bottom-7 w-full font-normal text-sm  p-1 px-2 rounded text-gray-600">{day_text}</div>
                 
            </div>
        
        </div>
    )
}