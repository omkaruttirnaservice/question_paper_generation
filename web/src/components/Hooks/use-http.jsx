import { useDispatch } from 'react-redux';
import { loaderActions } from '../../Store/loader-slice.jsx';
import { toast } from 'react-toastify';
import { useState } from 'react';
const useHttp = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const sendRequest = async (requestData, callback) => {
        setIsLoading(true);
        try {
            dispatch(loaderActions.showLoader());
            let res = await fetch(requestData.url, {
                method: requestData.method ? requestData.method : 'GET',
                // headers: requestData.headers ? requestData.headers : {},
                headers: {
                    'Content-Type': 'application/json',
                    ...requestData.headers,
                },
                body: requestData.body ? requestData.body : null,
                credentials: 'include',
            });
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('Not found');
                } else {
                    const data = await res.json();
                    throw new Error(
                        data?.usrMsg || data?.message || data?.message || 'Request failed'
                    );
                }
            }
            const data = await res.json();

            toast(data?.message);

            dispatch(loaderActions.hideLoader());
            // THIS FUNCTION IS FOR GETTING RESPONSE RECIVED FROM THE REQUEST
            callback(data);
        } catch (err) {
            console.log(err, '----');
            console.log(err.message, '----');
            dispatch(loaderActions.hideLoader());
            toast(err?.message || 'Unable to connect to backend');
            if (err.message == 'Invalid token') {
                navigate('/login', { replace: true });
            }
        } finally {
            setIsLoading(false);
        }
    };
    return {
        sendRequest,
        isLoading,
    };
};

export default useHttp;
