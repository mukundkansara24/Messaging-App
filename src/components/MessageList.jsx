import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { nanoid } from "nanoid";
import { getOutboxForGroup, enqueueOutbox } from "../utils/outbox";
import useOutboxProcessor from "../hooks/useOutboxProcessor";

function MessageList({ userName, message = [], groupId }) {
  const [text, setText] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const userData = useSelector((state) => state.userData);
  const scrollRef = useRef(null);

  // Status update callback from useOutboxProcessor
  const handleMessageStatusChange = useCallback((tempId, updatedData) => {
    setOptimisticMessages((prevList) =>
      prevList.map((msg) => {
        if (msg.tempId === tempId || msg._id === tempId) {
          return {
            ...msg,
            ...updatedData,
            _id: updatedData._id || msg._id || tempId,
          };
        }
        return msg;
      })
    );
  }, []);

  const { processOutbox, retryMessage } = useOutboxProcessor(handleMessageStatusChange);

  // Clear optimisticMessage after group change.
  useEffect(() => {
    setOptimisticMessages([]);
  }, [groupId]);

  // Derive all messages by combining server messages and pending outbox/optimistic messages
  const displayMessages = useMemo(() => {
    if (!groupId || groupId === 0) return [];

    const serverMsgIds = new Set(
      message.map((m) => m.client_msg_id || m.tempId || m._id)
    );

    const pendingOutbox = getOutboxForGroup(groupId);
    const pendingMap = new Map();

    pendingOutbox.forEach((item) => pendingMap.set(item.tempId || item._id, item));
    optimisticMessages.forEach((item) => pendingMap.set(item.tempId || item._id, item));

    const unconfirmedMessages = Array.from(pendingMap.values()).filter(
      (item) => !serverMsgIds.has(item.tempId) && !serverMsgIds.has(item._id)
    );

    return [...message, ...unconfirmedMessages];
  }, [message, groupId, optimisticMessages]);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages]);


  function sendMessage() {
    const trimmedText = text.trim();
    if (!trimmedText || groupId === 0) {
      return;
    }

    const tempId = `temp-${nanoid()}`;
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    const optimisticMsg = {
      _id: tempId,
      tempId,
      group_id: Number(groupId),
      sender_id: userData?.id,
      sender_name: userData?.username || "You",
      message_text: trimmedText,
      status: isOnline ? "pending" : "failed",
      createdAt: new Date().toISOString(),
    };

    // 1. Add optimistic message to localStorage outbox
    enqueueOutbox(optimisticMsg);

    // 2. Add immediately to React state
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);

    // 3. Clear input
    setText("");

    // 4. Trigger outbox processing
    processOutbox();
  }

  if (groupId === 0 || !groupId) {
    return (
      <div className="w-full h-full flex justify-center items-center text-base-content/60 font-medium">
        Select a conversation or start typing to send a message
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col border-4 border-base-200 mb-2 rounded-md">
      <div className="navbar bg-base-300 shadow-sm border-b-2 rounded-md justify-center font-bold">
        {userName}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 flex flex-col bg-base-100 gap-2 overflow-y-auto p-2"
      >
        {displayMessages.length > 0 && userData &&
          displayMessages.map((mess) => {
            const isMe = mess.sender_id == userData.id;
            const isPending =
              mess.status === "pending" || mess.status === "sending";
            const isFailed = mess.status === "failed";

            return (
              <div
                key={mess.tempId || mess._id || nanoid()}
                className={`chat ${isMe ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-header text-xs opacity-50 mb-1">
                  {mess.sender_name || (isMe ? "You" : userName)}
                </div>

                <div
                  className={`chat-bubble ${
                    isFailed
                      ? "chat-bubble-error"
                      : isMe
                      ? "chat-bubble-primary"
                      : ""
                  }`}
                >
                  {mess.message_text}
                </div>

                {isMe && (
                  <div className="chat-footer opacity-70 text-xs flex items-center gap-1 mt-1">
                    {isPending && (
                      <span
                        className="flex items-center gap-1 text-warning font-medium"
                        title="Sending..."
                      >
                        <span>🕒</span>
                        <span className="text-[10px]">Sending...</span>
                      </span>
                    )}
                    {isFailed && (
                      <button
                        type="button"
                        className="btn btn-xs btn-error btn-outline flex items-center gap-1 text-[10px]"
                        onClick={() => retryMessage(mess.tempId || mess._id)}
                        title="Click to retry"
                      >
                        <span>⚠️ Failed (Click to retry)</span>
                      </button>
                    )}
                    {!isPending && !isFailed && (
                      <span
                        className="text-success font-semibold text-[10px]"
                        title="Sent"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="w-full flex justify-between gap-2 p-2 bg-base-200">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full input input-bordered"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default MessageList;