"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useParams,useRouter } from "next/navigation";

interface ServerSearchProps {
    data:{
        label:string;
        type:"channel"|"member",
            data:{
                icon: React.ReactNode;
                name: string;
                id: string;
            }[]|undefined;
    }[]
}

export const ServerSearch=({data}:ServerSearchProps)=>{
    const [open,setOpen]=useState(false);
    const router = useRouter();
    const params=useParams();

    useEffect(()=>{
        const down =(e:KeyboardEvent)=>{
            if((e.ctrlKey || e.metaKey)&& e.key==="k"){
                e.preventDefault();
                setOpen((open)=>!open);
            }
        }
        document.addEventListener("keydown",down);
        return ()=>document.removeEventListener("keydown",down);
    },[]);

    const onClick=({id,type}:{id:string,type:"channel"|"member"})=>{
        setOpen(false);
        if(type==="member"){
            return router.push(`/servers/${params?.serverId}/conversations/${id}`);
        }
        if(type==="channel"){
            return router.push(`/servers/${params?.serverId}/channels/${id}`);
        }
    }

    return(
        <>
            <button onClick={()=>{setOpen(true)}} className="group px-3 py-2 mx-2 my-2 rounded-md flex items-center gap-x-2 w-[calc(100%-16px)] bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors">
                
                <Search className="w-4 h-4 text-zinc-500" />
                <p className="font-medium text-sm text-zinc-400">
                    Search
                </p>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded bg-zinc-700 border border-zinc-600 px-1.5 font-mono text-[10px] font-medium text-zinc-500 ml-auto">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen} >
                <CommandInput placeholder="Search all channels and members"/>
                <CommandList>
                    <CommandEmpty>
                        No Results found
                    </CommandEmpty>
                    {data.map(({label, type, data})=>{
                        if(!data?.length) return null;

                        return (
                            <CommandGroup key={label} heading={label}>
                                {data?.map(({id,icon,name})=>{
                                    return (
                                        <CommandItem key={id} onSelect={()=>{onClick({id,type})}} >
                                            {icon}
                                            <span>{name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )
                    })}
                </CommandList>

            </CommandDialog>
        </>
    )
}