import {v4 as uuidv4} from "uuid";
import { NextResponse } from "next/server";
import {currentProfile} from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        const {name,imageUrl} = await req.json();
        const profile = await currentProfile();
        if(!profile){
            return new NextResponse("Unauthorized",{status:401});
        }

        // Rate limiting: 5 server creations per hour
        const rateLimitResult = await checkRateLimit("serverCreate", profile.id);
        
        if (!rateLimitResult.success) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "Rate limit exceeded. You can only create 5 servers per hour.",
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

        const server = await db.server.create({
            data:{
                profileId:profile.id,
                name,
                imageUrl,
                inviteCode:uuidv4(),
                channels:{
                    create:[{
                        name:"general",
                        profileId:profile.id,
                    }
                ]
                },
                members:{
                    create:[{
                        profileId:profile.id,
                        role:MemberRole.ADMIN,
                    }]
                }
            }
        });
        return NextResponse.json(server);
    }catch(error){
        console.log("[SERVERS_POST]",error);
        return new NextResponse("Internal Error",{status:500});
    }
}