import { NavLink } from "react-router-dom";

import type { menuItem } from "../interfaces/definitions";

const Menu = ({ label, routerLink }: menuItem) => {
  return (
    <>
      <li
        className="cursor-pointer flex border-2 border-gray-600 
                   rounded-md hover:bg-black hover:text-blue-600 p-1 
                 bg-blue-400 w-full text-black justify-center m-0 m1-auto"
        // onClick={() => {}}
      >
        <NavLink
          to={routerLink}
          className="w-full hover:text-white text-[0.675rem] text-center m-auto"
        >
          {/* <Icon iconUrl={icon} subpath={path} alt={label} /> */}
          {label}
        </NavLink>
      </li>
    </>
  );
};

export default Menu;
