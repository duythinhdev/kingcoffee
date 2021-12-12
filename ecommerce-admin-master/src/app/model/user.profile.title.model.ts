export class UserProfileTitleModel {
    Firstandlastname: string;
    Pleaseenteruserfirstnameandlastname:string;
    Email:string;
    Emailisrequired:string;
    Pleaseenteravalidemailaddress:string;
    Active: string;
    Emailverified:string;
    Role:string;
    User:string;
    Admin: string;
    Phonenumber:string;
    Address:string;
    Password:string;
    Passwordmustbeatleast6characters: string;
    Blanktokeepcurrentpassword: string;
    Avatar: string;
    Save: string;
    Cancel: string;
  }
   export const UserProfileTitle: UserProfileTitleModel[] = [
       { Firstandlastname: '', Pleaseenteruserfirstnameandlastname: '', Email: '', Emailisrequired:'', Pleaseenteravalidemailaddress:'', Active:'', Emailverified:'',Role:'',
         User:'', Admin:'',Phonenumber:'',Address:'',Password:'',Passwordmustbeatleast6characters:'',Blanktokeepcurrentpassword:'',Avatar:'',Save:'',Cancel:''},
   ]