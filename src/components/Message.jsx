import React from "react";
import MessageList from "./MessageList";
import { useDispatch } from "react-redux";
import api from "../utils/api";
import authService from "../appwrite/AppwriteService";
import socket from "../utils/socket";
import { setReceiver } from "../store/authSlice";
import { useState, useEffect } from "react";
function Message() {
  const [sender, setSender] = useState(new Map());
  const [newUser, SetNewUser] = useState("");
  const [message, setMessage] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [groupUsername, setGroupUsername] = useState("")
  const dispatch = useDispatch();
  async function listAllSender() {
    try {
      const response = await api.get('/listGroup');
      console.log("response = ", response);
      if (response) {
        const updatedData = await Promise.all(response.data.map(async (user) => {
          if (user.name === null) {
            const userName = await api.get('/findUsernameInPrivateGroup', { params: { group_id: user.id } });
            console.log(user.updatedAt);
            return { ...user, name: userName.data[0].username, updatedAt: new Date(user.updatedAt) };
          }
          return { ...user, updatedAt: new Date(user.updatedAt) };
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
  async function searchUser() {
    if (newUser == "") {
      return;
    }
    const response = await authService.searchByUsername({ userName: newUser });
    console.log("searchUser", response);
    if (response) {
      dispatch(setReceiver({ senderId: response.rows[0]["$id"] }));
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

  useEffect(() => {
    const handleMessage = (data) => {
      console.log("groupId = ", groupId, typeof groupId);
      console.log(data.group_id, typeof data.group_id);
      if (String(data.group_id) === String(groupId)) {
        setMessage((prevMessages) => [...prevMessages, data]);
        setSender((prevMap) => {
          const newMap = new Map();

          const data = prevMap.get(groupId);
          newMap.set(groupId, data);
          prevMap.forEach((value, key) => {
            newMap.set(key, value);
          })
          console.log(data);
          return newMap;
        })
      }
    };
    socket.on('chat message', handleMessage);

    return () => {
      socket.off('chat message', handleMessage);
    };
  }, [socket, groupId]);

  useEffect(() => {
    listAllSender();
  }, []);

  useEffect(() => {
    if (sender.size > 0) {

      if (!socket.connected) {
        socket.connect();
      }
      for (const value of sender.values()) {
        console.log('Joining room: ', value.id)
        socket.emit('join room', value.id);
      }

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
          <label className="input w-full mb-2 pr-0">

            <input type="search" placeholder="Search User"
              value={newUser}
              onChange={(e) => {
                SetNewUser(e.target.value);
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