import { useState } from 'react';
import { useNotifications } from '../../../components/ui/notifications';
import { useDeleteCircuit } from '../api/delete-circuit';
import DangerDialog from '../../../components/ui/modals/modal-dialogs';
import { TrashIcon } from '@heroicons/react/24/outline';

type CreateSetProps = {
  circuit_id: string;
};

export const DeleteCircuit = ({ circuit_id }: CreateSetProps) => {
  const [open, setOpen] = useState(false);

  const { addNotification } = useNotifications();

  const deleteCircuitMutation = useDeleteCircuit({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Circuit Deleted',
        });
        setOpen(false);
      },
    },
  });

  return (
    <>
      <button
        className="mr-2 ml-auto text-gray-400 p-2 hover:text-gray-700 hover:bg-gray-100 rounded-md z-10"
        onClick={() => setOpen(true)}
      >
        <TrashIcon aria-hidden="true" className="h-5 w-5" />
      </button>
      <DangerDialog
        title={'Delete circuit'}
        body={
          'Are you sure you want to delete this circuit? This circuit will be removed for everybody and all routes belonging to it.'
        }
        actionCallback={() =>
          deleteCircuitMutation.mutate({ circuit_id: circuit_id })
        }
        cancleCallback={() => setOpen(false)}
        open={open}
        action_text="Delete circuit"
      />
    </>
  );
};
