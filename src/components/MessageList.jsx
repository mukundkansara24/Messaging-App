import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import authService from "../appwrite/AppwriteService";
import api from "../utils/api";
import socket from "../utils/socket";
function MessageList({userName, message, groupId}) {
  const [text, setText] = useState("");
  let userData = useSelector((state) => state.userData);

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
    try { 
      console.log("mesage sent");
      const response = api.post('sendMessage', { group_id: Number(groupId), message_text: text });
      if (response) {
        setText("");
      }
    }
    catch (error) {
      console.log(error.response);
    }
  }
  if (groupId === 0) {
    return <>Start our App by sending Message</>;
  }
  else {
    return (
      <div className="w-full h-full flex flex-col border-4 border-base-200 mb-2 rounded-md">
        <div className="navbar bg-base-300 shadow-sm border-b-2 rounded-md justify-center font-bold">
          {userName}
        </div>
        <div
          ref={scrollRef}
          className="flex-1 flex flex-col bg-base-100 gap-2 overflow-y-auto p-2"
        >
          {message.length > 0 && userData &&
            message.map((mess) => {
              return (
                <div
                  key={mess._id}
                  className={`chat ${mess.sender_id == userData.id ? "chat-end" : "chat-start"} `}
                >
                  <div className="chat-bubble">
                    {mess.message_text}
                  </div>
                </div>
              );
            })}
        </div>
        <div className="w-full flex justify-between gap-2 p-1">
          <input type="text" placeholder="Type..." className="w-full input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <button className="btn"
            onClick={(e) => {
              sendMessage();
            }}
          >Send</button>
        </div>
      </div>
    )
  }
}

export default MessageList;


/*
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
*/