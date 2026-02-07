import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { UserButton } from "@clerk/nextjs";

const NavigationSidebar = async() => {
    const profile= await currentProfile();

    if(!profile){
        return redirect("/");
    }

    const servers = await db.server.findMany({
        where:{ 
            members:{
                some:{
                    profileId:profile.id,
                },
            },
        }
    });

    

    return ( 
        <div className="space-y-4 flex flex-col items-center
        h-full text-primary w-full bg-[#15171a] py-4 shadow-[4px_0_10px_rgba(0,0,0,0.15)]"
        >
            <NavigationAction/>
            <Separator className="h-[2px] bg-zinc-600 rounded-md w-10 mx-auto" />
            <ScrollArea className="flex-1 w-full">
                {servers.map((server)=>(
                    <div key={server.id} className="mb-4">
                        <NavigationItem 
                            id={server.id}
                            name={server.name}
                            imageUrl={server.imageUrl}
                            
                        />
                        
                    </div>
                ))
                }
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle />

                <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-[48px] w-[48px] ring-2 ring-zinc-700"
                        }
                    }}
                />
            </div>
        </div>
     );
}
 
export default NavigationSidebar;

// {servers.map((server)=>{
//     console.log(server.imageUrl); // Add this line to log the imageUrl
//     return (
//         <div key={server.id} className="mb-4">
//             <NavigationItem 
//                 id={server.id}
//                 name={server.name}
//                 imageUrl={server.imageUrl}
//             />
//         </div>
//     );
// })}