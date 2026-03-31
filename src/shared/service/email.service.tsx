import React from 'react'
import { Injectable } from '@nestjs/common'
import { OTPVerificationEmail } from 'emails/otp'
import { Resend } from 'resend'
import envConfig from 'src/shared/config'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTPToEMAIL = async (payload: { email: string; code: string }) => {
    // const otpTemplate = fs.readFileSync(path.resolve('src/shared/template/email/email-otp.html'), {
    //   encoding: 'utf8',
    // })
    const subject = 'Mã OTP'
    return await this.resend.emails.send({
      from: 'thiendev <no-reply@thiendev.id.vn>',
      to: [payload.email],
      subject: subject,
      react: <OTPVerificationEmail otpCode={payload.code} title={subject} />,
    })
  }

  sendPaymentSuccessEmail = async (payload: { email: string; orderCode: string; amount: number }) => {
    const subject = `Thanh toán thành công đơn hàng ${payload.orderCode !== 'N/A' ? '#' + payload.orderCode : ''}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Cảm ơn bạn đã mua hàng!</h2>
        <p>Chúng tôi đã nhận được thanh toán cho đơn hàng <strong>${payload.orderCode !== 'N/A' ? '#' + payload.orderCode : 'của bạn'}</strong>.</p>
        <p>Số tiền đã thanh toán: <strong>${payload.amount.toLocaleString('vi-VN')} VND</strong></p>
        <br/>
        <p>Đơn hàng của bạn sẽ sớm được xử lý và giao đến bạn trong thời gian sớm nhất.</p>
        <p>Xin cảm ơn!</p>
      </div>
    `
    return await this.resend.emails.send({
      from: 'thiendev <no-reply@thiendev.id.vn>',
      to: [payload.email],
      subject: subject,
      html: htmlContent,
    })
  }
}
