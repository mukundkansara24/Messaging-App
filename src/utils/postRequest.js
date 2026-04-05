import axios from 'axios';
import { useDispatch } from 'react-redux';

async function postRequest(urlPath, data) {
    // const dispatch = useDispatch();
    try {
        const response = await axios.post(urlPath, data);
        return response.data;
    }
    catch (error) {
        console.log("error = ", error.response);
        const errorMessage = error.response.data.message || "Something went wrong";
        throw new Error(errorMessage);
    }
}

export default postRequest;