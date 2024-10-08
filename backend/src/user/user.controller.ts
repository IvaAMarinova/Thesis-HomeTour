import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UserType } from './user.entity';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() body: { fullName: string; email: string; type: UserType; companyId?: string }
  ): Promise<User> {
    return this.userService.create(body.fullName, body.email, body.type, body.companyId);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: Partial<User>): Promise<User> {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }


}
