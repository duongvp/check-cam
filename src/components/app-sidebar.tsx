import { ChevronDown } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { MenuItem } from "@/types/menu"
import Dashboard from "@/features/dashboard/page"
import SplitVoice from "@/features/splitVoice/page"
import { Link } from "react-router-dom"

// Menu items
// export const items = [
//     { title: "dashboard", path: "/", element: <Dashboard /> },
//     {
//         title: "settings",
//         // path: "/settings",
//         // element: <div>settings Page</div>,
//         children: [
//             {
//                 title: "Users",
//                 // path: "/settings/users",
//                 // element: <div>Users Page</div>,
//                 children: [
//                     {
//                         title: "Roles",
//                         // path: "/settings/users/roles",
//                         // element: <div>Roles Page</div>,
//                         children: [
//                             { title: "Edit", path: "/settings/users/roles/edit", element: <div>Edit Role</div> },
//                         ],
//                     },
//                 ],
//             },
//             { title: "Reports", path: "/settings/reports", element: <div>Reports Page</div> },
//         ],
//     },
//     { title: "Inbox", path: "/inbox", element: <div>Inbox Page</div> },
//     { title: "Calendar", path: "/calendar", element: <div>Calendar Page</div> },
//     { title: "Search", path: "/search", element: <div>Search Page</div> },
// ]

// export const items2 = [
//     {
//         title: "soray",
//         path: "/soray",
//         element: <div>soray Page</div>,
//         children: [
//             {
//                 title: "model",
//                 path: "/soray/model",
//                 element: <div>model Page</div>,
//                 children: [
//                     {
//                         title: "rotate",
//                         path: "/settings/model/rotate",
//                         element: <div>rotate Page</div>,
//                         children: [
//                             { title: "Edit", path: "/settings/users/rotate/edit", element: <div>Edit Role</div> },
//                         ],
//                     },
//                 ],
//             },
//             { title: "message", path: "/chat/message", element: <div>message Page</div> },
//         ],
//     },
// ]


export const items: MenuItem[] = [
    { title: "Dashboard", path: "/", element: <Dashboard /> },
    { title: "Split Voice", path: "/split-voice", element: <SplitVoice /> },
    {
        title: "Settings",
        children: [
            {
                title: "Users",
                children: [
                    {
                        title: "Roles",
                        children: [
                            { title: "Edit", path: "/settings/users/roles/edit", element: <div>Edit Role</div> },
                        ],
                    },
                ],
            },
            { title: "Reports", path: "/settings/reports", element: <div>Reports Page</div> },
        ],
    },
    { title: "Calendar", path: "/calendar", element: <div>Calendar Page</div> },
    { title: "Search", path: "/search", element: <div>Search Page</div> },
]

export const items2: MenuItem[] = [
    {
        title: "soray",
        children: [
            {
                title: "model",
                children: [
                    {
                        title: "rotate",
                        children: [
                            { title: "Edit", path: "/settings/users/rotate/edit", element: <div>Edit rotate</div> },
                        ],
                    },
                ],
            },
            { title: "message", path: "/chat/message", element: <div>message Page</div> },
        ],
    },
]

export const sidebarGroups = [
    {
        label: "Menu",
        items,
    },
    {
        label: "ChatGPT",
        items: items2,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                {sidebarGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>{renderMenuItems(group.items)}</SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}

// Hàm đệ quy render menu
function renderMenuItems(items: any[]) {
    return items.map((item) => {
        if (item.children && item.children.length > 0) {
            return (
                <Collapsible key={item.title}>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                {item.icon && <item.icon className="h-4 w-4" />}
                                <span>{item.title}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenu>
                            {item.children.map((child: any) => (
                                <SidebarMenuItem key={child.title} className="pl-4 border-l">
                                    {renderMenuItems([child])}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </CollapsibleContent>

                </Collapsible>
            )
        }

        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                    <Link to={item.path}>
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    })
}
