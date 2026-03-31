import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
export const getCookie = (name) => Cookies.get(name);

export const isDevEnv = () =>
    import.meta.env.VITE_PROJECT_ENV === 'DEV' ||
    import.meta.env.VITE_PROJECT_ENV === 'development' ||
    import.meta.env.VITE_PROJECT_ENV === 'dev';

export const writeToClipboard = (text) => {
    navigator.clipboard.writeText(text);

    toast.success('Copied to clipbaord.');
};


export const sweetAlertConfirm = (t, m, confirmBtn = 'Yes', cancelBtn = "No") => {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: t,
            text: m,
            icon: 'warning',
            showCancelButton: true, // Display the Cancel button
            confirmButtonColor: '#DD6B55',
            cancelButtonColor: '#3085d6',
            confirmButtonText: confirmBtn,
            cancelButtonText: cancelBtn,
        }).then(({ isConfirmed }) => {
            resolve(isConfirmed)
        }).catch(() => {
            reject(false)
        })
    })
}