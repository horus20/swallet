import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ethers } from "ethers";

import { OpEntity } from "./op.entity";
import { ApiConfigService } from "../../shared/services/api-config.service";
import { AccountService } from "./account.service";
import { KeyService } from "./key.service";
import { OpService } from "./op.service";
import { BlockchainStatusType } from "../../constants/blockchain-status-type";
import { UserOperation } from "../../shared/UserOperation";

const AddressZero = "0x0000000000000000000000000000000000000000";

@Injectable()
export class BlockchainService {

  private readonly provider: ethers.JsonRpcProvider;
  private readonly operator: ethers.Wallet;

  private readonly addressBook: ethers.Contract;
  private readonly entryPoint: ethers.Contract;
  private readonly entryPointAddress: string;
  private readonly token: ethers.Contract;
  private readonly accountFactory: ethers.Contract;
  private readonly accountABI: ethers.InterfaceAbi;

  private isContractDeploy = true;
  private isKeyAdd = true;
  private isKeyRemove = true;
  private isOpSend = true;

  constructor(
    private configService: ApiConfigService,
    private accountService: AccountService,
    private keyService: KeyService,
    private opService: OpService,
  ) {
    const config = this.configService.getBlockchainConfig();

    this.provider = new ethers.JsonRpcProvider(config.rpc);
    this.operator = new ethers.Wallet(config.privateKey, this.provider);
    if (this.operator.address != config.address) {
      throw new InternalServerErrorException(`Error owner address ${this.operator.address} != ${config.address}`);
    }

    this.addressBook = new ethers.Contract(config.addressBook, JSON.parse(config.addressBookABI), this.operator);
    this.entryPoint = new ethers.Contract(config.entryPoint, config.entryPointABI, this.operator);
    this.entryPointAddress = config.entryPoint;
    this.token = new ethers.Contract(config.token, config.tokenABI, this.provider);
    this.accountFactory = new ethers.Contract(config.accountFactory, config.accountFactoryABI, this.operator);
    this.accountABI = config.accountABI;
  }

  // deploy account wallet
  @Cron(CronExpression.EVERY_5_SECONDS)
  async deployAccountWallets() {
    if (!this.isContractDeploy) {
      return;
    }
    this.isContractDeploy = false;
    const accounts = await this.accountService.getByStatus(BlockchainStatusType.NEW);

    const promises = accounts.map(async (account) => {
      try {
        await this.accountService.updateStatus(account, BlockchainStatusType.READY_FOR_GENERATE);

        let tx = await this.accountFactory.createAccount(this.entryPointAddress);
        let receipt = await tx.wait();
        if (receipt.status == 0) {
          console.error(receipt);
          await this.accountService.updateStatus(account, BlockchainStatusType.ERROR);
          return;
        }

        const logs = receipt.logs.map((log) => this.accountFactory.interface.parseLog(log)).filter((log) => log != null);
        const walletAddress = logs?.find((log) => log.name === 'SAccountCreated').args[0];

        await this.accountService.update(account, {
          address: walletAddress,
          status: BlockchainStatusType.WAITING_BLOCKCHAIN,
          hash: receipt.hash,
        });

        tx = await this.addressBook.updateAlias(account.alias, walletAddress, true);
        receipt = await tx.wait();
        if (receipt.status == 0) {
          console.error(receipt);
          await this.accountService.updateStatus(account, BlockchainStatusType.ERROR);
          return;
        }

        const logs = receipt.logs.map((log) => this.addressBook.interface.parseLog(log)).filter((log) => log != null);
        const result = logs?.find((log) => log.name === 'AliasChanged');

        if (!result) {
          await this.accountService.updateStatus(account, BlockchainStatusType.DONE);
        } else {
          await this.accountService.updateStatus(account, BlockchainStatusType.ERROR);
        }
      } catch (e) {
        console.error(account.id, e);
        await this.accountService.updateStatus(account, BlockchainStatusType.ERROR);
      }
    });
    await Promise.all(promises);

    this.isContractDeploy = true;
  }

  // add key
  @Cron(CronExpression.EVERY_5_SECONDS)
  async addKey() {
    if (!this.isKeyAdd) {
      return;
    }
    this.isKeyAdd = false;

    const keys = await this.keyService.getByStatus(BlockchainStatusType.NEW);
    const promises = keys.map(async (key) => {
      try {
        await this.keyService.updateStatus(key, BlockchainStatusType.READY_FOR_GENERATE);

        const account = key.account;
        const walletContract = new ethers.Contract(account.address, this.accountABI, this.provider);

        const tx = await walletContract.updateOperator(key.key, true);
        const receipt = await tx.wait();
        if (receipt.status == 0) {
          console.error(receipt);
          await this.keyService.updateStatus(key, BlockchainStatusType.ERROR);
          return;
        }

        const logs = receipt.logs.map((log) => walletContract.interface.parseLog(log)).filter((log) => log != null);
        const result = logs?.find((log) => log.name === 'OperatorListChanged');

        if (!result) {
          await this.keyService.updateStatus(key, BlockchainStatusType.DONE);
        } else {
          await this.keyService.updateStatus(key, BlockchainStatusType.ERROR);
        }
      } catch (e) {
        console.error(key.id, e);
        await this.keyService.updateStatus(key, BlockchainStatusType.ERROR);
      }
    });
    await Promise.all(promises);

    this.isKeyAdd = true;
  }

  // remove key
  @Cron(CronExpression.EVERY_5_SECONDS)
  async removeKey() {
    if (!this.isKeyRemove) {
      return;
    }
    this.isKeyRemove = false;

    const keys = await this.keyService.getByStatus(BlockchainStatusType.READY_TO_REMOVE);
    const promises = keys.map(async (key) => {
      try {
        await this.keyService.updateStatus(key, BlockchainStatusType.READY_FOR_GENERATE);

        const account = key.account;
        const walletContract = new ethers.Contract(account.address, this.accountABI, this.provider);

        const tx = await walletContract.updateOperator(key.key, false);
        const receipt = await tx.wait();
        if (receipt.status == 0) {
          console.error(receipt);
          await this.keyService.updateStatus(key, BlockchainStatusType.ERROR);
          return;
        }

        const logs = receipt.logs.map((log) => walletContract.interface.parseLog(log)).filter((log) => log != null);
        const result = logs?.find((log) => log.name === 'OperatorListChanged');

        if (!result) {
          await this.keyService.update(key, {
            status: BlockchainStatusType.REMOVED,
            hash: receipt.hash,
          });
        } else {
          await this.keyService.updateStatus(key, BlockchainStatusType.ERROR);
        }
      } catch (e) {
        console.error(key.id, e);
        await this.keyService.updateStatus(key, BlockchainStatusType.ERROR);
      }
    });
    await Promise.all(promises);

    this.isKeyRemove = true;
  }

  // send operation
  @Cron(CronExpression.EVERY_5_SECONDS)
  async sendOp() {
    if (!this.isOpSend) {
      return;
    }
    this.isOpSend = false;

    const ops = await this.opService.getByStatus(BlockchainStatusType.READY_FOR_GENERATE);
    const promises = ops.map(async (op) => {
      try {
        await this.opService.updateStatus(op, BlockchainStatusType.WAITING_BLOCKCHAIN);

        const userOp: UserOperation = JSON.parse(op.op);
        const tx = await this.entryPoint.handleOps([userOp], AddressZero);
        const receipt = await tx.wait();
        if (receipt.status == 0) {
          console.error(receipt);
          await this.opService.updateStatus(op, BlockchainStatusType.ERROR);
          return;
        }

        const logs = receipt.logs.map((log) => this.entryPoint.interface.parseLog(log)).filter((log) => log != null);
        const result = logs?.find((log) => log.name === 'UserOperationRevertReason');

        if (!result) {
          console.error(result);
          await this.opService.updateStatus(op, BlockchainStatusType.ERROR);
        } else {
          await this.opService.update(op, {
            status: BlockchainStatusType.DONE,
            hash: receipt.hash,
          });
        }
      } catch (e) {
        console.error(op.id, e);
        await this.opService.updateStatus(op, BlockchainStatusType.ERROR);
      }
    });
    await Promise.all(promises);

    this.isOpSend = true;
  }

  // get alias address
  async getAddressByAlias(alias: string) {
    //const address = await this.addressBook.updateAlias('operator', this.operator.address, true);
    try {
      return await this.addressBook.getAddressByAlias(alias);
    } catch (e) {
      if (e.reason.includes('AA1')) {
        throw new NotFoundException('Alias not found or disabled');
      } else {
        console.error(e);
        throw new InternalServerErrorException(e.message);
      }
    }
  }

  async getTokenBalance(address: string): Promise<string> {
    try {
    return ethers.formatEther(await this.token.balanceOf(address));
    } catch (e) {
      console.error(e);
      return '0';
    }
  }

  // check operation
  async checkOp(op: OpEntity): Promise<boolean> {
    const userOp: UserOperation = JSON.parse(op.op);

    try {
      await this.entryPoint.simulateValidation(userOp);
    } catch (e: any) {
      if (!e.message.includes('ValidationResult')) {
        throw new BadRequestException(e.message);
      }
    }

    try {
      await this.entryPoint.simulateHandleOp(userOp, userOp.sender,  userOp.callData)
    } catch (e) {
      console.log(e);
    }

    return true;
  }
}
