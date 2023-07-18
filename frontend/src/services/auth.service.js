import axios from 'axios';
import { API_URL } from "@/const";

class AuthService {
  login(user) {
    return axios
      .post(API_URL + 'auth/login', {
        phone: user.phone,
        password: user.password
      })
      .then(response => {
        if (response.data.token.accessToken) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(user) {
    return axios.post(API_URL + 'auth/register', {
      phone: user.phone,
      password: user.password
    });
  }
}

export default new AuthService();
