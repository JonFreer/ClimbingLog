import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/16/solid";

export function Toast(props: {
  open: boolean;
  setToastOpen: (arg0: boolean) => void;
}) {
  if (!props.open) {
    return <></>;
  }
  return (
    <div className="flex bg-green-50 p-3 m-2 rounded-md">
      <div className="p-2">
        <CheckCircleIcon aria-hidden="true" className="size-5 text-green-400" />
      </div>

      <div className="ml-2 text-green-800 text-sm p-2">
        Sucessfully uploaded
      </div>
      <button
        className="rounded-md ml-auto hover:bg-green-100 p-2"
        onClick={() => props.setToastOpen(false)}
      >
        <XMarkIcon aria-hidden="true" className="size-5 text-green-500" />
      </button>
    </div>
  );
}
