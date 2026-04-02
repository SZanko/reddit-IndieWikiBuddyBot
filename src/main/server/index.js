import { Devvit } from '@devvit/public-api';
const COOLDOWN_SECONDS = 10;
Devvit.addTrigger({
    event: 'CommentSubmit',
    onEvent: async (event, ctx) => {
        const comment = event.comment;
        if (!comment)
            return;
        // Don't reply to ourselves
        const me = await ctx.reddit.getCurrentUser();
        if (comment.authorName === me.username)
            return;
        // Simple rate-limit per post
        const key = `last-reply:${comment.postId}`;
        const last = await ctx.kv.get(key);
        const now = Math.floor(Date.now() / 1000);
        if (last && now - last < COOLDOWN_SECONDS)
            return;
        // Trigger phrase example
        const body = (await comment.getBody())?.toLowerCase() ?? '';
        if (body.includes('!hello')) {
            await comment.reply('👋 Hi there! I am a Devvit bot.');
            await ctx.kv.put(key, now, { ttl: 60 }); // prevent spam for 60s
        }
    },
});
export default Devvit;
