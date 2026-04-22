import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.room.findMany();
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.room.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
