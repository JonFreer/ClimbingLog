import { useState } from 'react';
import DangerDialog from '@/components/ui/modals/modal-dialogs';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/ui/notifications';
import { useDeleteVideo } from '../api/delete-videos';

export const DeleteVideo = ({
  id,
  route_id,
}: {
  id: string;
  route_id: string;
}) => {
  const { addNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  const deleteCommentMutation = useDeleteVideo({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Video Deleted',
        });
        setOpen(false);
      },
    },
    route_id,
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="size-10 bg-gray-50 absolute -right-0 -bottom-0 rounded-br-lg rounded-tl-lg cursor-pointer hover:bg-gray-100"
      >
        <TrashIcon className="text-gray-300 size-6 m-2" />
      </button>
      <DangerDialog
        title={'Delete video'}
        body={
          'Are you sure you want to delete this video? This video will be removed for everybody and cannot be undone.'
        }
        actionCallback={() => deleteCommentMutation.mutate({ video_id: id })}
        cancleCallback={() => setOpen(false)}
        open={open}
        action_text="Delete video"
      />
    </>
  );
};
