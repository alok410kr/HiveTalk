import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(
    req:Request
){
    try{
        const profile = await currentProfile();
        const {name, type} = await req.json();
        const {searchParams} =new URL(req.url);

        const serverId = searchParams.get("serverId");

        if(!profile){
            return new NextResponse("Unauthorized",{status:401});
        }

        // Rate limiting: 20 channel creations per hour
        const rateLimitResult = await checkRateLimit("channelCreate", profile.id);
        
        if (!rateLimitResult.success) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "Rate limit exceeded. You can only create 20 channels per hour.",
                    retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
                }), 
                { 
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        ...getRateLimitHeaders(rateLimitResult)
                    }
                }
            );
        }

        if(!serverId){
            return new NextResponse("Server ID is missing",{status:400});
        }

        if(name === "general"){
            return new NextResponse("Channel name cannot be 'general'",{status:400});
        }

        const server= await db.server.update({
            where:{
                id:serverId,
                members:{
                    some:{
                        profileId:profile.id,
                        role:{
                            in: [MemberRole.ADMIN,MemberRole.MODERATOR]
                        }
                    },
                },
                },
                data:{
                    channels:{
                        create:{
                            profileId:profile.id,
                            name,
                            type,
                        }
                    }
                }
            });

            return NextResponse.json(server);
    }catch(error){
        console.log("CHANNELS_POST",error);
        return new NextResponse("Internal Error",{status:500});
    }
}