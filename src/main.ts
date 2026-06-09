import { Devvit, SettingScope } from '@devvit/public-api';
import {searchForLink} from "./lib.js";

Devvit.configure({
    redditAPI: true,
    http: true,
    redis: true,
});

export default Devvit;

Devvit.addMenuItem({
    label: 'Indie Wiki Buddy: Scan Post',
    location: 'post',
    forUserType: 'moderator',
    onPress: async (event, context) => {
        const post = await context.reddit.getPostById(event.targetId);

        const linksInComment = await searchForLink(
            post.body ?? '',
            event.targetId,
            post.authorName,
            context
        )



        context.ui.showToast('Scan complete - check comment');
    }
})