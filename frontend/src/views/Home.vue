<template>
  <div class="container">
    <header v-if="error"  class="jumbotron">
      <h3 class="error">
        {{ error }}
      </h3>
    </header>


    <div v-for="account in accounts" class="card" style="margin-top: 15px;">
      <div class="card-header">{{ account.alias }}</div>
      <div class="card-body">
        <p class="card-text">Баланс: 0 RDR</p>
        <a href="#" class="btn btn-outline-success">Перевести</a>
      </div>
    </div>

    <div class="card text-center" style="margin-top: 15px;">
      <div class="card-body">
        <router-link to="/account"  class="btn btn-outline-primary">Создать счет</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AccountService from "@/services/account.service";

export default {
  name: 'Home',
  data() {
    return {
      accounts: [],
      error: null,
    };
  },
  mounted() {
    AccountService.getAccounts().then(
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
