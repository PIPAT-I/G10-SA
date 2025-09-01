import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import FullLayout from "../layout/Fullayout/index";
import Loadable from "../components/third-partry/Lodable";

const MainPages = Loadable(lazy(() => import("../pages/authentication/Login/login")));
const Profilepage = Loadable(lazy(() => import("../pages/User/profile")));
const Booklistpage = Loadable(lazy(() => import("../pages/User/booklist")));
const Passwordpage = Loadable(lazy(() => import("../pages/User/password")));
const Dashboardpage = Loadable(lazy(() => import("../pages/User/dashboard")));

const UserRoutes = (isLoggedIn: boolean): RouteObject => {
    return {
        path: "/",
        element: isLoggedIn ? <FullLayout role="user" /> : <MainPages />,
        children: [
            {
                path: "/",
                element: <Dashboardpage />,
            },
            {
                path: "/profile",
                element: <Profilepage />,
            },
            {
                path: "/booklist",
                element: <Booklistpage />,
            },
            {
                path: "/password-reset",
                element: <Passwordpage />,
            },
        ]
    };
}
export default UserRoutes;