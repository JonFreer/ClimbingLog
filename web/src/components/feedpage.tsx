import { API } from "../types/api";
import { Circuit, Climb, Projects, Route, Set, User } from "../types/routes";
import { useEffect, useState } from "react";
import { RouteCardProfile } from "./profile";
import RouteSideBar from "./route-sidebar";
import { colorsPastel } from "../types/colors";
import { useSets } from "../features/sets/api/get-sets";
import { useCircuits } from "../features/circuits/api/get-circuits";
import { useRoutes } from "../features/routes/api/get-routes";
import { useClimbs } from "../features/climbs/api/get-climbs";

export default function Feed(props: {
  projects: Projects;
  user: User | false;
  updateData: () => void;
}) {
  const [sidebarRoute, setSidebarRoute] = useState<string | undefined>(
    undefined
  );

  const { data: routes } = useRoutes();
  const { data: circuits } = useCircuits();
  const { data: sets } = useSets();
  const { data: climbs } = useClimbs();

  const clumped_climbs = climbs.data.reduce((acc, climb) => {
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

  return (
    <>
      <div className="bg-white p-10 pt-6 pb-6 rounded-lg ">
        <div className="font-semibold text-xl">Send Feed</div>
      </div>
      <div className="bg-gray-100 p-4 sm:mb-8 mb-14">
        <RouteSideBar
          route={routes.data.find((route) => route.id === sidebarRoute)}
          circuits={circuits.data}
          sets={sets.data}
          climbs={climbs.data}
          projects={props.projects}
          updateData={props.updateData}
          closeCallback={() => setSidebarRoute(undefined)}
        ></RouteSideBar>

        {Object.keys(sorted_clumped_climbs).map((date) => (
          <div key={date}>
            {Object.keys(clumped_climbs[date]).map((user) => (
              <div className="bg-white p-4 rounded-lg mt-4 pb-2" key={user}>
                <div className="font-bold flex items-center text-slate-800">
                  {clumped_climbs[date][user][0].has_profile_photo ? (
                    <img
                      src={`/api/profile_photo/${clumped_climbs[date][user][0].user}`}
                      className="rounded-full h-9 w-9"
                    />
                  ) : null}
                  <a href={`/profile/${user}`} className="ml-3">
                    {user}
                  </a>{" "}
                  <div className="ml-auto font-normal text-sm">{date}</div>
                </div>

                <div className="m-2">
                  <div className="m-1 my-4 flex gap-2 ">
                    {Object.keys(circuits.data).map((circuitId) => {
                      const circuitClimbCount = Object.values(
                        clumped_climbs[date][user]
                      )
                        .flat()
                        .filter((climb: Climb) => {
                          const setId =
                            routes.data.find(
                              (route) => route.id === climb.route
                            )?.set_id ?? "";
                          return sets.data[setId]?.circuit_id === circuitId;
                        }).length;

                      return (
                        circuitClimbCount > 0 && (
                          <div
                            key={circuitId}
                            className={
                              "p-1 px-3 rounded-full text-white " +
                              colorsPastel[circuits.data[circuitId].color]
                            }
                          >
                            {circuitClimbCount}{" "}
                            {circuitClimbCount > 1 ? "sends" : "send"}
                          </div>
                        )
                      );
                    })}
                  </div>
                  <div className="flex flex-col bg-white m-auto p-auto mt-5 relative">
                    <div className="flex overflow-x-scroll pb-10 hide-scroll-bar">
                      <div className="flex gap-4 flex-nowrap">
                        {clumped_climbs[date][user].map((climb) => (
                          <RouteCardProfile
                            key={climb.route}
                            route={routes.data.find(
                              (route) => route.id === climb.route
                            )}
                            circuits={circuits.data}
                            sets={sets.data}
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
    </>
  );
}
