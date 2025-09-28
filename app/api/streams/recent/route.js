// app/api/streams/recent/route.js

import { NextResponse } from 'next/server';

const SSB_STREAMERS = ['adinross', 'cheesur', 'cuffem', 'konvy', 'shnaggyhose'];

export async function GET() {
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Fetch all VODs from all streamers concurrently
        const allVodsPromises = SSB_STREAMERS.map(channel =>
            fetch(`https://kick.com/api/v2/channels/${channel}/videos`)
                .then(res => res.json())
                .catch(err => {
                    console.error(`Failed to fetch VODs for ${channel}`, err);
                    return []; // Return empty array on error for a specific channel
                })
        );
        
        const allVodsArrays = await Promise.all(allVodsPromises);
        
        // Flatten the array of arrays into a single array of VODs
        const combinedVods = allVodsArrays.flat();

        // Filter for VODs within the last 5 days and add streamer name
        const recentVods = combinedVods.filter(vod => {
            return vod && new Date(vod.created_at) > fiveDaysAgo;
        }).map(vod => ({
            id: vod.id,
            title: vod.session_title,
            thumbnailUrl: vod.thumbnail.url,
            createdAt: vod.created_at,
            duration: vod.duration,
            streamer: vod.channel.username,
            videoUrl: vod.source,
        }));

        // Sort the final list by date, newest first
        recentVods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json(recentVods, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch recent streams:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
