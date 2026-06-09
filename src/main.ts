import { Devvit } from "@devvit/public-api";
import { searchForLink, formatComments } from "./lib.js";

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
});

export default Devvit;

Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    if(!event.post?.id) return;

    const post = await context.reddit.getPostById(event.post.id);

    const matches = searchForLink(
      post.body ?? "",
      event.post.id,
      post.authorName ?? "",
      context,
    );

    if (matches.length === 0) {
      return;
    }

    const text = formatComments(matches);

    await context.reddit.submitComment({ id: event.post.id, text });

  }
})

Devvit.addTrigger({
  event: "CommentCreate",
  onEvent: async (event, context) => {
    if (!event.post?.id) return;
    if (!event.comment?.id) return;

    const comment = await context.reddit.getCommentById(event.comment.id);

    const matches = searchForLink(
      comment.body ?? "",
      event.comment.id,
      comment.authorName ?? "",
      context,
    );

    if (matches.length === 0) {
      return;
    }

    const text = formatComments(matches);

    await context.reddit.submitComment({ id: event.comment.id, text });
  }
})



Devvit.addTrigger({
  event: "CommentUpdate",
  onEvent: async (event, context) => {
    if (!event.post?.id) return;
    if (!event.comment?.id) return;

    const comment= await context.reddit.getCommentById(event.comment.id);

    const matches = searchForLink(
      comment.body ?? "",
      event.comment.id,
      comment.authorName ?? "",
      context,
    );

    if (matches.length === 0) {
      return;
    }

    const text = formatComments(matches);

    await context.reddit.submitComment({ id: event.comment.id, text });
  },
});



Devvit.addMenuItem({
  label: "Indie Wiki Buddy: Scan Post",
  location: "post",
  forUserType: "moderator",
  onPress: async (event, context) => {
    const post = await context.reddit.getPostById(event.targetId);

    const matches = searchForLink(
      post.body ?? "",
      event.targetId,
      post.authorName ?? "",
      context,
    );

    if (matches.length === 0) {
      context.ui.showToast("No fandom wiki links found.");
      return;
    }

    const text = formatComments(matches);

    await context.reddit.submitComment({ id: event.targetId, text });

    context.ui.showToast(
      `Posted redirect comment (${matches.length} link${matches.length > 1 ? "s" : ""}).`,
    );
  },
});
