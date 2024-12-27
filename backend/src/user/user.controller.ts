import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UserInputDto } from './dto/user-input.dto';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Body() userData: UserInputDto): Promise<UserResponseDto> {
    const user = await this.userService.create(userData);
    return new UserResponseDto(user);
  }

  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getAllUsers();
    return users.map((user) => new UserResponseDto(user));
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userData: Partial<UserInputDto>): Promise<UserResponseDto> {
    const user = await this.userService.update(id, userData);
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.userService.delete(id);
      return { message: `User with id ${id} deleted successfully` };
    } catch (error) {
      throw new Error(`Failed to delete user with id ${id}: ${error.message}`);
    }
  }
}