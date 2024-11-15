import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() userData: CreateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.create(
      userData.fullName,
      userData.email,
      userData.password,
      userData.type,
      userData.companyId
    );
    return new UserResponseDto(user);
  }

  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getAllUsers();
    return users.map(user => new UserResponseDto(user));
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new UserResponseDto(user);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string, 
    @Body() userData: UpdateUserDto
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userService.update(id, userData);
    return new UserResponseDto(updatedUser);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
