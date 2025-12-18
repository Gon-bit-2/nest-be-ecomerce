import { Controller, Get, Body, Put } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetUserProfileResDTO, UpdateUserProfileResDTO } from 'src/shared/dtos/share-user.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from './dto/profile.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDTO)
  async getProfile(@ActiveUser('userId') userId: number) {
    return await this.profileService.getProfile(userId)
  }

  @Put()
  @ZodSerializerDto(UpdateUserProfileResDTO)
  async updateProfile(@ActiveUser('userId') userId: number, @Body() body: UpdateMeBodyDTO) {
    return await this.profileService.updateProfile({ userId, body })
  }
  @Put('change-password')
  @ZodSerializerDto(MessageResDTO)
  async changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.profileService.changePassword({ userId, body })
  }
}
