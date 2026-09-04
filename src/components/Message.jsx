import React, { useRef } from "react";
import MessageList from "./MessageList";
import api from "../utils/api";
import socket from "../utils/socket";
import { useState, useEffect } from "react";
import uselistAllSender from "../hooks/listAllSender";
import useSearchAndHandleUser from "../hooks/useSearchAndHandleUser";

function Message() {

  const { sender, updateSenderList } = uselistAllSender();
  const { searchResults, setSearchResults, newUser, setNewUser, groupId, groupUsername, fetchUser, handleSelect, setIdAndUser } = useSearchAndHandleUser();
  const [message, setMessage] = useState([]);

  // UserArray stores list of all sender converted from map
  const userArray = useRef([]);

  useEffect(() => {
    userArray.current = [...sender.values()];
  }, [sender])

  useEffect(() => {
    let isCancelled = false;
    async function fetchMessages() {
      if (!groupId || groupId === 0) {
        setMessage([]);
        return;
      }
      try {
        const response = await api.get('/getMessage', { params: { group_id: groupId } });
        if (response && !isCancelled) {
          setMessage(response.data || []);
        }
      } catch (error) {
        console.log(error.response);
      }
    }
    fetchMessages();
    return () => {
      isCancelled = true;
    };
  }, [groupId]);


  // Listen for live socket messages
  useEffect(() => {
    const handleMessage = (data) => {
      const incomingGroupId = Number(data.group_id);
      if (Number(groupId) === incomingGroupId) {
        setMessage((prevMessages) => {
          const alreadyExists = prevMessages.some(
            (m) =>
              (data.client_msg_id && m.client_msg_id === data.client_msg_id) ||
              m._id === data._id
          );
          if (alreadyExists) return prevMessages;
          return [...prevMessages, data];
        });
      }
      updateSenderList(incomingGroupId);
    };

    socket.on('chat message', handleMessage);

    return () => {
      socket.off('chat message', handleMessage);
    };
  }, [groupId, updateSenderList]);

  // Ensure rooms are joined on sender/groupId change AND on every socket reconnect
  useEffect(() => {
    function joinAllRooms() {
      if (sender.size > 0) {
        sender.forEach((value, key) => {
          socket.emit('join room', String(key));
        });
      }
      if (groupId && groupId !== 0) {
        socket.emit('join room', String(groupId));
      }
    }

    if (!socket.connected) {
      socket.connect();
    } else {
      joinAllRooms();
    }

    socket.on('connect', joinAllRooms);

    return () => {
      socket.off('connect', joinAllRooms);
    };
  }, [sender, groupId]);

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
                  setNewUser(inputValue);
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
                onClick={() => {
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
                    onClick={() => setIdAndUser({ groupId: value.id, groupUsername: value.name })}
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
