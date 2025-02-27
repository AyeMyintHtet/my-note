import Cookies from 'js-cookie';

export const setCookiesData = (name:string,data:string)=>{
    return Cookies.set(name,data)
}