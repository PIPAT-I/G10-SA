import { useRoutes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import MainRoutes from "./MainRoutes";

function ConfigRoutes() {
 const isLoggedIn = localStorage.getItem("isLogin") === "true";
  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    routes = [UserRoutes(isLoggedIn), MainRoutes()];
  } else {
    routes = [MainRoutes()]; // Pass isLoggedIn as a parameter to MainRoutes
  }

  return useRoutes(routes);
}

export default ConfigRoutes;
