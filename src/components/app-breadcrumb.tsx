import { Link, useLocation } from "react-router-dom"
import { items, items2 } from "./app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import type { MenuItem } from "@/types/menu"

const allItems: MenuItem[] = [...items, ...items2]

// tìm chain cho breadcrumb
function findRouteChain(pathname: string, items: MenuItem[]): MenuItem[] {
    for (const item of items) {
        if (item.path === pathname) return [item]
        if (item.children) {
            const childChain = findRouteChain(pathname, item.children)
            if (childChain.length > 0) return [item, ...childChain]
        }
    }
    return []
}

export function AppBreadcrumb() {
    const location = useLocation()
    const chain = findRouteChain(location.pathname, allItems)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {chain.map((c, i) => {
                    const isLast = i === chain.length - 1
                    return (
                        <BreadcrumbItem key={c.title}>
                            {c.path ? (
                                <BreadcrumbLink asChild>
                                    <Link to={c.path}>{c.title}</Link>
                                </BreadcrumbLink>
                            ) : c.children ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1">
                                        {c.title}
                                        <ChevronDown className="h-3 w-3" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {c.children.map((child) => (
                                            <DropdownMenuItem key={child.title} asChild>
                                                <Link to={child.path || "#"}>{child.title}</Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <span>{c.title}</span>
                            )}
                            {!isLast && <BreadcrumbSeparator />}
                        </BreadcrumbItem>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
