import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.equipment.findMany();
  }

  async findOne(id: string) {
    return this.prisma.equipment.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.equipment.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.equipment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.equipment.delete({
      where: { id },
    });
  }
}
