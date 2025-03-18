import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { User } from '../types/routes'
import { useEffect, useState } from 'react';
import { Toast } from './toast';

export default function Settings(props:{user:User | false}) {

  if(props.user == false){
    return;
  }
    const [toastOpen, setToastOpen] = useState(false);
    const [usernameError, setUserNameError] = useState(false);
    const [formData, setFormData] = useState({
          username: props.user.username,
          about:props.user.about,
          profile_visible: props.user.profile_visible,
          send_visible: props.user.send_visible,
      });
  
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>) => {
          const { name, value } = e.target;
          const newValue = e.target.type === 'checkbox' ? e.target.checked : value;
          setFormData({
              ...formData,
              [name]: newValue
          });
      };

      const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setUserNameError(false);
        e.preventDefault();
        console.log(formData);
        fetch('api/users/me', {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        })
        .then(response =>{
            if (response.ok) {
                setToastOpen(true);
            return response.json();
            } else if (response.status === 400) {
            return response.json().then(errorData => {
                if(errorData.detail ==='UPDATE_USERNAME_ALREADY_EXISTS'){
                  setUserNameError(true);
                }
                throw new Error(errorData.detail);
            });
            } else {
            throw new Error('Network response was not ok');
            }  
        }      
        )
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error(error);
        });
      };
  

  return (
    <form className='m-8' onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed publicly so be careful what you share.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                @
                  <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm/6"></div>
                  <input
                    onChange={handleChange}
                    id="username"
                    name="username"
                    type="text"
                    placeholder="janesmith"
                    defaultValue={props.user.username}
                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                  />
                </div>
              </div>
              {usernameError?
              <div className="flex bg-red-50 p-3 m-2 rounded-md">
                <div className="text-red-800 text-sm p-2">A user with this username already exists.</div>
              </div>:<></>}
            </div>

            <div className="col-span-full">
              <label htmlFor="about" className="block text-sm/6 font-medium text-gray-900">
                About
              </label>
              <p className="mt-3 text-sm/6 text-gray-600">Write a few sentences about yourself.</p>

              <div className="mt-2">
                <textarea
                  onChange={handleChange}
                  id="about"
                  name="about"
                  rows={3}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  defaultValue={props.user.about}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900">
                Photo
              </label>
              <ImageUploadProfilePic imageCallback={(image)=>console.log(image)} defaultUrl={""}/>
            </div>

            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm/6 font-medium text-gray-900">
                Cover photo
              </label>
              <ImageUpload imageCallback={(image)=>console.log(image)} defaultUrl={""}/>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Visibility</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Control what information is shared with others.
          </p>

          <div className="mt-10 space-y-10">
            <fieldset>
              <legend className="text-sm/6 font-semibold text-gray-900">Share</legend>
              <div className="mt-6 space-y-6">
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        defaultChecked={props.user.profile_visible}
                        onChange={handleChange}
                        id="profile_visible"
                        name="profile_visible"
                        type="checkbox"
                        aria-describedby="comments-description"
                        className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-[:checked]:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-[:indeterminate]:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm/6">
                    <label htmlFor="comments" className="font-medium text-gray-900">
                      Profile
                    </label>
                    <p id="comments-description" className="text-gray-500">
                      Your profile information is visible to other users.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        defaultChecked={props.user.send_visible}
                        onChange={handleChange}
                        id="send_visible"
                        name="send_visible"
                        type="checkbox"
                        aria-describedby="candidates-description"
                        className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-[:checked]:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-[:indeterminate]:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm/6">
                    <label htmlFor="candidates" className="font-medium text-gray-900">
                      Sends
                    </label>
                    <p id="candidates-description" className="text-gray-500">
                      Your username will appear on the route page when you send a route.
                    </p>
                  </div>
                </div>
               
              </div>
            </fieldset>

          </div>
        </div>
      </div>
      <Toast open={toastOpen} setToastOpen={(bool)=>setToastOpen(bool)}/>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {/* <button type="button" className="text-sm/6 font-semibold text-gray-900">
          Cancel
        </button> */}
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </form>
  )
}


function ImageUpload(props:{imageCallback: (image: File) => void, defaultUrl: string}) {

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(props.defaultUrl);
  },[props.defaultUrl])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        //scale and compress the image bbefore sending it to the server
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

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
                const webpFile = new File([blob], "image.webp", {
                  type: "image/webp",
                });
                console.log(`WebP file size: ${webpFile.size} bytes`);
                setPreview(URL.createObjectURL(webpFile));
                props.imageCallback(webpFile);
                
                //send the request 
                
                const formData = new FormData();
                formData.append('file', webpFile);

                fetch('/api/users/me/update_cover_photo', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                })
                .then(response => response.json())
                .then(data => {
                  console.log('Success cover photo:', data);
                })
                .catch((error) => {
                  console.error('Error cover photo:', error);
                });
                
              }
            },
            "image/webp",
            0.8 // Compression quality
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
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300" />
              <div className="mt-4 flex text-sm/6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          )}
        </label>
      </div>
    </div>
  );
}


function ImageUploadProfilePic(props:{imageCallback: (image: File) => void, defaultUrl: string}) {

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(props.defaultUrl);
  },[props.defaultUrl])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        //scale and compress the image before sending it to the server
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

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
                const webpFile = new File([blob], "image.webp", {
                  type: "image/webp",
                });
                console.log(`WebP file size: ${webpFile.size} bytes`);
                setPreview(URL.createObjectURL(webpFile));
                props.imageCallback(webpFile);
                
                //send the request 
                
                const formData = new FormData();
                formData.append('file', webpFile);

                fetch('/api/users/me/update_profile_photo', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                })
                .then(response => response.json())
                .then(data => {
                  console.log('Success profile photo:', data);
                })
                .catch((error) => {
                  console.error('Error profile photo:', error);
                });
                
              }
            },
            "image/webp",
            0.8 // Compression quality
          );
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById("upload-profile-pic") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="px-4 pt-6">
      <div
        id="image-preview"
        className="max-w-sm p-6 mb-4 bg-gray-100 border-dashed border-1 border-gray-300 rounded-lg items-center mx-auto text-center cursor-pointer"
      >
        <input
          id="upload-profile-pic"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <label htmlFor="upload-profile-pic" className="cursor-pointer">
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto mb-4" />
          ) : (
            <div className="mt-2 flex items-center gap-x-3">
            <UserCircleIcon aria-hidden="true" className="size-12 text-gray-300" />
            <button
              type="button"
              onClick={triggerFileInput}
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Change
            </button>
          </div>
          )}
        </label>
      </div>
    </div>
  );
}



