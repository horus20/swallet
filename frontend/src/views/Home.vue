<template>
  <div class="container">
    <header v-if="error"  class="jumbotron">
      <h3 class="error">
        {{ error }}
      </h3>
    </header>


    <div v-for="account in accounts" class="card">
    </div>

    <div class="card text-center">
      <div class="card-body">
        <router-link to="/account"  class="btn btn-outline-primary">Создать счет</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from '../services/user.service';

export default {
  name: 'Home',
  data() {
    return {
      accounts: [],
      error: null,
    };
  },
  mounted() {
    UserService.getAccounts().then(
      response => {
        console.log(response)
        this.accounts = response.data.data;
      },
      error => {
        this.error =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );
  }
};
</script>
