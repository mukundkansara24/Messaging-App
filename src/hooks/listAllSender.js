import { useCallback, useEffect, useState } from "react";
import api from "../utils/api";

function uselistAllSender() {
    const [sender, setSender] = useState(new Map());
    const fetchSender = useCallback(async () => {
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
    })

    const updateSenderList = useCallback((incomingGroupId) => {
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
                setTimeout(() => refetch, 0);
                return prevMap;
            }

        })
    })

    useEffect(() => {
        fetchSender();
    }, [])
    return { sender, refetch: fetchSender, updateSenderList };
}

export default uselistAllSender;