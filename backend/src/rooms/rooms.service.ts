import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.room.findMany({
      include: { images: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  async create(data: Prisma.RoomCreateInput) {
    return this.prisma.room.create({
      data,
      include: { images: true },
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput) {
    return this.prisma.room.update({
      where: { id },
      data,
      include: { images: true },
    });
  }


  async remove(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async addImages(roomId: string, files: Express.Multer.File[]) {
    const images = await Promise.all(
      files.map((file) =>
        this.prisma.roomImage.create({
          data: {
            url: `/uploads/${file.filename}`,
            roomId,
          },
        }),
      ),
    );
    return images;
  }

  async deleteImage(imageId: string) {
    return this.prisma.roomImage.delete({
      where: { id: imageId },
    });
  }
}
