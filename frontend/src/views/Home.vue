<template>
  <div class="container">
    <div v-if="error" class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Ошибка!</strong> {{ error }}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div v-if="successMessage"  class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMessage }}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="card text-center" style="margin-top: 15px;">
      <div class="card-body">
        <a v-on:click="refresh" class="btn btn-outline-secondary btn-sm">Обновить данные</a>
      </div>
    </div>

    <div v-for="account in accounts" v-bind:key="account.id" class="card" style="margin-top: 15px;">
      <div class="card-header">{{ account.alias }}
        <span class="badge badge-warning" v-if="['NEW', 'READY_FOR_GENERATE', 'WAITING_BLOCKCHAIN'].includes(account.status)"> Создаётся </span>
        <span class="badge badge-danger" v-if="['ERROR'].includes(account.status)"> Ошибка </span>
        <span class="badge badge-warning" v-if="account.hasKey == null"> Нет доступа </span>
      </div>
      <div class="card-body">
        <p class="card-text">Баланс: {{ account.balance }} RDR</p>
        <a v-on:click="startTransfer(account)" class="btn btn-outline-success" v-if="account.status === 'DONE' && account.hasKey != null">Перевести</a>
        <!--<a v-on:click="faucetCall(account)" class="btn btn-outline-secondary" style="margin-left: 10px;" v-if="account.status === 'DONE'">Тестовые токены</a>-->
        <a v-on:click="restoreKey(account)" v-if="account.hasKey == null" class="btn btn-outline-warning">Восстановить доступ</a>
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
import Vue from "vue";

const { formatEther } = require("ethers/lib/utils");

export default {
  name: 'Home',
  data() {
    const params = this.$route.params;
    let successMessage = null;
    if (params && params.status === 'success') {
      successMessage = params.successMessage;
    }

    return {
      accounts: [],
      error: null,
      successMessage,
      timer: null,
    };
  },
  methods: {
    refresh() {
      AccountService.getAccounts().then(
        response => {
          this.accounts = response.data.data.map(account => {
            account.balance = 0;
            account.hasKey = AccountService.getKeyForAccount(account);

            Vue.config.token.balanceOf(account.address)
              .then((result) => {
                account.balance = formatEther(result);
              })

            return account;
          });
        },
        error => {
          this.error =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        }
      );
    },
    startTransfer(account) {
      this.$router.push({
        name: 'transfer',
        params: { account },
      });
    },
    restoreKey(account) {
      this.$router.push({
        name: 'restore',
        params: { account },
      });
    }
  },
  mounted() {
    this.refresh();
    this.timer = setInterval(this.refresh, 20 * 1000);
  }
};
</script>
