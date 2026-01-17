import { randomInt } from 'crypto'

//
export const generateOTP = () => {
  return String(randomInt(100000, 1000000))
}

export const generateCancelPaymentJobId = (paymentId: number) => {
  return `cancel-payment-${paymentId}`
}
