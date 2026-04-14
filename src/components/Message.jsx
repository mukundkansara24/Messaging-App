import React, { useRef } from "react";
import MessageList from "./MessageList";
import api from "../utils/api";
import socket from "../utils/socket";
import { nanoid } from "nanoid";
import { useState, useEffect } from "react";
function Message() {
  const [sender, setSender] = useState(new Map());
  const [newUser, SetNewUser] = useState("");
  const [message, setMessage] = useState([]);
  const [groupId, setGroupId] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [groupUsername, setGroupUsername] = useState("")
  async function listAllSender() {
    try {
      const response = await api.get('/listGroup');
      console.log("response = ", response);
      if (response) {
        const updatedData = await Promise.all(response.data.map(async (user) => {
          if (user.name === null) {
            const userName = await api.get('/findUsernameInPrivateGroup', { params: { group_id: user.id } });
            console.log(user.updatedAt);
            return { ...user, id: Number(user.id), name: userName.data[0].username, updatedAt: new Date(user.updatedAt) };
          }
          return { ...user, id: Number(user.id), updatedAt: new Date(user.updatedAt) };
        }))
        updatedData.sort((a, b) => b.updatedAt - a.updatedAt);
        setSender((prevMap) => {
          const map = new Map();
          updatedData.forEach((element) => {
            // console.log(element);
            map.set(element.id, element);
          });
          return map;
        });
      }
    }
    catch (error) {
      console.log("Message = ", error.response);
    }
  }
  // UserArray stores list of all sender converted from map
  const userArray = useRef([]);

  useEffect(() => {
    userArray.current = [...sender.values()];
  }, [sender])

  async function searchUser() {
    if (newUser == "") {
      return;
    }
    try {
      const response = await api.get('/listUser', { params: { name: newUser } });
      if (response) {
        if (response.data.length > 0) {
          setSearchResults((arr) => [...arr, { id: nanoid(), name: "new User" }]);
          let resultData = response.data;
          // The resultData returns {id as userId, username}
          // We convert it to unique id, add name field same as username
          resultData = resultData.map((user) => { return { ...user, name: user.username, user_id: user.id, id: nanoid() } });
          console.log(resultData);
          setSearchResults((arr) => [...arr, ...resultData]);
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  async function handleSelect(user) {
    try {
      const response = await api.post('/addPrivateGroup', { id: user.user_id });
      if (response.data) {
        console.log(response);
        const gId = Number(response.data[0].group_id);
        const userName = await api.get('/findUsernameInPrivateGroup', { params: { group_id: gId } });
        if (userName.data) {
          const uName = userName.data[0].username;
          setGroupId(gId);
          setGroupUsername(uName);
          SetNewUser("");
          setSender((prevMap) => {
            const newMap = new Map();

            const newEntry = {
              id: gId,
              name: uName,
              updatedAt: new Date()
            };

            newMap.set(gId, newEntry);

            prevMap.forEach((value, key) => {
              if (key !== gId) newMap.set(key, value);
            });

            return newMap;
          });
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

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
      setSender((prevMap) => {
        const newMap = new Map();
        const existingData = prevMap.get(incomingGroupId);
        console.log("ExistingData = ", existingData);

        if (existingData) {
          newMap.set(incomingGroupId, existingData);
          prevMap.forEach((value, key) => {
            if (key !== incomingGroupId)
              newMap.set(key, value);
          })
          return newMap;
        }
        else {
          /*
          If you call listAllSender() (an async API call) directly inside setSender, you are performing a side effect inside a function that is only supposed to calculate data.
          This can lead to bugs.
          */
          setTimeout(() => listAllSender(), 0);
          return prevMap;
        }

      })
    };
    socket.on('chat message', handleMessage);

    return () => {
      socket.off('chat message', handleMessage);
    };
  }, [socket, groupId]);


  useEffect(() => {
    listAllSender();
  }, []);


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
  function listMessage({ groupId, groupUsername }) {
    setGroupId(groupId);
    setGroupUsername(groupUsername);
  }
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
                  searchUser();
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
                    onClick={(e) => listMessage({ groupId: value.id, groupUsername: value.name })}
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
