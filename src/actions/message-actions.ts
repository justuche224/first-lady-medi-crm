/**
 * Messaging Server Actions
 *
 * Handles internal communication between users.
 * All authenticated users can send and receive messages.
 */

"use server";

import { db } from "@/db";
import { messages, user, feedback } from "@/db/schema";
import { eq, and, sql, desc, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { alias } from "drizzle-orm/pg-core";

const senders = alias(user, "senders");
const recipients = alias(user, "recipients");

// Types
export interface SendMessageData {
  recipientId: string;
  subject?: string;
  message: string;
  type?: "appointment" | "medication" | "result" | "general" | "urgent";
  priority?: "low" | "normal" | "high" | "urgent";
  attachments?: string[];
  relatedAppointmentId?: number;
  relatedFeedbackId?: number;
}

/**
 * Send message
 *
 * Allows users to send messages to other users.
 */
export async function sendMessage(messageData: SendMessageData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify recipient exists
    const recipient = await db
      .select()
      .from(user)
      .where(eq(user.id, messageData.recipientId))
      .limit(1);

    if (!recipient[0]) {
      throw new Error("Recipient not found");
    }

    // Verify related entities if provided
    if (messageData.relatedAppointmentId) {
      // Add appointment verification logic if needed
    }

    if (messageData.relatedFeedbackId) {
      const feedbackItem = await db
        .select()
        .from(feedback)
        .where(eq(feedback.id, messageData.relatedFeedbackId))
        .limit(1);

      if (!feedbackItem[0]) {
        throw new Error("Related feedback not found");
      }
    }

    const newMessage = await db
      .insert(messages)
      .values({
        senderId: session.user.id,
        recipientId: messageData.recipientId,
        subject: messageData.subject,
        message: messageData.message,
        type: messageData.type || "general",
        priority: messageData.priority || "normal",
        attachments: messageData.attachments
          ? JSON.stringify(messageData.attachments)
          : null,
        relatedAppointmentId: messageData.relatedAppointmentId,
        relatedFeedbackId: messageData.relatedFeedbackId,
      })
      .returning();

    revalidatePath("/messages");
    revalidatePath("/dashboard");

    return { success: true, message: newMessage[0] };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get messages
 *
 * Retrieves messages for the current user (sent and received).
 */
export async function getMessages(
  page = 1,
  limit = 20,
  type?: string,
  unreadOnly = false
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = or(
      eq(messages.senderId, session.user.id),
      eq(messages.recipientId, session.user.id)
    );

    if (type && type !== "all") {
      whereClause = and(
        whereClause,
        eq(
          messages.type,
          type as "urgent" | "appointment" | "medication" | "result" | "general"
        )
      );
    }

    if (unreadOnly) {
      whereClause = and(
        whereClause,
        eq(messages.recipientId, session.user.id),
        eq(messages.isRead, false)
      );
    }

    // Get messages with related data
    const messagesWithCount = await db
      .select({
        message: messages,
        sender: {
          id: senders.id,
          name: senders.name,
          role: senders.role,
        },
        recipient: {
          id: recipients.id,
          name: recipients.name,
          role: recipients.role,
        },
        total: sql<number>`count(*) over()`,
      })
      .from(messages)
      .leftJoin(senders, eq(messages.senderId, senders.id))
      .leftJoin(recipients, eq(messages.recipientId, recipients.id))
      .where(whereClause)
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    const total = messagesWithCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      messages: messagesWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark message as read
 *
 * Marks a message as read by the recipient.
 */
export async function markMessageAsRead(messageId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is the recipient
    const message = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.recipientId, session.user.id)
        )
      )
      .limit(1);

    if (!message[0]) {
      throw new Error("Message not found or access denied");
    }

    await db
      .update(messages)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    revalidatePath("/messages");

    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark all messages as read
 *
 * Marks all unread messages as read for the current user.
 */
export async function markAllMessagesAsRead() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await db
      .update(messages)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(messages.recipientId, session.user.id),
          eq(messages.isRead, false)
        )
      );

    revalidatePath("/messages");

    return { success: true };
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get unread messages count
 *
 * Returns the count of unread messages for the current user.
 */
export async function getUnreadMessagesCount() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const unreadCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, session.user.id),
          eq(messages.isRead, false)
        )
      );

    return { success: true, count: unreadCount[0]?.count || 0 };
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete message
 *
 * Deletes a message (only sender can delete their sent messages).
 */
export async function deleteMessage(messageId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify user is the sender
    const message = await db
      .select()
      .from(messages)
      .where(
        and(eq(messages.id, messageId), eq(messages.senderId, session.user.id))
      )
      .limit(1);

    if (!message[0]) {
      throw new Error("Message not found or access denied");
    }

    await db.delete(messages).where(eq(messages.id, messageId));

    revalidatePath("/messages");

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
