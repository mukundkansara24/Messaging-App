import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import authService from "../appwrite/AppwriteService";
import { setReceiver } from "../store/authSlice";
import SearchLogo from "../assets/search.svg";
function ListSender() {
  const userData = useSelector((state) => state.userData);
  const [sender, setSender] = useState([]);
  const [newUser, SetNewUser] = useState("");
  const dispatch = useDispatch();
  async function listAllSender() {
    let response = null;
    if (userData) {
      response = await authService.listSender({ userId: userData.$id });
      if (response) {
        return response;
      }
      return null;
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
    async function listSender() {
      const response = await listAllSender();
      if (response == null) {
        return;
      }
      // console.log(response);
      const asyncPromise = response.map(async (user) => {
        let username = await authService.getUsernameFromUserId({
          userId: user,
        });
        return username;
      });
      const userName = await Promise.all(asyncPromise);
      console.log(userName);
      setSender(userName);
    }
    listSender();
  }, [userData]);
  function listMessage(senderId) {
    dispatch(setReceiver({ senderId }));
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
            <li className="list-row hover:bg-base-100 m-1 hover:cursor-pointer active:bg-base-200" key={send.rows[0]?.$id}
              onClick={(e) => listMessage(send.rows[0]?.$id)}
            >
              <div>{send.rows[0]?.Username}</div>
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