
import { API } from "./constants";

export const getRoom_R = (info: any) => {
  if (!info.room_uuid_r) {
    return Promise.resolve(false);
  }

  const access_token = localStorage.getItem('access_token');
  if (!access_token || access_token.length < 10) {
    return Promise.resolve(false);
  }

  return new Promise(async(resolve, reject) => {
    const url = `${API.room}?rid=${info.room_uuid_r}&sid=${info.session_uuid_r}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
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
