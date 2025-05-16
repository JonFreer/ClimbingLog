import { useUser } from '@/lib/auth';
import { Video } from '@/types/routes';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { DeleteVideo } from './delete-video';

export function Beta({ video }: { video: Video }) {
  const [open, setOpen] = useState(false);
  const user = useUser();
  return (
    <>
      {video.processed ? (
        <div className="align-top mr-2 mt-2 max-w-30 w-30 h-30 inline-block relative">
          {user.data.id == video.user && (
            <DeleteVideo id={video.id} route_id={video.route} />
          )}
          <img
            onClick={() => {
              setOpen(true);
              console.log('open');
            }}
            className="max-w-30 w-30 h-30 rounded-lg border-2 border-white shadow-sm object-cover cursor-pointer"
            src={'/api/video_thumbnail/' + video.id}
          />
        </div>
      ) : (
        <div className="inline-block mt-2 mr-2 align-top w-30 h-30 rounded-lg bg-gray-100 border-2 border-white shadow-sm hover:bg-gray-200 cursor-pointer">
          <div className="flex justify-center items-center h-full">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-gray-500"
            >
              <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="0.75s"
                  values="0 12 12;360 12 12"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
        </div>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-100"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in my-auto sm:w-auto sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
            >
              <video controls autoPlay>
                <source src={'/api/video/' + video.id} type="video/mp4" />
              </video>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
