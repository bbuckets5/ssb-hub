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
                        console.error(`Kick API error for ${channel}: ${res.status}`);
                        return null;
                    }
                    return res.json();
                })
                // --- MODIFIED: More intelligent data processing ---
                .then(data => {
                    if (!data || !data.videos) return []; // If no data or no videos array, return empty
                    
                    // Manually attach the top-level channel info to each video
                    return data.videos.map(video => ({
                        ...video,
                        channel: data.channel // Ensures every video has the channel info
                    }));
                })
                .catch(err => {
                    console.error(`Failed to process VODs for ${channel}`, err);
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
