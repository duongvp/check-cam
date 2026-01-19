import MainLayout from "@/layouts/MainLayout"
import { handleMapRoutes } from "@/helpers/handleMapRoutes"
import type { RouteObject } from "react-router-dom"
import { items } from "@/components/app-sidebar"

console.log("...handleMapRoutes(items, true)", handleMapRoutes(items, true));

export const routes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            ...handleMapRoutes(items, true), // 👈 Tự động map toàn bộ route,
            // {
            //     path: "settings/users",
            //     element: <div>Users Page</div>,
            // },
            // {
            //     path: "settings/reports",
            //     element: <div>Roles Page</div>,
            // },
            // {
            //     path: "settings/users/roles/edit",
            //     element: <div>Edit Role</div>,
            // },
        ],
    },
]
