import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import authService from "../appwrite/AppwriteService";
function MessageList() {
  const [userName, setUserName] = useState("");
  const senderId = useSelector((state) => state.senderId);
  const [message, setMessage] = useState([]);
  const [text, setText] = useState("");
  const userData = useSelector((state) => state.userData);
  let userId = "";
  if (userData != null) userId = userData["$id"];
  // console.log("userid = ", userId);
  useEffect(() => {
    async function getUserName(senderId) {
      if (senderId != "" && userId != "") {
        const response = await authService.getUsername({ userId: senderId });
        if (response) {
          setUserName(response.rows[0].Username);
          const mess = await authService.listMessage({
            userId: userId,
            senderId: senderId,
          });
          setMessage(mess.rows);
        }
      }
    }
    getUserName(senderId);
    let unsubscribe;
    function autoUpdate() {
      //Real time updates
      unsubscribe = authService.subscribeToMessages(userId, (payload) => {
        console.log("userID = ", userId);
        console.log("senderId = ", senderId);
        console.log("payload = ", payload);
        if (
          payload.SenderID === userId ||
          (payload.ReceiverID === userId && payload.SenderID == senderId)
        ) {
          setMessage((prev) => {
            return [...prev, payload];
          });
        }
      });
    }
    autoUpdate();
    return () => {
      unsubscribe();
    };
  }, [senderId, userId]);

  // Scroll to bottom feature for message
  const scrollRef = useRef(null);
  useEffect(() => {
    console.log(scrollRef);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [message]);
  async function sendMessage() {
    if (text == "") {
      return;
    }
    const response = await authService.sendMessage({
      senderId: userId,
      receiverId: senderId,
      message: text,
    });
    if (response) {
      setText(""); // Clear the input box
    }
  }
  if (userName == "") {
    return <>Start our App by sending message</>;
  } else {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        <div className="flex-none w-full h-11 border-b-2 text-center p-2">
          {userName}
        </div>
        <div
          ref={scrollRef}
          className="flex-1 flex flex-col gap-2 overflow-y-auto p-2"
        >
          {message.length > 0 &&
            message.map((mess) => {
              return (
                <div
                  key={mess["$id"]}
                  id={mess["$id"]}
                  className={`chat ${mess["SenderID"] == userId ? "chat-start" : "chat-end"} `}
                >
                  <div className="chat-bubble">
                  {mess["Content"]}
                  </div>
                </div>
              );
            })}
        </div>
        <div className="flex items-center">
          <div className="flex-1 border-2 m-2 h-10 rounded-lg">
            <input
              className="m-1 mt-1.5 outline-none"
              placeholder="Type..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
          </div>
          <button
            className="border-2 h-10 m-1 ml-0 rounded-lg p-1"
            onClick={(e) => {
              sendMessage();
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default MessageList;
