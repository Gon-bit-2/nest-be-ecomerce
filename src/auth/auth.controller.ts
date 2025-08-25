import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterBodyDTO, RegisterResDTO } from 'src/auth/dto/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  create(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('login')
  findAll(@Body() body: any) {
    return this.authService.login(body)
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  findOne(@Body() body: any) {
    return this.authService.refreshToken(body)
  }

  @Post('logout')
  update(@Body() body: any) {
    return this.authService.logout(body.refreshToken)
  }
}
