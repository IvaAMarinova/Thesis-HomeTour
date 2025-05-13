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
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { PartialUserInputDto } from './dto/user-partial-input.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createUser(@Body() userData: UserInputDto): Promise<UserResponseDto> {
    const user = await this.userService.create(userData);
    return new UserResponseDto(user);
  }

  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('/make-b2b/:id')
  async makeUserB2B(
    @Param('id') userId: string,
    @Body() body: any,
  ): Promise<UserResponseDto> {
    const user = await this.userService.makeUserB2B(userId, body.companyId);
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('/make-b2b-email/:email')
  async makeUserB2BByEmail(
    @Param('email') email: string,
    @Body() body: any,
  ): Promise<UserResponseDto> {
    const user = await this.userService.makeUserB2BByEmail(
      email,
      body.companyId,
    );
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('/make-b2c/:id')
  async makeUserB2C(@Param('id') userId: string): Promise<UserResponseDto> {
    const user = await this.userService.makeUserB2C(userId);
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: PartialUserInputDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(id, userData);
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('/admin/:id')
  async updateUserAdmin(
    @Param('id') id: string,
    @Body() userData: Partial<UserInputDto>,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateAdmin(id, userData);
    return new UserResponseDto(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.userService.delete(id);
      return { message: `User deleted successfully` };
    } catch (error) {
      throw new Error(`Failed to delete user with id ${id}: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('/make-admin/:id')
  async makeUserAdmin(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.makeUserAdmin(id);
    return new UserResponseDto(user);
  }  
}
