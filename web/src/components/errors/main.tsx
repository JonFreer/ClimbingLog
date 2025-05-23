export const MainErrorFallback = () => {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center text-red-500"
      role="alert"
    >
      <h2 className="text-lg font-semibold">Ooops, something went wrong :( </h2>
      <button
        className="mt-4"
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.assign(window.location.origin);
        }}
      >
        Click here to reset the app
      </button>
    </div>
  );
};
