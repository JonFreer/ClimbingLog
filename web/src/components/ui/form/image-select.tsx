import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

export function ImageSelect(props: {
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
        //scale and compress the image before sending it to the server
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

  const triggerFileInput = () => {
    const fileInput = document.getElementById(
      'upload-profile-pic',
    ) as HTMLInputElement;
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
              <UserCircleIcon
                aria-hidden="true"
                className="size-12 text-gray-300"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
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
