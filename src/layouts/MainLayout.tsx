import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/app-sidebar';
import { ModeToggle } from "@/components/mode-toggle";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

const MainLayout = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 p-2">
                <div className="flex flex-col h-full">
                    <div className="flex flex-col">
                        <div className="flex justify-between align-center">
                            <SidebarTrigger />
                            <ModeToggle />
                        </div>
                        <div className="mb-4">
                            {/* <AppBreadcrumb /> */}
                        </div>
                    </div>
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}

export default MainLayout;
