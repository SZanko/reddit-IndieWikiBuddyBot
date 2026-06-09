import { Devvit, type TriggerContext } from "@devvit/public-api";
import { searchForLink, formatComments } from "./lib.js";

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
});

export default Devvit;

async function replyWithMatches(
  body: string,
  id: string,
  authorName: string,
  context: TriggerContext,
): Promise<boolean> {
  const matches = searchForLink(body, id, authorName, context);
  if (matches.length === 0) return false;
  const text = formatComments(matches);
  await context.reddit.submitComment({ id, text });
  return true;
}

Devvit.addTrigger({
  event: "PostCreate",
  onEvent: async (event, context) => {
    if (!event.post?.id) return;
    const post = await context.reddit.getPostById(event.post.id);
    await replyWithMatches(
      post.body ?? "",
      event.post.id,
      post.authorName ?? "",
      context,
    );
  },
});

Devvit.addTrigger({
  event: "CommentCreate",
  onEvent: async (event, context) => {
    if (!event.post?.id || !event.comment?.id) return;
    const comment = await context.reddit.getCommentById(event.comment.id);
    await replyWithMatches(
      comment.body ?? "",
      event.comment.id,
      comment.authorName ?? "",
      context,
    );
  },
});

Devvit.addTrigger({
  event: "CommentUpdate",
  onEvent: async (event, context) => {
    if (!event.post?.id || !event.comment?.id) return;
    const comment = await context.reddit.getCommentById(event.comment.id);
    await replyWithMatches(
      comment.body ?? "",
      event.comment.id,
      comment.authorName ?? "",
      context,
    );
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
