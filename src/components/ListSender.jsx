import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import authService from "../appwrite/AppwriteService";
import { setReceiver } from "../store/authSlice";
import  SearchLogo from '../assets/search.svg'
function ListSender() {
    const userData = useSelector(state => state.userData);
    const [sender, setSender] = useState([]);
    const [newUser, SetNewUser] = useState('');
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
        if(newUser == '') {
            return;
        }
        const response = await authService.searchByUsername({userName: newUser});
        console.log("searchUser", response);
        if(response) {
            dispatch(setReceiver({senderId: response.rows[0]['$id']}));
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
                let username = await authService.getUsernameFromUserId({ userId: user })
                return username
            })
            const userName = await Promise.all(asyncPromise);
            console.log(userName);
            setSender(userName);
        }
        listSender();
    }, [userData])
    function listMessage(senderId) {
        dispatch(setReceiver({ senderId }));
    }
    return (
        <>
            <div className="flex-1">
                {sender?.map((send) => (
                    <div className="h-8 p-1 mb-2 border rounded" key={send.rows[0]?.$id}
                        onClick={(e) => listMessage(send.rows[0]?.$id)}
                    >{send.rows[0]?.Username}</div>
                ))}
            </div>
            <div className="flex border rounded-lg h-10 p-1 items-center">
                <input className="flex-1 m-1 min-w-0 outline-none" value={newUser} placeholder="Enter new username here"
                    onChange={(e) => {
                        SetNewUser(e.target.value);
                    }}
                />
                <button className="flex-none w-8 h-8 p-1 border rounded-lg hover:bg-gray-300"
                onClick={(e) => {searchUser()}}
                >
                    <img src={SearchLogo} alt="search" />
                </button>
            </div>
        </>
    )
}

export default ListSender;