export class UserCreateTitleModel {
    name: string;
    firstandlastname: string;
    pleaseenteruserfirstnameandlastname : string;
    email:string;
    emailisrequired: string;
    pleaseenteravalidemailaddress: string;
    active:string;
    emailverified: string;
    role: string;
    user: string;
    admin: string;
    phonenumber: string;
    address: string;
    avatar: string;
    createuserbeforeupdateavatar: string;
    password: string;
    pleaseenterpassword: string;
    passwordmustbeatleast6characters: string;
    save: string;
    cancel: string;
}
 export const UserCreateTitle: UserCreateTitleModel[] = [
     { name: '', firstandlastname: '', pleaseenteruserfirstnameandlastname: '', email:'', emailisrequired:'', pleaseenteravalidemailaddress:'', active:'',emailverified:'',role:'',user:'', admin:'', phonenumber:'', address:'', 
       avatar:'', createuserbeforeupdateavatar:'', password:'', pleaseenterpassword:'', passwordmustbeatleast6characters: '', save:'', cancel: ''
     },
 ]