import { prisma } from "../prisma.ts";

const sanitizePost = (post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  userId: post.userId,
  category: post.category
  user: post.user ? { id: post.user.id, name: post.user.name, email: post.user.email } : null,
});


export const createPost = async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    const loggedInUserId = Number(req.user?.id);
    const targetUserId = Number(userId ?? loggedInUserId);

    if (!targetUserId || !title) {
      return res.status(400).json({ message: "User ID and title are required." });
    }

    if (loggedInUserId !== targetUserId) {
      return res.status(403).json({ message: "Forbidden. You can only create posts for your own account." });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId: targetUserId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      message: "Post created successfully.",
      post: sanitizePost(post),
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({ posts: posts.map(sanitizePost) });
  } catch (error) {
    console.error("Get posts error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const category = async (req,res) => {
  try{
    const { category } = req.body;
    const postCategory = await prisma.post.findMany({
      where: category,
      include: {
        user: {
          select:{ id: true, name:true}
        }
      }
    })

    if(postCategory.length == 0) {
      return res.status(400).json({ message: "Post cetegory is empty" })
    }

    return res.status(200).json({ 
      message: `All ${postCategory} include:`,
      posts: postCategory.filter(sanitizePost)
    })
  }catch (error) {
    res.status(500).json({ error: error.message || "Internal server error"})
  }
}