import {
  EntryPoint,
  EntryPoint__factory,
  SimpleAccountFactory__factory,
  EntryPointWrapper__factory,
  UserOperationStruct
} from '@boba/accountabstraction'
import { Wallet } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { expect } from 'chai'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { ethers } from 'hardhat'
import { SimpleAccountAPI } from '../src'
import { SampleRecipient, SampleRecipient__factory } from '@boba/bundler_utils/dist/src/types'
import { DeterministicDeployer } from '../src/DeterministicDeployer'
import { rethrowError } from '@boba/bundler_utils'

const provider = ethers.provider
const signer = provider.getSigner()

describe('SimpleAccountAPI', () => {
  let owner: Wallet
  let api: SimpleAccountAPI
  let entryPoint: EntryPoint
  let beneficiary: string
  let recipient: SampleRecipient
  let accountAddress: string
  let accountDeployed = false

  before('init', async () => {
    entryPoint = await new EntryPoint__factory(signer).deploy()
    beneficiary = await signer.getAddress()

    recipient = await new SampleRecipient__factory(signer).deploy()
    owner = Wallet.createRandom()
    DeterministicDeployer.init(ethers.provider)
    const factoryAddress = await DeterministicDeployer.deploy(new SimpleAccountFactory__factory(), 0, [entryPoint.address])
    api = new SimpleAccountAPI({
      provider,
      entryPointAddress: entryPoint.address,
      owner,
      factoryAddress
    })
  })

  it('#getUserOpHash should match entryPoint.getUserOpHash', async function () {
    const userOp: UserOperationStruct = {
      sender: '0x'.padEnd(42, '1'),
      nonce: 2,
      initCode: '0x3333',
      callData: '0x4444',
      callGasLimit: 5,
      verificationGasLimit: 6,
      preVerificationGas: 7,
      maxFeePerGas: 8,
      maxPriorityFeePerGas: 9,
      paymasterAndData: '0xaaaaaa',
      signature: '0xbbbb'
    }
    const hash = await api.getUserOpHash(userOp)
    const epHash = await entryPoint.getUserOpHash(userOp)
    expect(hash).to.equal(epHash)
  })

  it('should deploy to counterfactual address', async () => {
    accountAddress = await api.getAccountAddress()
    expect(await provider.getCode(accountAddress).then(code => code.length)).to.equal(2)

    await signer.sendTransaction({
      to: accountAddress,
      value: parseEther('0.1')
    })
    const op = await api.createSignedUserOp({
      target: recipient.address,
      data: recipient.interface.encodeFunctionData('something', ['hello'])
    })

    await expect(entryPoint.handleOps([op], beneficiary)).to.emit(recipient, 'Sender')
      .withArgs(anyValue, accountAddress, 'hello')
    expect(await provider.getCode(accountAddress).then(code => code.length)).to.greaterThan(1000)
    accountDeployed = true
  })

  context('#rethrowError', () => {
    let userOp: UserOperationStruct
    before(async () => {
      userOp = await api.createUnsignedUserOp({
        target: ethers.constants.AddressZero,
        data: '0x'
      })
      // expect FailedOp "invalid signature length"
      userOp.signature = '0x11'
    })
    it('should parse FailedOp error', async () => {
      await expect(
        entryPoint.handleOps([userOp], beneficiary)
          .catch(rethrowError))
        .to.revertedWith('FailedOp: AA23 reverted: ECDSA: invalid signature length')
    })
    it('should parse Error(message) error', async () => {
      await expect(
        entryPoint.addStake(0)
      ).to.revertedWith('must specify unstake delay')
    })
    it('should parse revert with no description', async () => {
      // use wrong signature for contract..
      const wrongContract = entryPoint.attach(recipient.address)
      await expect(
        wrongContract.addStake(0)
      ).to.revertedWithoutReason()
    })
  })

  it('should use account API after creation without a factory', async function () {
    if (!accountDeployed) {
      this.skip()
    }
    const api1 = new SimpleAccountAPI({
      provider,
      entryPointAddress: entryPoint.address,
      accountAddress,
      owner
    })
    const op1 = await api1.createSignedUserOp({
      target: recipient.address,
      data: recipient.interface.encodeFunctionData('something', ['world'])
    })
    await expect(entryPoint.handleOps([op1], beneficiary)).to.emit(recipient, 'Sender')
      .withArgs(anyValue, accountAddress, 'world')
  })

  it('should use entryPointWrapper to get counterfactual address', async function () {
    const entryPointWrapper = await new EntryPointWrapper__factory(signer).deploy(entryPoint.address)
    const owner2 = Wallet.createRandom()
    const factoryAddress = await DeterministicDeployer.deploy(new SimpleAccountFactory__factory(), 0, [entryPoint.address])
    const api1 = new SimpleAccountAPI({
      provider,
      entryPointAddress: entryPoint.address,
      entryPointWrapperAddress: entryPointWrapper.address,
      owner: owner2,
      factoryAddress
    })

    const initCode = await api1.getAccountInitCode()
    const addressFromEPW = await entryPointWrapper.callStatic.getSenderAddress(initCode)
    accountAddress = await api1.getCounterFactualAddress()
    expect(addressFromEPW).to.deep.eq(accountAddress)
    expect(await provider.getCode(accountAddress).then(code => code.length)).to.equal(2)

    await signer.sendTransaction({
      to: accountAddress,
      value: parseEther('0.1')
    })
    const op1 = await api1.createSignedUserOp({
      target: recipient.address,
      data: recipient.interface.encodeFunctionData('something', ['hello'])
    })

    await expect(entryPoint.handleOps([op1], beneficiary)).to.emit(recipient, 'Sender')
      .withArgs(anyValue, accountAddress, 'hello')
    expect(await provider.getCode(accountAddress).then(code => code.length)).to.greaterThan(1000)
  })
})
