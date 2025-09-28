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
                    // Check if the response was successful
                    if (!res.ok) {
                        console.error(`Kick API returned an error for ${channel}: ${res.status}`);
                        return null; // Return null if the fetch failed
                    }
                    return res.json();
                })
                .catch(err => {
                    console.error(`Failed to fetch VODs for ${channel}`, err);
                    return null; // Return null on network error
                })
        );
        
        const allVodsResults = await Promise.all(allVodsPromises);
        
        // Filter out any null results from failed fetches
        const successfulVods = allVodsResults.filter(result => result !== null);
        const combinedVods = successfulVods.flat();

        const recentVods = combinedVods.filter(vod => {
            return vod && new Date(vod.created_at) > fiveDaysAgo;
        }).map(vod => ({
            // Using optional chaining (?.) to safely access properties
            id: vod.id,
            title: vod.session_title,
            thumbnailUrl: vod.thumbnail?.url, // Safe access
            createdAt: vod.created_at,
            duration: vod.duration,
            streamer: vod.channel?.username, // Safe access
            videoUrl: vod.source,
        }));

        recentVods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json(recentVods, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch recent streams:", error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
