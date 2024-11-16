'use server'
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/users.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export async function createThread({ text, author, communityId, path }: Params) {

  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    })
  
    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
  
    revalidatePath(path);
    
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);

  }
  
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    // Await connection to MongoDB
    await connectToDB();

    // Calculate the number of posts to skip based on pagination
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that have no parents (top-level threads)
    const postsQuery = await Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
        select: "_id name image", // Select only relevant fields
      })
      .populate({
        path: "children", // Populate the children field
        populate: {
          path: "author", // Populate the author field within children
          model: User,
          select: "_id name image", // Select only relevant fields for the author
        },
      });

    // Get the total count of top-level threads (no parents)
    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    // `postsQuery` already contains the resolved posts, no need for `.exec()`
    const posts = postsQuery;

    // Check if there are more posts for pagination
    const isNext = totalPostsCount > skipAmount + posts.length;

    return {
      posts,
      isNext,
    };

  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Unable to fetch posts");
  }
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }).populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}