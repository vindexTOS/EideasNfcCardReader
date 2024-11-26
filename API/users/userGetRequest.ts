import { ApiManager } from "../ApiManager";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
  role: string;
  device_users: any[];
  cards: any[];
}

interface PaginatedUserResponse {
  current_page: number;
  data: User[];
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
}

export const GetAllUserInfo = async (id: string, page: number = 1, search: string = ''): Promise<any> => {
  try {
    let url = `allUsers/${id}?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const res:any = await ApiManager(url, {
      method: "GET",
      headers: {
         
        'Content-Type': 'application/json',
      },
    });

    return res;
  } catch (error) {
    console.error(error);
    throw new Error((error as Error).message);
  }
};


export const GetSingleUserInfo = async (id:string )=>{
   try {
    const res = await ApiManager(`get-single-user-cards/${id}`, {
      method:"GET",
      headers: {
          'Content-Type': 'application/json',
      },
    })
    return res 
   } catch (error) {
    throw new Error((error as Error).message);

   }
}