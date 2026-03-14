import React from "react";
import ListSender from "./ListSender";
import MessageList from "./MessageList";
function Message() {
  return (
    <>
      <div className="flex h-full w-full">
        <div className="flex flex-col h-full w-1/3 p-2 m-1 mt-3 rounded-lg border">
          <ListSender />
        </div>
        <div className="h-full w-2/3 m-1 mt-3 rounded-lg border">
          <MessageList />
        </div>
      </div>
    </>
  );
}
1 / 3;
export default Message;
