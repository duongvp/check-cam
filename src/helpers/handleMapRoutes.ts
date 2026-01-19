import type { RouteObject } from "react-router-dom"

// ⚙️ Hàm convert items -> RouteObject[], auto chuẩn hóa path
const listRoutes: RouteObject[] = []

export function handleMapRoutes(items: any[], isRoot = false): RouteObject[] {
    items.map((item) => {
        if (item.path) {
            // ✅ Chuyển path con thành relative (trừ root)
            const normalizedPath = isRoot
                ? item.path.replace(/^\//, "") || "/"
                : item.path.replace(/^\//, "")

            const route: RouteObject = {
                path: normalizedPath,
                element: item.element,
            }

            listRoutes.push(route)
        }

        if (item.children) {
            handleMapRoutes(item.children, false)
        }
    })
    return listRoutes
}
