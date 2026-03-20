import React from "react";
import ListSender from "./ListSender";
import MessageList from "./MessageList";
function Message() {
  return (
    <div className="flex w-full h-full">
      <div className="card m-1 bg-base-300 w-1/3 rounded-box grid place-items-center"><ListSender /></div>
      <div className="divider divider-horizontal m-0"></div>
      <div className="card m-1 w-2/3 bg-base-300 rounded-box grid place-items-center"><MessageList /></div>
    </div>
  );
}
export default Message;


// <>
//   <div className="flex h-full w-full">
//     <div className="flex flex-col h-full w-1/3 p-2 m-1 mt-3 rounded-lg border">
//       <ListSender />
//     </div>
//     <div className="h-full w-2/3 m-1 mt-3 rounded-lg border">
//       <MessageList />
//     </div>
//   </div>
// </>