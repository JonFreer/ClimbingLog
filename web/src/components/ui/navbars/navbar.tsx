import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { useLogout, useUser } from '@/lib/auth';
import { GymDropDown } from '@/features/gyms/components/gym-dropdown';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function NavBar() {
  const user = useUser();
  const logout = useLogout({
    onSuccess: () => {
      console.log('Logout success');
    },
  });

  const navigation = [
    { name: 'Dashboard', href: '/', current: false },
    { name: 'Feed', href: '/feed', current: false },
  ];

  if (user.data && user.data.is_superuser) {
    navigation.push({ name: 'Admin', href: '/admin', current: false });
  }

  if (user.data && user.data.route_setter) {
    navigation.push({
      name: 'Route Setting',
      href: '/route_setting',
      current: false,
    });
  }

  const [, setPath] = useState<string | undefined>(undefined);

  return (
    <Popover as="nav" className="relative bg-none z-100">
      <div className="relative mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 z-130">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <PopoverButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-gray-500">
              {/* <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span> */}
              {({ open }) => (
                <>
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {!open ? (
                    <span
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                      className="material-symbols-rounded text-gray-800"
                    >
                      menu
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                      className="material-symbols-rounded text-gray-800"
                    >
                      keyboard_arrow_down
                    </span>
                  )}
                </>
              )}
            </PopoverButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              {window.location.pathname != '/' ? (
                <img
                  alt="VolumeDB"
                  src="/logo.svg"
                  className="h-8 w-auto" // This will invert the colors and apply a hue shift to the SVG
                />
              ) : (
                <GymDropDown />
              )}
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    aria-current={
                      item.href === window.location.pathname
                        ? 'page'
                        : undefined
                    }
                    onClick={() => setPath(item.href)}
                    className={classNames(
                      item.href === window.location.pathname
                        ? 'bg-gray-200 text-gray-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
                      'rounded-md px-3 py-2 text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {user.data ? (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {/* <button
                type="button"
                className="relative rounded-full bg-none p-1 text-indigo-200 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6" />
              </button> */}

              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex rounded-full bg-none text-sm focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-500">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    {user.data.has_profile_photo ? (
                      <img
                        className="rounded-full size-8"
                        onError={(e) =>
                          (e.currentTarget.style.display = 'none')
                        }
                        src={`/api/profile_photo/${user.data.id}`}
                      />
                    ) : (
                      <UserCircleIcon
                        aria-hidden="true"
                        className="size-8 text-gray-300"
                      />
                    )}
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75 data-enter:ease-out data-leave:ease-in"
                >
                  <MenuItem>
                    <NavLink
                      onClick={() => setPath('/profile')}
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Your Profile
                    </NavLink>
                  </MenuItem>
                  <MenuItem>
                    <NavLink
                      onClick={() => setPath('/settings')}
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Settings
                    </NavLink>
                  </MenuItem>
                  <MenuItem>
                    <div
                      onClick={() => {
                        logout.mutate(undefined, {
                          onSuccess: () => {
                            console.log('Logout success');
                          },
                        });
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    >
                      Sign out
                    </div>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          ) : (
            <div className="absolute inset-y-0 top-3 right-0">
              <NavLink
                onClick={() => setPath('/login')}
                to={'/login'}
                // aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  'inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 sm:ml-3 sm:w-auto',
                )}
              >
                + Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
      <PopoverBackdrop className="fixed inset-0 bg-black/15 z-100" />

      <PopoverPanel
        transition
        className="absolute inset-x-0 -top-10 origin-top rounded-b-2xl bg-gray-50 px-6 pt-30 pb-6 shadow-2xl shadow-gray-900/20
        transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 z-120 animate-[bounce-down_0.5s_ease-out]"
        style={{
          animation: 'bounce-down 0.4s ease-out',
        }}
      >
        {/* <div className="space-y-1 px-2 pb-3 pt-2"> */}
        {navigation.map((item) => (
          <NavLink
            onClick={() => setPath(item.href)}
            key={item.name}
            to={item.href}
            aria-current={
              item.href === window.location.pathname ? 'page' : undefined
            }
            className={classNames(
              item.href === window.location.pathname
                ? 'bg-gray-200 text-gray-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              'block rounded-md px-3 py-2 text-base font-medium mt-1',
            )}
          >
            {item.name}
          </NavLink>
        ))}
        {/* </div> */}
      </PopoverPanel>
    </Popover>
  );
}
