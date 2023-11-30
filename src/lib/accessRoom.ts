
import { API_ANONYMOUS } from "./constants";

export const getRoom = (info: any) => {
  return new Promise(async(resolve, reject) => {
    const url = `${API_ANONYMOUS.session}?uid=${info.user_uuid}&rid=${info.room_uuid}&sid=${info.session_uuid}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.statusCode === 200) {
        resolve(data);
      } else {
        resolve(false);
      }
    } catch (error) {
      console.log('Error 1024');
      resolve(false);
    }
  })
}
