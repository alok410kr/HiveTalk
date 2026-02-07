"use client";

import {
  Dialog,
  DialogContent,

  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



import { useModal } from "@/hooks/use-modal-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import axios from "axios";

export const InviteModal = () => {
  const { onOpen,isOpen, onClose, type,data } = useModal();
  const origin = useOrigin();


  const isModalOpen = isOpen && type === "invite";
  const {server}=data;
  const [copied, setCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl =`${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

 const onNew = async () => {
  console.log("Server before update:", server); //debug
    if (!server || !server.id) {
        console.error("Server ID is undefined");
        return;
    }

    try {
      setIsLoading(true);
      console.log(`Sending PATCH request to /api/servers/${server?.id}/invite-code`);
      const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);
      console.log("Server update response:", response.data);
      onOpen("invite", { server: response.data });
  } catch (error) {
      console.error("Error sending PATCH request:", error);
  } finally {
      setIsLoading(false);
      console.log("Server updated:", server);
  }
};
// const onNew=async()=>{
//   try {
//       setIsLoading(true);
//       console.log("generate link error point 1");
//       const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);
//       onOpen("invite", { server: response.data });
      
  
//   }catch (error){
//     console.log("generate link error");
//     console.error(error);
//   }finally{
//     setIsLoading(false);
//   }

// }
  
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1e2124] text-zinc-100 p-0 overflow-hidden border-zinc-700">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
        
        </DialogHeader>
        <div className="p-6">
            <Label className="uppercase text-xs font-bold text-zinc-400">
                Server Invite Link
            </Label>
            <div className="flex items-center mt-2 gap-x-2">
                <Input disabled={isLoading} className="bg-zinc-800 border-0 focus-visible:ring-0 text-zinc-100 focus-visible:ring-offset-0" value={inviteUrl} readOnly />
            <Button disabled={isLoading} onClick={onCopy} size="icon" className="bg-zinc-700 hover:bg-zinc-600">
                {copied ? <Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}
                
            </Button>

            </div>

            <Button 
                onClick={onNew}
                disabled={isLoading}
                variant="link" 
                size="sm"
                className="text-xs text-zinc-500 mt-4"    
            >
                Generate a new Link
                <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
