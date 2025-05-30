import { colors, colorsHex } from '../types/colors';
import { Circuit, Climb, ClimbSlim, Route, Set, User } from '../types/routes';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useParams } from 'react-router';
import { useCircuits } from '../features/circuits/api/get-circuits';
import { useRoutes } from '../features/routes/api/get-routes';
import { useSets } from '../features/sets/api/get-sets';
import { useUser } from '../lib/auth';
import { useSidebarState } from './ui/sidebar/sidebar-state';
import { api } from '@/lib/api-client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  maintainAspectRatio: false, // Allows you to set a custom height
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true, // Makes the legend use circular markers
        pointStyle: 'roundRect', // Use a rounded rectangle
      },
    },
    title: {
      display: false,
      text: 'Chart.js Bar Chart',
    },
  },
};

//   const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export default function Profile() {
  const routes = useRoutes().data || [];
  const circuits = useCircuits().data?.data || {};
  const sets = useSets().data || {};

  const { data: user_me } = useUser();

  const [user, setUser] = useState<User | false>(false);
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const { openSidebar } = useSidebarState();
  const { id } = useParams();

  function fetchUser() {
    const username = id || user_me?.username;
    console.log('Fetching user:', username);
    api
      .get('/users/get_public/' + username)
      .then((res) => {
        setUser(res);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }

  function fetchClimbs() {
    const username = id || user_me?.username;
    console.log('Fetching climbs for user:', username);
    api
      .get('/users/get_climbs/' + username)
      .then((res) => {
        setClimbs(res);
      })
      .catch((error) => {
        console.error('Error fetching user climbs:', error);
      });
  }

  useEffect(() => {
    fetchUser();
    fetchClimbs();
  }, [id]);

  const labels = Object.values(sets)
    .map((set) =>
      new Date(set.date).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
    )
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      return (
        new Date(`${aYear}-${aMonth}-01`).getTime() -
        new Date(`${bYear}-${bMonth}-01`).getTime()
      );
    }); // Sort by date

  const sent_ids = climbs
    .filter((climb) => climb.sent == true)
    .map((climb) => climb.route);

  const out_data: any = {};

  Object.values(sets).forEach((set) => {
    const n_complete = Object.values(routes).filter(
      (route) => route.set_id === set.id && sent_ids.includes(route.id),
    ).length;

    const date = new Date(set.date).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    const color = circuits[set.circuit_id]?.color;

    if (color) {
      out_data[color] = out_data[color] || {};
      out_data[color][date] = out_data[color][date] || {};
      out_data[color][date] = n_complete;
    }
  });

  const data = {
    labels: labels,
    datasets: Object.values(circuits).map((circuit) => {
      const data = labels.map((label) => {
        return out_data[circuit.color]?.[label] || 0;
      });

      return {
        label: circuit.name,
        data: data,
        backgroundColor: colorsHex[circuit.color],
      };
    }),
  };

  const locationCounts = Object.entries(
    climbs
      .filter((climb) => climb.sent)
      .reduce((acc, climb) => {
        const location = routes[climb.route]?.location;
        if (location) {
          acc[location] = (acc[location] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
  )
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [location, count]) => {
      acc[location] = count;
      return acc;
    }, {} as Record<string, number>);

  const styleCounts = Object.entries(
    climbs
      .filter((climb) => climb.sent)
      .reduce((acc, climb) => {
        const styles = routes[climb.route]?.style.split(',') || [];
        styles.forEach((style) => {
          if (style) {
            acc[style.trim()] = (acc[style.trim()] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>),
  )
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [style, count]) => {
      acc[style] = count;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:mb-8 mb-14">
      {/* <RouteSideBar
        route={routes[sidebarRoute]}
        closeCallback={() => setSidebarRoute(undefined)}
      ></RouteSideBar> */}

      <div className="max-w-3xl mx-auto bg-white rounded-t-xl relative">
        {/* <img className="max-h-56 w-full object-cover shadow-lg rounded-t-xl  border-4 border-white" src={`https://www.abcwalls.co.uk/wp-content/uploads/2024/01/DepotClimbingSocialUse-178-USE.jpg`} alt="Profile" /> */}
        {!user.has_cover_photo ? (
          <img
            className="h-56 max-h-56 w-full object-cover bg-slate-400 rounded-t-xl border-4 border-white opacity-90"
            src={`https://www.abcwalls.co.uk/wp-content/uploads/2024/01/DepotClimbingSocialUse-178-USE.jpg`}
          />
        ) : (
          <img
            className="h-56 max-h-56 w-full object-cover bg-slate-400 rounded-t-xl border-4 border-white"
            src={`/api/cover_photo/${user.id}`}
          />
        )}

        <div className="relative">
          {!user.has_profile_photo ? (
            <UserCircleIcon className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg h-36 w-36 bg-white text-gray-700"></UserCircleIcon>
          ) : (
            <img
              className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg h-36 w-36"
              src={`/api/profile_photo/${user.id}`}
            />
          )}
          {/* <img className="absolute left-4 -translate-y-2/3 rounded-full border-4 border-white shadow-lg" src="https://headshots-inc.com/wp-content/uploads/2023/03/business-headshot-example-2.jpg" alt="User Profile" style={{ width: '150px', height: '150px', top: '50%' }} /> */}
          <div className="absolute left-48 font-bold text-2xl text-gray-800 top-4">
            @{user.username}
          </div>

          <div className="absolute left-48 top-22 font text-md text-gray-800 top-4"></div>
        </div>

        <div className="mt-16 m-8">{user.about}</div>

        <div className="mt-8 m-8 font-bold">
          Total sends: {sent_ids.length}
          <div className="h-64">
            <Bar options={options} data={data} />
          </div>
          {locationCounts && Object.keys(locationCounts).length > 0 && (
            <div className="mt-4">
              <div className="font-bold">Location Breakdown</div>
              <div className="flex font-normal mt-4 gap-2 overflow-x-scroll ">
                {Object.keys(locationCounts).map((location) => (
                  <div
                    key={location}
                    className="mb-4 items-center text-nowrap rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-gray-600"
                  >
                    <div className="">
                      {location} : {locationCounts[location]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {locationCounts && Object.keys(styleCounts).length > 0 && (
            <div className="mt-4">
              <div className="font-bold">Style Breakdown</div>
              <div className="flex font-normal mt-4 gap-2 overflow-x-scroll ">
                {Object.keys(styleCounts).map((style) => (
                  <div
                    key={style}
                    className="mb-4 items-center text-nowrap rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-gray-600"
                  >
                    <div className="">
                      {style} : {styleCounts[style]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 m-8 font-bold">Recent Sends</div>
        <div className="m-2">
          <div className="flex flex-col bg-white m-auto p-auto mt-5 relative">
            <div className="flex overflow-x-scroll pb-10 hide-scroll-bar">
              <div className="flex gap-4 flex-nowrap ml-2">
                {climbs
                  .filter((climb) => climb.sent)
                  .filter((climb) => routes[climb.route])
                  .sort(
                    (a, b) =>
                      new Date(b.time).getTime() - new Date(a.time).getTime(),
                  )
                  .slice(0, 20)
                  .map((climb) => (
                    <RouteCardProfile
                      key={climb.route}
                      route={routes[climb.route]}
                      circuits={circuits}
                      sets={sets}
                      climb={climb}
                      setSidebarRoute={() => openSidebar(routes[climb.route])}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional profile details can be added here */}
      </div>
    </div>
  );
}

export function RouteCardProfile(props: {
  route: Route;
  circuits: Record<string, Circuit>;
  sets: Record<string, Set>;
  climb: Climb | ClimbSlim;
  setSidebarRoute: (route: Route) => void;
}) {
  if (props.route === undefined) {
    return <div></div>;
  }

  const today = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
  const climb_day = Math.floor(
    new Date(props.climb.time).getTime() / (1000 * 60 * 60 * 24),
  );
  const days_since = today - climb_day;

  const day_text =
    days_since === 0
      ? 'Today'
      : days_since === 1
      ? 'Yesterday'
      : days_since + ' days ago';

  return (
    <div
      className="cursor-pointer w-36 max-w-xs rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out"
      onClick={() => props.setSidebarRoute(props.route)}
    >
      <div className="bg-white relative">
        <img
          className={'rounded-lg'}
          src={'/api/img_thumb/' + props.route.id + '.webp'}
        ></img>
        <div
          className={
            'absolute bottom-1 m-1 p-1 px-3 rounded-sm text-white ' +
            (props.sets[props.route.set_id]
              ? colors[
                  props.circuits[props.sets[props.route.set_id].circuit_id]
                    .color
                ]
              : 'bg-gray-500')
          }
        >
          {props.route.name}{' '}
        </div>
        <div className="absolute text-center -bottom-7 w-full font-normal text-sm  p-1 px-2 rounded-sm text-gray-600">
          {day_text}
        </div>
      </div>
    </div>
  );
}
