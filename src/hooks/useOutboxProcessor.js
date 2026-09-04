import { useCallback, useEffect, useRef } from "react";
import api from "../utils/api";
import socket from "../utils/socket";
import {
  getOutbox,
  updateOutboxStatus,
  removeFromOutbox,
} from "../utils/outbox";

/**
 * Custom hook to process and dispatch messages from the localStorage outbox queue.
 *
 * @param {Function} onMessageStatusChange - Callback when a message status changes (e.g. pending -> sending -> sent / failed).
 * Receives `(tempId, updatedData)`.
 * @returns {{ processOutbox: Function, retryMessage: Function }}
 */
function useOutboxProcessor(onMessageStatusChange) {
  const isProcessingRef = useRef(false);

  const processOutbox = useCallback(async () => {
    // If already processing or browser is completely offline, skip
    if (isProcessingRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    isProcessingRef.current = true;

    try {
      const queue = getOutbox();
      if (!queue || queue.length === 0) return;

      for (const item of queue) {
        // If network went offline mid-drain, stop processing further items
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          break;
        }

        // Notify UI and outbox that message is actively sending
        updateOutboxStatus(item.tempId, "sending");
        if (onMessageStatusChange) {
          onMessageStatusChange(item.tempId, { status: "sending" });
        }

        try {
          const response = await api.post("/sendMessage", {
            group_id: Number(item.group_id),
            message_text: item.message_text,
            client_msg_id: item.tempId,
          });

          if (response && (response.status === 200 || response.status === 201)) {
            const serverData = response.data?.data || response.data;

            // Remove confirmed message from outbox queue
            removeFromOutbox(item.tempId);

            // Update UI message to 'sent' and swap tempId with real server _id
            if (onMessageStatusChange) {
              onMessageStatusChange(item.tempId, {
                ...serverData,
                _id: serverData._id || item.tempId,
                status: "sent",
              });
            }
          }
        } catch (error) {
          console.error("Failed to send queued message:", error);

          // Check if error is 4xx client error (e.g., validation, unauthorized, etc.)
          if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500
          ) {
            updateOutboxStatus(item.tempId, "failed");
            if (onMessageStatusChange) {
              onMessageStatusChange(item.tempId, {
                status: "failed",
                error: error.response.data?.message || "Message rejected",
              });
            }
            // Continue processing remaining items in queue so 4xx does not block others
            continue;
          }

          // For Network / 5xx server errors:
          updateOutboxStatus(item.tempId, "failed");
          if (onMessageStatusChange) {
            onMessageStatusChange(item.tempId, { status: "failed" });
          }

          // Stop queue drain until next reconnection/retry trigger
          break;
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [onMessageStatusChange]);

  /**
   * Manually retry sending a failed message by tempId.
   */
  const retryMessage = useCallback(
    async (tempId) => {
      const queue = getOutbox();
      const item = queue.find(
        (m) => m.tempId === tempId || m._id === tempId
      );
      if (!item) return;

      // Reset status to pending
      updateOutboxStatus(tempId, "pending");
      if (onMessageStatusChange) {
        onMessageStatusChange(tempId, { status: "pending" });
      }

      // Trigger queue processing
      processOutbox();
    },
    [processOutbox, onMessageStatusChange]
  );

  useEffect(() => {
    const handleOnline = () => {
      processOutbox();
    };

    const handleSocketConnect = () => {
      processOutbox();
    };

    window.addEventListener("online", handleOnline);
    socket.on("connect", handleSocketConnect);

    // Initial check on mount to drain any previously saved queue items
    processOutbox();

    return () => {
      window.removeEventListener("online", handleOnline);
      socket.off("connect", handleSocketConnect);
    };
  }, [processOutbox]);

  return { processOutbox, retryMessage };
}

export default useOutboxProcessor;
