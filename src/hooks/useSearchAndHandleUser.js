import { useCallback, useState } from "react";

function useSearchAndHandleUser() {
    const [searchResults, setSearchResults] = useState([]);
    const [newUser, SetNewUser] = useState("");
    const [groupId, setGroupId] = useState(0);
    const [groupUsername, setGroupUsername] = useState("")

    const fetchUser = useCallback(async () => {
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
    })

    const handleSelect = useCallback(async (user) => {
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
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    })

    const setIdAndUser = useCallback(({ groupId, groupUsername }) => {
        setGroupId(groupId);
        setGroupUsername(groupUsername);
    })

    return { searchResults, newUser, groupId, groupUsername, fetchUser, handleSelect, setIdAndUser };
}

export default useSearchAndHandleUser;
