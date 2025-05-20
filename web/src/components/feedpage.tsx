import { RouteCardProfile } from './profile';
import { colorsPastel } from '../types/colors';
import { useSets } from '../features/sets/api/get-sets';
import { useCircuits } from '../features/circuits/api/get-circuits';
import { useRoutes } from '../features/routes/api/get-routes';
import { useAllClimbs } from '../features/climbs/api/get-all-climbs';
import { useInfiniteActivities } from '../features/activities/api/get-activities';
import { useCreateReaction } from '../features/reactions/api/create-reaction';
import { useDeleteReaction } from '../features/reactions/api/delete-reaction';
import { useUser } from '../lib/auth';
import { useSidebarState } from './ui/sidebar/sidebar-state';
import { useUserListState } from './ui/userlist/userlist-state';

export default function Feed() {
  // const [sidebarRoute, setSidebarRoute] = useState<string | undefined>(
  //   undefined
  // );

  const user = useUser();
  const routes = useRoutes().data || {};
  const sets = useSets().data || {};
  const circuits = useCircuits().data?.data || {};
  const circuitsOrder = useCircuits().data?.order || [];
  const climbs = useAllClimbs().data || [];

  const { openSidebar } = useSidebarState();
  const { openUserList } = useUserListState();
  // const activities = useActivities().data || [];
  const activitiesQuery = useInfiniteActivities({});

  const createReactionMutation = useCreateReaction({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const deleteReactionMutation = useDeleteReaction({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  // if (activitiesQuery.isLoading) {
  //   return (
  //     <div className="flex h-48 w-full items-center justify-center">
  //       Loading
  //     </div>
  //   );
  // }

  const activities =
    activitiesQuery.data?.pages.flatMap((page) => page.data) || [];

  return (
    <>
      <div className="bg-white p-10 pt-6 pb-2 rounded-lg ">
        <div className="font-semibold text-xl">Send Feed</div>
      </div>
      <div className="bg-gray-100 sm:mb-8 mb-14">
        {/* <RouteSideBar
          route={routes[sidebarRoute] || undefined}
          closeCallback={() => setSidebarRoute(undefined)}
        ></RouteSideBar> */}

        {activities.map((activity) => (
          <div
            className="bg-white p-4 mt-4 pb-2"
            key={activity.username + activity.time}
          >
            <div className="font-bold flex items-center text-slate-800">
              {activity.has_profile_photo ? (
                <img
                  src={`/api/profile_photo/${activity.user}`}
                  className="rounded-full h-9 w-9"
                />
              ) : null}
              <a href={`/profile/${activity.username}`} className="ml-3">
                {activity.username}
              </a>{' '}
              <div className="ml-auto font-normal text-sm">
                {new Date(activity.time).toDateString()}
              </div>
            </div>

            <div className="m-2">
              <div className="m-1 my-4 flex gap-2 ">
                {circuitsOrder
                  .map((circuit_id) => circuits[circuit_id])
                  .map((circuit) => {
                    const circuitClimbCount = activity.climb_ids.filter(
                      (climbId) =>
                        sets[
                          routes[
                            climbs.find((climb) => climb.id === climbId)?.route
                          ]?.set_id
                        ]?.circuit_id === circuit.id,
                    ).length;

                    return (
                      circuitClimbCount > 0 && (
                        <div
                          key={circuit.id}
                          className={
                            'p-1 px-3 rounded-full text-white ' +
                            colorsPastel[circuits[circuit.id].color]
                          }
                        >
                          {circuitClimbCount}{' '}
                          {circuitClimbCount > 1 ? 'sends' : 'send'}
                        </div>
                      )
                    );
                  })
                  .reverse()
                  }
              </div>
              <div className="flex flex-col bg-white m-auto p-auto mt-5 relative">
                <div className="flex overflow-x-scroll pb-8 hide-scroll-bar">
                  <div className="flex gap-4 flex-nowrap">
                    {activity.climb_ids
                    .sort((climbid_a, climbid_b) => {
                      const climb_a = climbs.find((c) => c.id === climbid_a);
                      const climb_b = climbs.find((c) => c.id === climbid_b);
                      const index_a = circuitsOrder.indexOf(sets[routes[climb_a.route].set_id].circuit_id);
                      const index_b = circuitsOrder.indexOf(sets[routes[climb_b.route].set_id].circuit_id);
                      return index_b - index_a;
                    })
                    .map((climbId) => {
                      const climb = climbs.find((c) => c.id === climbId);
                      const index = circuitsOrder.indexOf(
                        sets[routes[climb
                          .route]
                          .set_id]
                        .circuit_id
                      );
                      return (
                        climb && (
                          <RouteCardProfile
                            key={climb.route + climbId}
                            route={routes[climb.route]}
                            circuits={circuits}
                            sets={sets}
                            climb={climb}
                            setSidebarRoute={openSidebar}
                          />
                        )
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex">
              {activity.reactions.length == 0 ? (
                <span className="text-gray-400 text-sm font-semibold py-2">
                  Be the first to bump
                </span>
              ) : (
                <span
                  className="flex ml-4"
                  onClick={() => {
                    openUserList(activity.reactions);
                  }}
                >
                  {activity.reactions
                    .filter((user) => user.has_profile_photo)
                    .slice(0, 5)
                    .map((user) => (
                      <img
                        key={user.username}
                        src={`/api/profile_photo/${user.id}`}
                        className="w-8 h-8 rounded-full -ml-4 border-2 border-white shadow-sm"
                      />
                    ))}
                  <span className="text-gray-400 text-sm font py-2 ml-2">
                    {activity.reactions.length}

                    {activity.reactions.length == 1 ? ' bump' : ' bumps'}
                  </span>
                </span>
              )}

              {!activity.reactions.find(
                (react) => react.username === user.data?.username,
              ) ? (
                <button
                  onClick={() => {
                    createReactionMutation.mutate({ activity_id: activity.id });
                  }}
                  className="ml-auto cursor-pointer bg-gray-50 text-gray-600 border rounded-xl px-2 py-1  hover:bg-gray-100"
                >
                  <span className="saturate-0 text-xl">👊</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    deleteReactionMutation.mutate({ activity_id: activity.id });
                  }}
                  className="ml-auto cursor-pointer bg-amber-100 text-gray-600 border rounded-xl px-2 py-1  hover:bg-amber-200 border-amber-500"
                >
                  <span className="text-xl">👊</span>
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="flex justify-center mt-4">
          {activitiesQuery.hasNextPage && (
            <div className="flex items-center justify-center py-4">
              <button onClick={() => activitiesQuery.fetchNextPage()}>
                {activitiesQuery.isFetchingNextPage
                  ? 'Loading...'
                  : 'Load More Activities'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
