<template>
  <div class="col-md-12">
    <div class="card card-container" v-if="step === 'first'">
      <h5 class="card-title">Перевод</h5>
      <form name="form" @submit.prevent="handleRun">
        <div class="form-group">
          <label for="alias">Публичное имя</label>
          <input
            v-model="op.alias"
            v-validate="'required'"
            type="text"
            class="form-control"
            name="alias"
          />
          <small id="aliasHelp" class="form-text text-muted">Идентификатор для перевода</small>
          <div
            v-if="errors.has('alias')"
            class="alert alert-danger"
            role="alert"
          >Публичное имя обязателено!</div>
        </div>
        <div class="form-group">
          <label for="amount">Сумма в RDR <span class="text-muted">(макс.: {{ balance }} RDR)</span></label>
          <input
            v-model="op.amount"
            v-validate="'required'"
            type="amount"
            class="form-control"
            name="amount"
          />
          <small id="amountHelp" class="form-text text-muted">Сумма перевода (напр. 10)</small>
          <div
            v-if="errors.has('amount')"
            class="alert alert-danger"
            role="alert"
          >Сумма обязательна!</div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary btn-block" :disabled="loading">
            <span v-show="loading" class="spinner-border spinner-border-sm"></span>
            <span>Создать</span>
          </button>
        </div>
        <div class="form-group">
          <div v-if="message" class="alert alert-danger" role="alert">{{message}}</div>
        </div>
      </form>
    </div>
    <div class="card card-container" v-if="step === 'confirm'">
      <h5 class="card-title">Подтверждение перевода</h5>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">Кому: {{ op.alias }}</li>
        <li class="list-group-item">Адрес: {{ op.to }}</li>
        <li class="list-group-item">Сколько: {{ op.amount }} RDR</li>
        <li class="list-group-item">
          <a v-on:click="confirmTransfer" class="btn btn-outline-success">Перевести</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AccountService from '../services/account.service';
import Vue from "vue";
import Op from "@/models/op";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "ethers";
import { fillUserOpDefaults, signUserOp } from "@/utils/utils";
import CryptoJS from "crypto-js";

export default {
  name: 'Transfer',
  data() {
    const account = this.$route.params.account;
    const balance = account.balance;
    return {
      account,
      op: new Op(
        account.address,
        '',
        '',
        1,
      ),
      loading: false,
      step: 'first',
      message: '',
      balance
    };
  },
  computed: {
  },
  created() {
  },
  methods: {
    handleRun() {
      this.loading = true;
      this.$validator.validateAll().then(isValid => {
        if (!isValid) {
          this.loading = false;
          return;
        }

        if (Number(this.op.amount) > Number(this.balance)) {
          this.message = 'Неверная сумма перевода';
          this.loading = false;
          return;
        }

        if (this.op.alias && Number(this.op.amount) > 0) {
          Vue.config.addressBook.getAddressByAlias(this.op.alias)
            .then((result) => {
              // console.log(result);
              if (result.toLocaleString() === this.account.address.toLocaleString()) {
                this.message = 'Нельзя переводить себе';
                this.loading = false;
              } else {
                // try to create transfer
                this.op.to = result;
                this.step = 'confirm'
                this.loading = false;
              }
            })
            .catch((error) => {
              // console.error(error);
              this.message = 'Адрес не найден';
              this.loading = false;
            });
        }
      });
    },
    async confirmTransfer() {
      try {
        // create op, sign it and send to server
        const transferCallData = Vue.config.token.interface.encodeFunctionData('transfer', [this.op.to, parseEther(this.op.amount.toString())]);
        const walletContract = new ethers.Contract(
          this.account.address,
          Vue.config.walletABI,
          Vue.config.provider
        );
        const nonceBN = await walletContract.getNonce();
        const nonce = `0x` + Number(nonceBN.toString()).toString(16).padStart(2, '0');
        const chainId = await Vue.config.provider.getNetwork().then((net) => net.chainId);
        const callData = walletContract.interface.encodeFunctionData('execute', [Vue.config.token.address, parseEther('0'), transferCallData]);

        const callGasLimit = 200000;
        const verificationGasLimit = 100000;
        const maxFeePerGas = 3e9;

        const unsignedUserOp = fillUserOpDefaults({
          sender: this.account.address,
          nonce,
          callData,
          callGasLimit,
          verificationGasLimit,
          maxFeePerGas,
        });

        const encryptedPrivateKey = AccountService.getKeyForAccount(this.account);
        if (encryptedPrivateKey == null) {
          this.message = 'Ключи для аккаунта не найдены';
          this.loading = false;
          return;
        }

        const privateKey = CryptoJS.AES.decrypt(encryptedPrivateKey, Vue.config.password).toString(CryptoJS.enc.Utf8);
        const wallet = new ethers.Wallet(privateKey, Vue.config.provider);

        const userOp = JSON.stringify(signUserOp(unsignedUserOp, wallet, Vue.config.entryPointAddress, chainId));

        return AccountService.newOp(this.account, userOp)
          .then(
            (op) => {
                this.$router.push({
                  name: 'home',
                  params: {
                    op,
                    status: 'success',
                    successMessage: `Перевод ${op.id} успешно произведен.`,
                  }
                });
            },
            error => {
              // console.error(e);
              this.message = e.message;
              this.loading = false;
            });
      } catch (e) {
        // console.error(e);
        this.message = e.message;
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
label {
  display: block;
  margin-top: 10px;
}

.card-container.card {
  max-width: 350px !important;
  padding: 40px 40px;
}

.card {
  background-color: #f7f7f7;
  padding: 20px 25px 30px;
  margin: 0 auto 25px;
  margin-top: 50px;
  -moz-border-radius: 2px;
  -webkit-border-radius: 2px;
  border-radius: 2px;
  -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
}

.profile-img-card {
  width: 96px;
  height: 96px;
  margin: 0 auto 10px;
  display: block;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
}
</style>
