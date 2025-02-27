import Cookies from 'js-cookie';

export const getCookiesData = (data:string)=>{
    return Cookies.get(data) ?? null;
}