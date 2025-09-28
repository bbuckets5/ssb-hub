// app/api/streams/recent/route.js

import { NextResponse } from 'next/server';

const SSB_STREAMERS = ['adinross', 'cheesur', 'cuffem', 'konvy', 'shnaggyhose'];

export async function GET() {
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const allVodsPromises = SSB_STREAMERS.map(channel =>
            fetch(`https://kick.com/api/v2/channels/${channel}/videos`)
                .then(res => {
                    if (!res.ok) {
                        console.error(`Kick API returned an error for ${channel}: ${res.status}`);
                        return null;
                    }
                    return res.json();
                })
                // --- NEW: This step "opens the envelope" to get the actual video list ---
                .then(data => {
                    if (!data) return [];
                    // Kick API might return the array directly, or nested under a 'videos' key
                    return data.videos || data || []; 
                })
                .catch(err => {
                    console.error(`Failed to fetch VODs for ${channel}`, err);
                    return [];
                })
        );
        
        const allVodsArrays = await Promise.all(allVodsPromises);
        
        const combinedVods = allVodsArrays.flat();

        const recentVods = combinedVods.filter(vod => {
            return vod && new Date(vod.created_at) > fiveDaysAgo;
        }).map(vod => ({
            id: vod.id,
            title: vod.session_title,
            thumbnailUrl: vod.thumbnail?.url,
            createdAt: vod.created_at,
            duration: vod.duration,
            streamer: vod.channel?.username,
            videoUrl: vod.source,
        }));

        recentVods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json(recentVods, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch recent streams:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
