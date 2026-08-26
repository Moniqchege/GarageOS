import { NavLink, Outlet } from "react-router-dom";
import { Bell, Calendar, Gauge, Home, User } from "lucide-react";
const items=[{label:"Home",path:"/",icon:Home},{label:"Vehicle",path:"/vehicle",icon:Gauge},{label:"Book",path:"/book",icon:Calendar},{label:"Alerts",path:"/alerts",icon:Bell},{label:"Profile",path:"/profile",icon:User}];
export function CustomerLayout(){
    return (
    <div className="mx-auto min-h-screen max-w-md bg-[var(--bg)]">
        <main className="pb-20">
            <Outlet/>
        </main>
        <nav className="fixed bottom-0 left-1/2 z-50 flex h-16 w-full max-w-md -translate-x-1/2 border-t border-[var(--border)] bg-[var(--surface)]">{items.map(({label,path,icon:Icon})=>
        <NavLink 
          key={path} 
          to={path} 
          end={path==="/"} 
          className={({isActive})=>`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium ${isActive?"text-[var(--primary)]":"text-[var(--text-faint)]"}`}>
            <Icon size={18}/>
            {label}
        </NavLink>)}
        </nav>
    </div>
    )
}
