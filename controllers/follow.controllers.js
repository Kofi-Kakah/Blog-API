import { prisma } from "../prisma.ts";


export const followUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    const loggedInUserId = Number(req.user?.id);
    const targetFollowerId = Number(followerId ?? loggedInUserId);

    if (!targetFollowerId || !followingId) {
      return res.status(400).json({ message: "Follower ID and following ID are required." });
    }

    if (loggedInUserId !== targetFollowerId) {
      return res.status(403).json({ message: "Forbidden. You can only follow on behalf of your own account." });
    }

    if (targetFollowerId === Number(followingId)) {
      return res.status(400).json({ message: "A user cannot follow themselves." });
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: targetFollowerId,
        followingId: Number(followingId),
      },
    });

    return res.status(201).json({
      message: "Follow relationship created.",
      follow,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "You are already following this user." });
    }

    console.error("Follow user error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};