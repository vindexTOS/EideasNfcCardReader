import { cardType } from "@/types/Card.Type";
import { ApiManager } from "../ApiManager";

export const CreatCard = async (body:cardType)=>{
    try {
     const res = await ApiManager(`createCard`, {
       method:"POST",
       headers: {
           'Content-Type': 'application/json',
       },
       data:body 
     })
     return res 
    } catch (error) {
     throw new Error((error as Error).message);
 
    }
 }