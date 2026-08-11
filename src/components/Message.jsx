import React, { useRef } from "react";
import MessageList from "./MessageList";
import api from "../utils/api";
import socket from "../utils/socket";
import { nanoid } from "nanoid";
import { useState, useEffect } from "react";
import uselistAllSender from "../hooks/listAllSender";
import useSearchAndHandleUser from "../hooks/useSearchAndHandleUser";

function Message() {

  const { sender, refetch, updateSenderList } = uselistAllSender();
  const { searchResults, newUser, groupId, groupUsername, fetchUser, handleSelect, setIdAndUser } = useSearchAndHandleUser();
  const [message, setMessage] = useState([]);

  // UserArray stores list of all sender converted from map
  const userArray = useRef([]);

  useEffect(() => {
    userArray.current = [...sender.values()];
  }, [sender])

  async function getMessage() {
    try {
      if (groupId !== "") {
        const response = await api.get('/getMessage', { params: { group_id: groupId } });
        // console.log(response);
        if (response) {
          setMessage(response.data);
        }
      }
    }
    catch (error) {
      console.log(error.response);
    }
  }
  useEffect(() => {
    getMessage();
  }, [groupId])


  // useState variables remain as it is in useEffect even when we update it
  useEffect(() => {
    const handleMessage = (data) => {
      const incomingGroupId = Number(data.group_id);
      if (groupId === incomingGroupId) {
        setMessage((prevMessages) => [...prevMessages, data]);
      }
      updateSenderList(incomingGroupId);
    };
    socket.on('chat message', handleMessage);

    return () => {
      socket.off('chat message', handleMessage);
    };
  }, [socket, groupId]);



  const joinedRooms = useRef(new Set());

  useEffect(() => {
    if (sender.size > 0) {

      if (!socket.connected) {
        socket.connect();
      }
      sender.forEach((value, key) => {
        if (!joinedRooms.current.has(key)) {
          console.log('Joining room: ', key);
          socket.emit('join room', key);
          joinedRooms.current.add(key);
        }
      });

    }
  }, [sender])

  return (
    <div className="flex w-full h-[90vh] p-2">
      <div className="card m-1 bg-base-300 w-1/3 rounded-box overflow-hidden">
        <div className="w-full h-full p-2">
          <div className={`dropdown w-full ${newUser.length > 0 ? 'dropdown-open' : ''}`}>
            <label className="input w-full mb-2 pr-0">

              <input type="search" placeholder="Search User"
                value={newUser}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  SetNewUser(inputValue);
                  if (inputValue.length > 0) {
                    const localSearch = userArray.current.filter(item => item.name.toLowerCase().startsWith(inputValue));
                    console.log("LocalSearch = ", localSearch);
                    setSearchResults(localSearch);
                  }
                  else {
                    setSearchResults([]);
                  }
                }}
              />
              <div className="btn btn-ghost"
                onClick={(e) => {
                  fetchUser();
                }}
              >
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
              </div>
            </label>
            <ul className="dropdown-content menu bg-base-100 rounded-box z-1 w-full p-2 shadow-xl border border-base-200">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <li key={user.id}>
                    <a onClick={() => handleSelect(user)}>{user.name}</a>
                  </li>
                ))
              ) : (
                <li className="disabled"><a>No users found</a></li>
              )}
            </ul>
          </div>
          <ul className="list rounded-box">
            {sender.size > 0 &&
              [...sender.values()].map((value) => {
                return (
                  <li className="list-row hover:bg-base-100 m-1 hover:cursor-pointer active:bg-base-200" key={value.id}
                    onClick={(e) => setIdAndUser({ groupId: value.id, groupUsername: value.name })}
                  >
                    <div>{value.name}</div>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
      <div className="divider divider-horizontal m-0"></div>
      <div className="card m-1 w-2/3 bg-base-300 rounded-box overflow-hidden"><MessageList message={message} userName={groupUsername} groupId={groupId} /></div>
    </div>
  );
}
export default Message;
