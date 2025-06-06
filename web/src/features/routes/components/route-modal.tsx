import { Route, Circuit, Set } from '@/types/routes';
import { useEffect, useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { CreateRouteInput } from '../api/create-route';
import { UpdateRouteInput } from '../api/update-route';
import { colors, colorsBold, colorsHex } from '@/types/colors';
import { useGyms } from '@/features/gyms/api/get-gyms';
import MapDots, { Dot } from '@/components/ui/map/map-dot';
import { useRoutes } from '../api/get-routes';
import point_in_polygon from 'point-in-polygon';

export default function RouteModal(props: {
  set: Set;
  circuit: Circuit;
  route: Route | null;
  open: boolean;
  setRoute: UseMutationResult<
    Route,
    Error,
    {
      data: CreateRouteInput | UpdateRouteInput;
    },
    unknown
  >;
  setOpen: (bool: boolean) => void;
}) {
  const styles_list = [
    'Slab',
    'Vertical',
    'Overhang',
    'Arete',
    'Crack',
    'Mantle',
    'Dyno',
    'Jump',
    'Compression',
    'Pinch',
    'Crimp',
    'Jug',
    'Pocket',
    'Sloper',
    'Undercling',
    'Gaston',
    'Heel Hook',
    'Toe Hook',
    'Knee Bar',
    'Match',
    'Cross Through',
    'Drop Knee',
    'Lock Off',
    'Deadpoint',
    'Campus',
  ];
  const routes = useRoutes().data || {};
  const [location, setLocation] = useState<string>('');
  const [styles, setStyles] = useState<string[]>([]);
  const gym = (useGyms().data || {})[props.circuit.gym_id];

  const routes_in_set = Object.values(routes).filter(
    (route) => route.set_id == props.set.id,
  );

  const [dots, setDots] = useState<Dot[]>([]);
  const locations = gym.layout.areas.map((area) => area.name);

  const circuite_name = props.circuit.name || '';

  const num_routes_in_set = Object.values(routes).filter(
    (route) => route.set_id === props.set.id,
  ).length;

  const [formData, setFormData] = useState<{
    name: string;
    grade: string;
    img: File | null;
  }>({
    name: props.route
      ? props.route.name
      : circuite_name[0] + (num_routes_in_set + 1),
    grade: props.route ? props.route.name : '',
    img: null,
  });

  useEffect(() => {
    const areas = gym.layout.areas;
    const dot = dots[dots.length - 1];
    if (dot && areas.length > 0) {
      const area = areas.find((area) =>
        point_in_polygon(
          [dot.x, dot.y],
          area.points.map((p) => [p.x, p.y]),
        ),
      );
      if (area) {
        setLocation(area.name);
      }
    }
  }, [dots]);

  useEffect(() => {
    const circuite_name = props.circuit.name;
    const num_routes_in_set = Object.values(routes).filter(
      (route) => route.set_id === props.set.id,
    ).length;
    console.log('Circuit name: ', circuite_name);
    console.log('Number of routes in set: ', num_routes_in_set);
    setLocation(props.route ? props.route.location : '');
    setStyles(props.route ? props.route.style.split(',') : []);
    setFormData({
      name: props.route
        ? props.route.name
        : circuite_name[0] + (num_routes_in_set + 1),
      grade: props.route ? props.route.name : '',
      img: null,
    });
    setDots(
      routes_in_set
        .map((route) => ({
          x: route.x,
          y: route.y,
          isDragging: false,
          complete: false,
          radius: 4,
          draggable: false,
          color: colorsHex[props.circuit.color],
          id: '',
        }))
        .concat([
          {
            x: props.route ? props.route.x : 0,
            y: props.route ? props.route.y : 0,
            isDragging: false,
            complete: true,
            radius: 6,
            draggable: true,
            color: colorsHex[props.circuit.color],
            id: '',
          },
        ]),
    );
  }, [props.route, props.set.id, props.open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    props.setRoute.mutate({
      data: {
        route_id: props.route ? props.route.id : '',
        name: formData.name,
        location: location,
        grade: formData.grade,
        style: styles.join(','),
        set_id: props.set.id,
        x: dots[dots.length - 1].x.toString(),
        y: dots[dots.length - 1].y.toString(),
        file: formData.img,
      },
    });
  };

  return (
    <Dialog
      open={props.open}
      onClose={() => props.setOpen(false)}
      className="relative z-200"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:data-closed:translate-y-0 sm:data-closed:scale-95"
          >
            <form
              action="#"
              method="POST"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                      <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                    </div> */}
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      {props.route ? 'Edit Route' : 'Add a new route'}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 ">
                        {props.route
                          ? 'Update properties for existing route'
                          : 'Add a new route to the circuit'}
                      </p>
                    </div>

                    <div className="flex mt-3 items-center justify-between">
                      <label
                        htmlFor="name"
                        className="block text-sm/6 font-medium text-gray-900"
                      >
                        Route Location
                      </label>
                    </div>

                    <MapDots
                      dots={dots}
                      updateDots={(dots) => setDots(dots)}
                      setSelected={() => {}}
                      gym={gym}
                      selected_id={null}
                      editMode={true}
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="name"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Route Name
                        </label>
                      </div>

                      <div className="mt-2">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          defaultValue={
                            props.route
                              ? props.route?.name
                              : circuite_name[0] + (num_routes_in_set + 1)
                          }
                          required
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="location"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Location
                        </label>
                      </div>
                      <div className="mt-2 flex gap-2 flex-wrap grow justify-center">
                        {locations.map((loc) => (
                          <div
                            onClick={() => {
                              setLocation(loc);
                            }}
                            className={
                              'justify-center rounded-md  px-3 py-2 text-sm shadow-md sm:w-auto mb-1 cursor-pointer select-none ' +
                              (location === loc
                                ? `${colors[props.circuit.color]} hover:${
                                    colorsBold[props.circuit.color]
                                  } text-white`
                                : 'bg-white hover:bg-gray-100 text-gray-500')
                            }
                            key={loc}
                          >
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="style"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Style
                        </label>
                      </div>
                      <div className="mt-2 flex gap-2 flex-wrap grow justify-center">
                        {styles_list.map((loc) => (
                          <div
                            onClick={() =>
                              setStyles((prevStyles) =>
                                prevStyles.includes(loc)
                                  ? prevStyles.filter((style) => style !== loc)
                                  : [...prevStyles, loc],
                              )
                            }
                            className={
                              'justify-center rounded-md  px-3 py-2 text-sm shadow-md sm:w-auto mb-1 cursor-pointer select-none ' +
                              (styles.includes(loc)
                                ? `${colors[props.circuit.color]} hover:${
                                    colorsBold[props.circuit.color]
                                  } text-white`
                                : 'bg-white hover:bg-gray-100 text-gray-500')
                            }
                            key={loc}
                          >
                            {loc}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <ImageUpload
                        imageCallback={(image) => {
                          setFormData({ ...formData, img: image });
                        }}
                        defaultUrl={
                          props.route
                            ? '/api/img/' + props.route.id + '.webp'
                            : ''
                        }
                      ></ImageUpload>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  disabled={props.setRoute.isPending}
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto disabled:bg-gray-300"
                >
                  {props.route ? 'Update Route' : 'Add Route'}
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => props.setOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

function ImageUpload(props: {
  imageCallback: (image: File) => void;
  defaultUrl: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(props.defaultUrl);
  }, [props.defaultUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        //scale and compress the image bbefore sending it to the server
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxHeight = 1920;
          let { width, height } = img;

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const webpFile = new File([blob], 'image.webp', {
                  type: 'image/webp',
                });
                console.log(`WebP file size: ${webpFile.size} bytes`);
                setPreview(URL.createObjectURL(webpFile));
                props.imageCallback(webpFile);
              }
            },
            'image/webp',
            0.8, // Compression quality
          );
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-4 pt-6">
      <div
        id="image-preview"
        className="max-w-sm p-6 mb-4 bg-gray-100 border-dashed border-1 border-gray-300 rounded-lg items-center mx-auto text-center cursor-pointer"
      >
        <input
          id="upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <label htmlFor="upload" className="cursor-pointer">
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto mb-4" />
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8 text-gray-700 mx-auto mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-700">
                Upload picture
              </h5>
              <p className="font-normal text-sm text-gray-400 md:px-6">
                Choose photo size should be less than{' '}
                <b className="text-gray-600">2mb</b>
              </p>

              <span
                id="filename"
                className="text-gray-500 bg-gray-200 z-50"
              ></span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
