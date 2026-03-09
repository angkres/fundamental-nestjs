import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }


    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const user = this.usersRepository.create(createUserDto);
            return await this.usersRepository.save(user);
        } catch (error: any) {
            if (error.code === '23505') { // unique violation
                throw new ConflictException('Username or email already exists');
            }
            throw new InternalServerErrorException('Failed to create user');
        }
    }
}
