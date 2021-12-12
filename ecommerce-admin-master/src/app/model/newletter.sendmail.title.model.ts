export class SendMailTitleModel {
    subject: string;
    subjectisrequired: string;
    usertype: string;
    allusers: string;
    seller: string;
    registereduser:string;
    newslettercontacts:string;
    content: string;
    contentisrequired: string;
    send: string;
    cancel: string;
}
 export const SendMailTitle: SendMailTitleModel[] = [
     { subject: '', subjectisrequired: '', usertype: '', allusers:'', seller:'', registereduser:'', newslettercontacts:'', 
     content:'', contentisrequired:'',send:'', cancel:''},
 ]