import { ethers } from 'ethers';
import crypto from 'crypto';
import Wallet from '../models/Wallet';
import Currency from '../models/Currency';
import Transaction from '../models/Transaction';
import Balance from '../models/Balance';

// Standard ERC20 ABI for token interactions
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Supported blockchain networks
const CHAIN_CONFIGS: { [chainId: number]: ChainConfig } = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  56: {
    chainId: 56,
    name: 'BSC Mainnet',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 }
  }
};

class BlockchainService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private encryptionKey: string;

  constructor() {
    // Initialize encryption key from environment
    this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    
    // Initialize providers for configured chains
    Object.values(CHAIN_CONFIGS).forEach(config => {
      this.providers.set(config.chainId, new ethers.JsonRpcProvider(config.rpcUrl));
    });
  }

  // Get provider for specific chain
  getProvider(chainId: number): ethers.JsonRpcProvider {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`No provider configured for chainId ${chainId}`);
    }
    return provider;
  }

  // Get chain configuration
  getChainConfig(chainId: number): ChainConfig {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) {
      throw new Error(`No configuration for chainId ${chainId}`);
    }
    return config;
  }

  // Encrypt private key
  encryptPrivateKey(privateKey: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt private key
  decryptPrivateKey(encryptedKey: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Create new custodial wallet
  async createCustodialWallet(userId: string, chainId: number): Promise<any> {
    const wallet = ethers.Wallet.createRandom();
    const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey);

    const newWallet = new Wallet({
      userId,
      address: wallet.address.toLowerCase(),
      privateKeyEncrypted: encryptedPrivateKey,
      type: 'custodial',
      chainId,
      isPrimary: true,
      isActive: true
    });

    await newWallet.save();

    return {
      address: wallet.address,
      walletId: newWallet._id
    };
  }

  // Get signer for custodial wallet
  async getSigner(walletId: string, chainId: number): Promise<ethers.Wallet> {
    const wallet = await Wallet.findById(walletId).select('+privateKeyEncrypted');
    if (!wallet || !wallet.privateKeyEncrypted) {
      throw new Error('Wallet not found or not custodial');
    }

    const privateKey = this.decryptPrivateKey(wallet.privateKeyEncrypted);
    const provider = this.getProvider(chainId);
    return new ethers.Wallet(privateKey, provider);
  }

  // Get native balance (ETH, MATIC, etc.)
  async getNativeBalance(address: string, chainId: number): Promise<string> {
    const provider = this.getProvider(chainId);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Get ERC20 token balance
  async getTokenBalance(address: string, tokenAddress: string, chainId: number): Promise<string> {
    const provider = this.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  // Get token information
  async getTokenInfo(tokenAddress: string, chainId: number) {
    const provider = this.getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      address: tokenAddress,
      chainId
    };
  }

  // Send native currency (ETH, MATIC, etc.)
  async sendNative(
    walletId: string,
    toAddress: string,
    amount: string,
    chainId: number
  ): Promise<ethers.TransactionReceipt> {
    const signer = await this.getSigner(walletId, chainId);
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount)
    });

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    return receipt;
  }

  // Send ERC20 token
  async sendToken(
    walletId: string,
    toAddress: string,
    amount: string,
    tokenAddress: string,
    chainId: number
  ): Promise<ethers.TransactionReceipt> {
    const signer = await this.getSigner(walletId, chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    
    const tx = await contract.transfer(toAddress, ethers.parseUnits(amount, decimals));
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    return receipt;
  }

  // Approve token spending
  async approveToken(
    walletId: string,
    spenderAddress: string,
    amount: string,
    tokenAddress: string,
    chainId: number
  ): Promise<ethers.TransactionReceipt> {
    const signer = await this.getSigner(walletId, chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    
    const tx = await contract.approve(spenderAddress, ethers.parseUnits(amount, decimals));
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    return receipt;
  }

  // Monitor transaction status
  async getTransactionStatus(txHash: string, chainId: number) {
    const provider = this.getProvider(chainId);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { status: 'pending', confirmations: 0 };
    }

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;

    return {
      status: receipt.status === 1 ? 'success' : 'failed',
      confirmations,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.gasPrice?.toString() || '0'
    };
  }

  // Process deposit
  async processDeposit(
    userId: string,
    currencyId: string,
    amount: string,
    txHash: string,
    chainId: number
  ) {
    try {
      // Verify transaction
      const txStatus = await this.getTransactionStatus(txHash, chainId);
      
      if (txStatus.status !== 'success') {
        throw new Error('Transaction not confirmed or failed');
      }

      // Get currency details
      const currency = await Currency.findById(currencyId);
      if (!currency) {
        throw new Error('Currency not found');
      }

      // Create transaction record
      const transaction = new Transaction({
        userId,
        currencyId,
        type: 'deposit',
        amount: parseFloat(amount),
        fee: currency.depositFee,
        netAmount: parseFloat(amount) - currency.depositFee,
        status: 'completed',
        txHash,
        chainId,
        blockNumber: txStatus.blockNumber,
        confirmations: txStatus.confirmations
      });

      await transaction.save();

      // Update user balance
      let balance = await Balance.findOne({ userId, currencyId });
      if (!balance) {
        balance = new Balance({ userId, currencyId, available: 0, locked: 0 });
      }
      
      await balance.credit(transaction.netAmount);

      return { transaction, balance };
    } catch (error: any) {
      console.error('Deposit processing error:', error);
      throw error;
    }
  }

  // Process withdrawal
  async processWithdrawal(
    userId: string,
    currencyId: string,
    amount: string,
    toAddress: string,
    walletId: string,
    chainId: number
  ) {
    try {
      // Get currency details
      const currency = await Currency.findById(currencyId);
      if (!currency) {
        throw new Error('Currency not found');
      }

      // Check minimum withdrawal
      if (parseFloat(amount) < currency.minWithdrawal) {
        throw new Error(`Minimum withdrawal is ${currency.minWithdrawal} ${currency.symbol}`);
      }

      // Calculate total with fee
      const totalAmount = parseFloat(amount) + currency.withdrawalFee;

      // Check balance
      const balance = await Balance.findOne({ userId, currencyId });
      if (!balance || balance.available < totalAmount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from balance
      await balance.deduct(totalAmount);

      // Create transaction record
      const transaction = new Transaction({
        userId,
        currencyId,
        type: 'withdrawal',
        amount: parseFloat(amount),
        fee: currency.withdrawalFee,
        netAmount: parseFloat(amount),
        status: 'processing',
        toAddress: toAddress.toLowerCase(),
        chainId,
        walletId
      });

      await transaction.save();

      // Send blockchain transaction
      let receipt;
      if (currency.isNative) {
        receipt = await this.sendNative(walletId, toAddress, amount, chainId);
      } else if (currency.contractAddress) {
        receipt = await this.sendToken(walletId, toAddress, amount, currency.contractAddress, chainId);
      } else {
        throw new Error('Invalid currency configuration');
      }

      // Update transaction with blockchain details
      transaction.status = 'completed';
      transaction.txHash = receipt.hash;
      transaction.blockNumber = receipt.blockNumber;
      transaction.gasUsed = Number(receipt.gasUsed);
      transaction.gasPrice = Number(receipt.gasPrice || 0);
      await transaction.save();

      return { transaction, receipt };
    } catch (error: any) {
      console.error('Withdrawal processing error:', error);
      
      // Rollback balance if transaction failed
      const balance = await Balance.findOne({ userId, currencyId });
      if (balance) {
        const currency = await Currency.findById(currencyId);
        if (currency) {
          await balance.credit(parseFloat(amount) + currency.withdrawalFee);
        }
      }
      
      throw error;
    }
  }

  // Get gas estimate
  async estimateGas(
    from: string,
    to: string,
    value: string,
    chainId: number,
    data?: string
  ): Promise<bigint> {
    const provider = this.getProvider(chainId);
    return await provider.estimateGas({
      from,
      to,
      value: ethers.parseEther(value),
      data
    });
  }

  // Get current gas price
  async getGasPrice(chainId: number): Promise<bigint> {
    const provider = this.getProvider(chainId);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }
}

export default new BlockchainService();

