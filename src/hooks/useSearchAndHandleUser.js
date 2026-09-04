import { useCallback, useState } from "react";
import api from "../utils/api";
import { nanoid } from "nanoid";

function useSearchAndHandleUser() {
    const [searchResults, setSearchResults] = useState([]);
    const [newUser, setNewUser] = useState("");
    const [groupId, setGroupId] = useState(0);
    const [groupUsername, setGroupUsername] = useState("");

    const fetchUser = useCallback(async () => {
        if (newUser === "") {
            return;
        }
        try {
            const response = await api.get('/listUser', { params: { name: newUser } });
            if (response && response.data) {
                if (response.data.length > 0) {
                    let resultData = response.data.map((user) => ({
                        ...user,
                        name: user.username,
                        user_id: user.id,
                        id: nanoid(),
                    }));
                    setSearchResults(resultData);
                } else {
                    setSearchResults([]);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }, [newUser]);

    const handleSelect = useCallback(async (user) => {
        try {
            const response = await api.post('/addPrivateGroup', { id: user.user_id });
            if (response.data) {
                const gId = Number(response.data[0].group_id);
                const userName = await api.get('/findUsernameInPrivateGroup', { params: { group_id: gId } });
                if (userName.data) {
                    const uName = userName.data[0].username;
                    setGroupId(gId);
                    setGroupUsername(uName);
                    setNewUser("");
                    setSearchResults([]);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }, []);

    const setIdAndUser = useCallback(({ groupId: gId, groupUsername: gName }) => {
        setGroupId(gId);
        setGroupUsername(gName);
    }, []);

    return {
        searchResults,
        setSearchResults,
        newUser,
        setNewUser,
        groupId,
        groupUsername,
        fetchUser,
        handleSelect,
        setIdAndUser,
    };
}

export default useSearchAndHandleUser;
