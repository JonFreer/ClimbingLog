'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from '@headlessui/react';
import { HeartIcon as HeartIconFill } from '@heroicons/react/24/solid';
import { XMarkIcon, HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Route, UserList } from '@/types/routes';
import { colors, colorsBold, colorsPastel } from '@/types/colors';
import { useSets } from '@/features/sets/api/get-sets';
import { useClimbs } from '@/features/climbs/api/get-climbs';
import { useCircuits } from '@/features/circuits/api/get-circuits';
import { useDeleteClimb } from '@/features/climbs/api/delete-climb';
import { useCreateSend } from '@/features/climbs/api/create-send';
import { useCreateAttempt } from '@/features/climbs/api/create-attempt';
import { useProjects } from '@/features/projects/api/get-projects';
import { useCreateProject } from '@/features/projects/api/create-project';
import { useDeleteProject } from '@/features/projects/api/delete-project';
import { useSidebarState } from './sidebar-state';
import { useUserListState } from '../userlist/userlist-state';
import { api } from '@/lib/api-client';
import { CreateBeta } from '@/features/videos/components/create-beta';
import { BetaVideo } from '@/features/videos/components/beta';
import { useVideos } from '@/features/videos/api/get-videos';

export default function RouteSideBar() {
  const climbs = useClimbs().data ?? [];
  const projects = useProjects().data ?? [];

  const route_state = useSidebarState((state) => state.route);

  const closeCallback = useSidebarState((state) => state.closeSidebar);
  const deleteClimbMutation = useDeleteClimb({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const createSendMutation = useCreateSend({
    mutationConfig: {
      onSuccess: () => {
        setJustCompleted(true);
      },
    },
  });

  const createAttemptMutation = useCreateAttempt({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const createProjectMutation = useCreateProject({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const deleteProjectMutation = useDeleteProject({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const { openUserList, closeUserList } = useUserListState();
  const [sentBy, setSentBy] = useState<UserList>({ users: [], num_users: 0 });
  const [justCompleted, setJustCompleted] = useState(false);
  const [route, setRoute] = useState<Route>({
    id: '',
    name: '',
    location: '',
    style: '',
    set_id: '',
    x: 0,
    y: 0,
    grade: '',
    climb_count: 0,
    color: 'black',
    user_sends: 0,
    user_attempts: 0,
    gym_id: '',
  });

  const sets = useSets({ gym_id: route.gym_id || '' }).data ?? {};
  const circuits = useCircuits({ gym_id: route.gym_id || '' }).data?.data ?? {};
  const videosQuery = useVideos({ route_id: route.id || '' });
  const videos = videosQuery.data ?? [];

  useEffect(() => {
    const processingVideo = videos.some((video) => video.processed == false);
    if (processingVideo && videosQuery.data) {
      const interval = setInterval(() => {
        console.log('refetching videos');

        if (videosQuery.data.some((video) => video.processed == false)) {
          videosQuery.refetch();
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [videos, route_state]);

  async function updateSentBy() {
    if (route_state != null) {
      console.log('updateSentBy', route);
      try {
        const res = await api.get<UserList>(
          '/api/routes/sent_by/' + route_state.id,
        );
        setSentBy(res);
      } catch (error) {
        console.error('Error fetching sent by data:', error);
      }
    }
  }

  useEffect(() => {
    setJustCompleted(false);
  }, [route?.id]);

  useEffect(() => {
    if (route_state != null) {
      updateSentBy();
      setRoute(route_state);
    } else {
      closeUserList();
    }
  }, [route_state]);

  const complete = climbs.find(
    (climb) => climb.route == route.id && climb.sent == true,
  );
  const attempts = climbs.filter(
    (climb) => climb.route == route.id && climb.sent == false,
  );
  const sends = climbs.filter(
    (climb) => climb.route == route.id && climb.sent == true,
  );

  const circuit = circuits[sets[route.set_id]?.circuit_id];

  const open = route_state != null;

  const sent_by_imgs = sentBy.users
    .filter((user) => user.has_profile_photo)
    .slice(0, 3)
    .map((user) => user.id);

  return (
    <Dialog
      open={open}
      onClose={() => closeCallback()}
      className="relative z-100"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <TransitionChild>
                <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    onClick={() => closeCallback()}
                    className="relative rounded-md text-gray-300 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-white"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex h-full flex-col overflow-y-scroll bg-white  shadow-xl overflow-x-hidden">
                <div className="relative flex-1 ">
                  <div
                    className={
                      'relative p-4 flex justify-center items-center ' +
                      (circuit ? colorsPastel[circuit.color] || '' : '')
                    }
                  >
                    <div className="relative inline-block m-auto rounded-xl bg-white">
                      {complete ? (
                        <div className="absolute bg-green-600 text-white right-[-13px] top-[-13px] z-50 rounded-lg px-3 py-2 font-bold text-xl drop-shadow-lg m-2">
                          Sent
                        </div>
                      ) : (
                        ''
                      )}

                      <img
                        className={
                          'max-h-96 rounded-xl ' +
                          (justCompleted ? 'shimmer' : '')
                        }
                        src={'/api/img/' + route.id + '.webp'}
                      ></img>
                    </div>
                  </div>
                  <div className="p-8 pb-2 flex">
                    <DialogTitle className="p-2 text-base font-semibold text-gray-900">
                      {route.name}
                    </DialogTitle>

                    {!projects.includes(route.id) ? (
                      <button
                        onClick={() => {
                          createProjectMutation.mutate({
                            route_id: route.id,
                          });
                        }}
                        className="ml-auto  hover:bg-gray-100 hover:text-gray-500 text-gray-400 p-2 rounded-full flex items-center"
                      >
                        <HeartIcon aria-hidden="true" className="size-6" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          deleteProjectMutation.mutate({
                            route_id: route.id,
                          });
                        }}
                        className="ml-auto  hover:bg-red-100 hover:text-red-500 text-red-500 p-2 rounded-full flex items-center"
                      >
                        <HeartIconFill aria-hidden="true" className="size-6" />
                      </button>
                    )}
                  </div>

                  <div className="px-8 grid grid-cols-2 gap-4">
                    <div className="text-center py-2 ">
                      <span className="block text-sm font-medium text-gray-700">
                        Attempts
                      </span>
                      <span className="block text-xl font-semibold text-gray-900">
                        {attempts.length}
                      </span>
                    </div>
                    <div className="text-center py-2">
                      <span className="block text-sm font-medium text-gray-700">
                        Sends
                      </span>
                      <span className="block text-xl font-semibold text-gray-900">
                        {sends.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-8 pt-2 grid grid-cols-2 gap-4 ">
                    <button
                      onClick={() => {
                        createAttemptMutation.mutate({
                          route_id: route.id,
                        });
                      }}
                      className=" text-center rounded-md hover:bg-gray-100 hover:text-gray-900 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-500/30"
                    >
                      Add Attempt
                    </button>
                    <button
                      onClick={() => {
                        createSendMutation.mutate({ route_id: route.id });
                      }}
                      className={
                        'rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2  ' +
                        (circuit ? colors[circuit.color] || '' : '') +
                        ' ' +
                        (circuit
                          ? 'hover:' + colorsBold[circuit.color] || ''
                          : '')
                      }
                    >
                      Add Send
                    </button>
                  </div>

                  {sentBy.num_users != 0 ? (
                    <>
                      <DialogTitle className="px-10 pt-5 text-base font-semibold text-gray-600">
                        Sent By
                      </DialogTitle>
                      <div
                        className="px-10 pt-5 text-m mx-1 text-gray-600 hover:text-gray-500 flex cursor-pointer ml-6"
                        onClick={() => {
                          openUserList(sentBy.users);
                        }}
                      >
                        {sent_by_imgs.map((id) => (
                          <img
                            key={id}
                            className="w-10 h-10 rounded-full -ml-5 border-2 border-white shadow-sm"
                            src={'/api/profile_photo/' + id}
                          ></img>
                        ))}

                        <div className="ml-2 flex items-center flex-wrap">
                          {sentBy.users.length > 0 ? (
                            <a
                              key={sentBy.users[0].id}
                              className="font-semibold ml-1"
                            >
                              {sentBy.users[0].username}
                            </a>
                          ) : null}
                          {sentBy.users.length > 1 ? (
                            <a
                              key={sentBy.users[1].id}
                              className="font-semibold"
                            >
                              , {sentBy.users[1].username}
                            </a>
                          ) : null}
                          {sentBy.users.length > 1 && sentBy.num_users > 2 && (
                            <span className="ml-1">
                              and{' '}
                              <span className="font-semibold">
                                {sentBy.num_users - 2}{' '}
                                {sentBy.num_users - 2 == 1 ? 'other' : 'others'}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className="flex">
                    <div className="px-10 pt-5 text-base font-semibold text-gray-600">
                      Beta
                    </div>
                  </div>
                  <div className="mx-4 w-full overflow-x-scroll pb-2 hide-scroll-bar">
                    <div style={{ width: (videos.length + 1) * 45 + '%' }}>
                      {/*This is a hack, and needs to be fixed. It is to stop the sidebard stretching*/}
                      {videos.map((video) => (
                        <BetaVideo video={video} />
                      ))}
                      <CreateBeta route_id={route.id} />
                    </div>
                  </div>

                  {attempts.length + sends.length > 0 && (
                    <>
                      <DialogTitle className="px-10 pt-5 text-base font-semibold text-gray-600">
                        History
                      </DialogTitle>
                      <div className="m-4  mt-0 lg:ml-4 lg:mt-0 rounded-md p-4 max-h-42 divide-y divide-gray-200">
                        {climbs
                          .filter((climb) => climb.route == route.id)
                          .sort((a, b) => (a.time > b.time ? -1 : 1))
                          .map((climb) => (
                            <div
                              key={climb.id}
                              className="flex items-center justify-between p-2 bg-white "
                            >
                              <div className="text-sm text-gray-600">
                                {new Date(climb.time).toLocaleString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                })}
                              </div>
                              <div
                                className={`text-sm font-semibold ${
                                  climb.sent
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {climb.sent ? 'Send' : 'Attempt'}
                              </div>
                              <button
                                className="text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
                                onClick={() =>
                                  deleteClimbMutation.mutate({
                                    climb_id: climb.id,
                                  })
                                }
                              >
                                <TrashIcon
                                  aria-hidden="true"
                                  className="h-5 w-5"
                                />
                              </button>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
