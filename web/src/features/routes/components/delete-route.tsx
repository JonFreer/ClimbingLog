import { useState } from 'react';
import DangerDialog from '@/components/ui/modals/modal-dialogs';
import { useDeleteRoute } from '../api/delete-route';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/ui/notifications';

export const DeleteRoute = ({ id }: { id: string }) => {
  const { addNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  const deleteCommentMutation = useDeleteRoute({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Route Deleted',
        });
        setOpen(false);
      },
    },
  });

  return (
    <>
      <button
        className="ml-2 text-gray-300 p-2 hover:text-gray-700 hover:bg-gray-200 rounded-md"
        onClick={() => setOpen(true)}
      >
        <TrashIcon aria-hidden="true" className="h-5 w-5" />
      </button>
      <DangerDialog
        title={'Delete route'}
        body={
          'Are you sure you want to delete this route? This route will be removed for everybody and cannot be undone.'
        }
        actionCallback={() => deleteCommentMutation.mutate({ routeId: id })}
        cancleCallback={() => setOpen(false)}
        open={open}
        action_text="Delete route"
      />
    </>
  );
};
