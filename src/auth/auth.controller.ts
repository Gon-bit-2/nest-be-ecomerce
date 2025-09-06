import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginBodyDTO, RegisterBodyDTO, RegisterResDTO, SendOPTBodyDTO } from 'src/auth/dto/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { IP } from 'src/shared/decorators/ip.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async create(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('otp')
  async sendOTP(@Body() body: SendOPTBodyDTO) {
    return await this.authService.sendOTP(body)
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  findOne(@Body() body: any) {
    return this.authService.refreshToken(body)
  }

  @Post('login')
  update(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @IP() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }
}
