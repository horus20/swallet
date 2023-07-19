import axios from 'axios';
import { API_URL } from "@/const";
import Vue from "vue";

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
          // store password on session for encrypt/decrypt accounts
          // todo: change this to the input pass for creation
          Vue.config.password = user.password;
          Vue.config.phone = user.phone.trim().replace(/\D/g,'');
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
