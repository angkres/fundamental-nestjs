import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = this.usersRepository.create({ ...createUserDto, password: hashedPassword });
            return await this.usersRepository.save(user);
        } catch (error: any) {
            if (error.code === '23505') { // unique violation
                throw new ConflictException('Username or email already exists');
            }
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    async updateRefreshToken(id: string, hashedRefreshToken: string | null): Promise<void> {
        await this.usersRepository.update(id, { hashedRefreshToken });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const user = await this.findOne(id);
            this.usersRepository.merge(user, updateUserDto);
            return await this.usersRepository.save(user);
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === '23505') {
                throw new ConflictException('Username or email already exists');
            }
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    async remove(id: string): Promise<void> {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }
}
