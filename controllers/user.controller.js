import { prisma } from "../prisma.ts";


export const comment = async (req, res) => {
  try {
    const { postId, commentText } = req.body;
    const userId = Number(req.user?.id);
    const targetPostId = Number(postId);

    if (!targetPostId || !commentText) {
      return res.status(400).json({ message: "Post ID and comment text are required." });
    }

    const comment = await prisma.comment.create({
      data: {
        text: String(commentText),
        postId: targetPostId,
        userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return res.status(200).json({
      message: "Comment saved successfully.",
      comment,
    });
  } catch (error) {
    console.error("Comment error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const likes = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = Number(req.user?.id);
    const targetPostId = Number(postId);

    if (!targetPostId) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    const like = await prisma.like.create({
      data: { postId: targetPostId, userId },
    });

    return res.status(200).json({
      message: "Post liked successfully.",
      like,
    });
  } catch (error) {
    console.error("Likes error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};