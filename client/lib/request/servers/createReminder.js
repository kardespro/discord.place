import config from '@/config';
import axios from 'axios';

export default function createReminder(id) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const url = `${config.api.url}/servers/${id}/reminder`;

    try {
      await axios.post(url, {}, { withCredentials: true });
      resolve();
    } catch (error) {
      reject(error instanceof axios.AxiosError ? (error.response?.data?.error || error.message) : error.message);
    }
  });
}