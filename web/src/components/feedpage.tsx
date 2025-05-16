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
import { useAllVideos } from '@/features/videos/api/get-all-videos';
import { Activity, Video } from '@/types/routes';
import { Beta } from '@/features/videos/components/beta';

export default function Feed() {
  const videos = useAllVideos().data || [];
  const activitiesQuery = useInfiniteActivities();

  const activities =
    activitiesQuery.data?.pages.flatMap((page) => page.data) || [];

  const videos_and_activities: (Activity | Video)[] = [
    ...activities,
    ...videos,
  ];

  videos_and_activities.sort((a, b) => {
    const dateA = new Date(a.time).getTime();
    const dateB = new Date(b.time).getTime();
    return dateB - dateA;
  });

  return (
    <>
      <div className="bg-white p-10 pt-6 pb-2 rounded-lg ">
        <div className="font-semibold text-xl">Send Feed</div>
      </div>
      <div className="bg-gray-100 sm:mb-8 mb-14">
        {videos_and_activities.map((activity_or_video) =>
          'climb_ids' in activity_or_video ? (
            <ActivityCard
              key={activity_or_video.id}
              activity={activity_or_video}
            />
          ) : (
            <VideoCard key={activity_or_video.id} video={activity_or_video} />
          ),
        )}

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

function VideoCard({ video }: { video: Video }) {
  const routes = useRoutes().data || {};
  const sets = useSets().data || {};
  const circuits = useCircuits().data?.data || {};

  return (
    <div className="bg-white p-4 mt-4 pb-2" key={video.username + video.time}>
      <div className="font-bold flex items-center text-slate-800">
        {video.has_profile_photo ? (
          <img
            src={`/api/profile_photo/${video.user}`}
            className="rounded-full h-9 w-9"
          />
        ) : null}
        <a href={`/profile/${video.username}`} className="ml-3">
          {video.username}
        </a>{' '}
        <div className="ml-auto font-normal text-sm">
          {new Date(video.time).toDateString()}
        </div>
      </div>

      <div className="m-2 mb-4">
        <div className="m-1 my-4 flex gap-2 ">
          <div
            className={
              'p-1 px-3 rounded-full text-white ' +
              colorsPastel[
                circuits[sets[routes[video.route].set_id].circuit_id].color
              ]
            }
          >
            New Beta
          </div>
        </div>
        <Beta video={video}></Beta>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const user = useUser();
  const routes = useRoutes().data || {};
  const sets = useSets().data || {};
  const circuits = useCircuits().data?.data || {};
  const circuitsOrder = useCircuits().data?.order || [];
  const climbs = useAllClimbs().data || [];
  const { openSidebar } = useSidebarState();
  const { openUserList } = useUserListState();

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

  return (
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
                    routes[climbs.find((climb) => climb.id === climbId)?.route]
                      ?.set_id
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
            })}
        </div>
        <div className="flex flex-col bg-white m-auto p-auto mt-5 relative">
          <div className="flex overflow-x-scroll pb-8 hide-scroll-bar">
            <div className="flex gap-4 flex-nowrap">
              {activity.climb_ids.map((climbId) => {
                const climb = climbs.find((c) => c.id === climbId);
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
  );
}
