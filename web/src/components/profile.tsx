import { colors, colorsHex } from "../types/colors";
import { Circuit, Climb, Projects, Route, Set, User } from "../types/routes";
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { useParams } from "react-router";
import { API } from "../types/api";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );


export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart',
      },
    },
  };
  
//   const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  
export default function Profile(props: {
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

    const { id } = useParams();


    function fetchUser() {
        const username = id || props.user.username;
        API("GET", "/api/users/get_public/"+username)
          .then((data) => {
    
            setUser(data.data);
            console.log("User Profile", data.data);
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
          });
      }
    
      function fetchClimbs() {
        const username = id || props.user.username;
        API("GET", "/api/users/get_climbs/"+username)
          .then((data) => {
    
            setClimbs(data.data);
            console.log("User Climbs", data.data);
          })
          .catch((error) => {
            console.error("Error fetching climbs:", error);
          });
      }

    useEffect(() => {
        fetchUser();
        fetchClimbs();
    }, [id]);


    console.log(`Profile ID: ${id}`);

    const labels = Object.values(props.sets)
        .map(set => new Date(set.date).toLocaleString('default', { month: 'long', year: 'numeric' }))
        .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
        .sort((a, b) => {
            const [aMonth, aYear] = a.split(' ');
            const [bMonth, bYear] = b.split(' ');
            return new Date(`${aYear}-${aMonth}-01`).getTime() - new Date(`${bYear}-${bMonth}-01`).getTime();
        }); // Sort by date

    const sent_ids = climbs
    .filter((climb) => climb.sent == true)
    .map((climb) => climb.route);

    const out_data:any = {};

    Object.values(props.sets).forEach((set)=>{
        const n_complete = props.routes.filter(
            (route) => route.set_id === set.id && sent_ids.includes(route.id)
          ).length;

          const date = new Date(set.date).toLocaleString('default', { month: 'long', year: 'numeric' });
          const color = props.circuits[set.circuit_id]?.color;

          if (color) {
            out_data[color] = out_data[color] || {};
            out_data[color][date] = out_data[color][date] || {};
            out_data[color][date] = n_complete;
          
          }
    })

    const data = {
        labels: labels,
        datasets: Object.values(props.circuits).map(circuit => {
      
            const data = labels.map(label => {
                return out_data[circuit.color]?.[label] || 0;
            });

            return {
                label: circuit.name,
                data: data,
                backgroundColor: colorsHex[circuit.color],
            };
        })
    };

    const locationCounts = Object.entries(
        climbs
            .filter(climb => climb.sent)
            .reduce((acc, climb) => {
                const location = props.routes.find(route => route.id === climb.route)?.location;
                if (location) {
                    acc[location] = (acc[location] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).reduce((acc, [location, count]) => {
        acc[location] = count;
        return acc;
    }, {} as Record<string, number>);

    const styleCounts = Object.entries(
        climbs
            .filter(climb => climb.sent)
            .reduce((acc, climb) => {
                const styles = props.routes.find(route => route.id === climb.route)?.style.split(',') || [];
                styles.forEach(style => {
                    if (style) {
                        acc[style.trim()] = (acc[style.trim()] || 0) + 1;
                    }
                });
                return acc;
            }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).reduce((acc, [style, count]) => {
        acc[style] = count;
        return acc;
    }, {} as Record<string, number>);

    return(
        <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-t-xl relative">
        {/* <img className="max-h-56 w-full object-cover shadow-lg rounded-t-xl  border-4 border-white" src={`https://www.abcwalls.co.uk/wp-content/uploads/2024/01/DepotClimbingSocialUse-178-USE.jpg`} alt="Profile" /> */}
            {! user.has_cover_photo ?
            <img className="h-56 max-h-56 w-full object-cover bg-slate-400 rounded-t-xl border-4 border-white opacity-90" src={`https://www.abcwalls.co.uk/wp-content/uploads/2024/01/DepotClimbingSocialUse-178-USE.jpg`}  />:
            <img className="h-56 max-h-56 w-full object-cover bg-slate-400 rounded-t-xl border-4 border-white" src={`/api/cover_photo/${user.id}`}  />}
            
            <div className="relative">

                {!user.has_profile_photo ?
                <UserCircleIcon className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg h-36 w-36 bg-white text-gray-700"></UserCircleIcon>:
                <img className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg h-36 w-36" src={`/api/profile_photo/${user.id}`}  />}
                {/* <img className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg" src="https://headshots-inc.com/wp-content/uploads/2023/03/business-headshot-example-2.jpg" alt="User Profile" style={{ width: '150px', height: '150px', top: '50%' }} /> */}
                <div className="absolute left-48 font-bold text-2xl text-gray-800 top-4">
                    @{user.username}
                </div>

                <div className="absolute left-48 top-22 font text-md text-gray-800 top-4">
                
                </div>
            </div>

            <div className="mt-16 m-8">
            {user.about}
            </div>

            <div className="mt-8 m-8 font-bold">
             Total sends: {sent_ids.length}

             <Bar options={options} data={data} />

             {locationCounts && Object.keys(locationCounts).length > 0 && (
                <div className="mt-4">      
                    <div className="font-bold">Location Breakdown</div>
                    <div className="flex font-normal mt-4 gap-2 overflow-x-scroll ">
                            {Object.keys(locationCounts).map(location => (
                                    <div key={location} className="mb-4 items-center text-nowrap rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        <div className="">{location} : {locationCounts[location]}</div>
                                        
                                    </div>
                            ))}
                    </div>
                </div>
             )}

                {locationCounts && Object.keys(styleCounts).length > 0 && (
                <div className="mt-4">      
                    <div className="font-bold">Style Breakdown</div>
                    <div className="flex font-normal mt-4 gap-2 overflow-x-scroll ">
                            {Object.keys(styleCounts).map(style => (
                                    <div key={style} className="mb-4 items-center text-nowrap rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        <div className="">{style} : {styleCounts[style]}</div>
                                        
                                    </div>
                            ))}
                    </div>
                </div>
             )}

             </div>

            <div className="mt-8 m-8 font-bold">
                Recent Sends
            </div>
            <div className="m-2">
                <div className="flex flex-col bg-white m-auto p-auto mt-5 relative">
                    <div className="flex overflow-x-scroll pb-10 hide-scroll-bar">
                        <div className="flex gap-4 flex-nowrap lg:ml-40 md:ml-20 ml-10">
                            {climbs
                                .filter(climb => climb.sent)
                                .filter(climb => props.routes.find(route => route.id === climb.route))
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
                    <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
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