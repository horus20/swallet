import axios from 'axios';
import authHeader from './auth-header';
import { API_URL } from "@/const";

class UserService {
  getAccounts() {
    return axios.get(API_URL + 'accounts', { headers: authHeader() });
  }

  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new UserService();
