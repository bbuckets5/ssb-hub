// app/api/streams/recent/route.js

import { NextResponse } from 'next/server';

const SSB_STREAMERS = ['adinross', 'cheesur', 'cuffem', 'konvy', 'shnaggyhose'];

export async function GET() {
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        let groupedVods = {};

        const fetchPromises = SSB_STREAMERS.map(async (channel) => {
            try {
                const res = await fetch(`https://kick.com/api/v2/channels/${channel}/videos`);
                if (!res.ok) {
                    console.error(`Kick API error for ${channel}: ${res.status}`);
                    groupedVods[channel] = []; // Add empty array for this channel on error
                    return;
                }

                const data = await res.json();
                const videos = data.videos || data || [];

                const recentVods = videos
                    .filter(vod => vod && new Date(vod.created_at) > fiveDaysAgo)
                    .map(vod => ({
                        id: vod.id,
                        title: vod.session_title,
                        thumbnailUrl: vod.thumbnail?.url,
                        createdAt: vod.created_at,
                        duration: vod.duration,
                        streamer: vod.channel?.username,
                        videoUrl: vod.source,
                    }));
                
                recentVods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                groupedVods[channel] = recentVods;

            } catch (err) {
                console.error(`Failed to process VODs for ${channel}`, err);
                groupedVods[channel] = []; // Ensure channel key exists even on error
            }
        });

        await Promise.all(fetchPromises);

        return NextResponse.json(groupedVods, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch recent streams:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
