import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import authService from "../appwrite/AppwriteService";
import { setReceiver } from "../store/authSlice";
import api from "../utils/api";

function ListSender() {
  const [sender, setSender] = useState([]);
  const [newUser, SetNewUser] = useState("");
  const dispatch = useDispatch();
  async function listAllSender() {
    try {
      const response = await api.get('/listGroup');
      console.log("response = ", response);
      if (response) {
        const updatedData = await Promise.all(response.data.map(async (user) => {
          if (user.name === null) {
            const userName = await api.get('/findUsernameInPrivateGroup', {params: {group_id: user.id}});
            return {...user, name: userName.data[0].username};
          }
          return user;
        }))
        setSender(updatedData);
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
  useEffect(() => {
    listAllSender();
  }, []);
  function listMessage({groupId, groupUsername}) {
    dispatch(setReceiver({ groupId, groupUsername }));
  }
  return (
    // <> </> does not have layout property so i use div
    <>
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
          {sender?.map((send) => (
            <li className="list-row hover:bg-base-100 m-1 hover:cursor-pointer active:bg-base-200" key={send.id}
              onClick={(e) => listMessage({groupId: send.id, groupUsername: send.name})}
            >
              <div>{send.name}</div>
            </li>
          ))}

        </ul>
      </div>
    </>
  );
}

export default ListSender;


/*
    <>
      <div className="flex-1">
        {sender?.map((send) => (
          <div
            className="h-8 p-1 mb-2 border rounded"
            key={send.rows[0]?.$id}
            onClick={(e) => listMessage(send.rows[0]?.$id)}
          >
            {send.rows[0]?.Username}
          </div>
        ))}
      </div>
      <div className="flex border rounded-lg h-10 p-1 items-center">
        <input
          className="flex-1 m-1 min-w-0 outline-none"
          value={newUser}
          placeholder="Enter new username here"
          onChange={(e) => {
            SetNewUser(e.target.value);
          }}
        />
        <button
          className="flex-none w-8 h-8 p-1 border rounded-lg hover:bg-gray-300"
        >
          <img src={SearchLogo} alt="search" />
        </button>
      </div>
    </>
*/