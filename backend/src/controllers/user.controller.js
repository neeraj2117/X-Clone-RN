import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { clerkClient } from "@clerk/express";
import { getAuth } from "@clerk/express";


export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export const syncUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const existingUser = await User.findOne({ clerkId: userId });
    if (!existingUser) {
      res.status(404).json({ message: "User already exists" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const userData = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
      firstname: clerkUser.firstName || "",
      lastname: clerkUser.lastName || "",
      profilePicture: clerkUser.imageUrl || "",
    };

    const user = await User.create(userData);
    res.status(200).json({ user, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export const followUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findOne({ clerkId: targetUserId });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // unfollow
      await User.findOneAndUpdate(currentUser._id, {
        $pull: { following: targetUserId },
      });
      await User.findOneAndUpdate(targetUser._id, {
        $pull: { followers: currentUser._id },
      });
    } else {
      // follow
      await User.findOneAndUpdate(currentUser._id, {
        $push: { following: targetUserId },
      });
      await User.findOneAndUpdate(targetUser._id, {
        $push: { followers: currentUser._id },
      });

      // create notifications
      await Notification.create({
        from: currentUser._id,
        to: targetUser,
        type: "follow",
      });

      res.status(200).json({ message: isFollowing ? "User unfollowed successfully" :  "User followed successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
