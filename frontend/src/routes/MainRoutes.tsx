import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import MinimalLayout from "../layout/MinimalLayout";
import Loadable from "../components/third-partry/Lodable";

const LoginPage = Loadable(lazy(() => import("../pages/authentication/Login/login")));

const MainRoutes = (): RouteObject => {
  return {
    path: "/",
    element: <MinimalLayout />, // Layout ต้องมี <Outlet /> ด้วย
    children: [
      { path: "/", element: <LoginPage /> },
      { path: "*", element: <LoginPage /> }, // redirect ทุก route ไม่รู้จักไปหน้า login
    ],
  };
};

export default MainRoutes;
