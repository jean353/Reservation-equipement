import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// ReservationStatus is now a string

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { name: true, email: true } },
        room: true,
        equipments: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { room: true, equipments: true },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true, equipments: true, history: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  async create(data: any) {
    const {
      userId,
      roomId,
      equipmentIds,
      startTime,
      endTime,
      title,
      description,
    } = data;

    // 1. Check for Room conflicts if roomId is provided
    if (roomId) {
      const roomConflict = await this.prisma.reservation.findFirst({
        where: {
          roomId,
          status: { in: ['APPROVED', 'PENDING'] },
          OR: [
            {
              startTime: { lt: new Date(endTime) },
              endTime: { gt: new Date(startTime) },
            },
          ],
        },
      });
      if (roomConflict)
        throw new ConflictException('Salle occupée pour ce créneau.');
    }

    // 2. Check for Equipment conflicts if equipmentIds are provided
    if (equipmentIds && equipmentIds.length > 0) {
      for (const equipId of equipmentIds) {
        const equipConflict = await this.prisma.reservation.findFirst({
          where: {
            equipments: { some: { id: equipId } },
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
            status: { in: ['APPROVED', 'PENDING'] },
          },
        });
        if (equipConflict) {
          const equip = await this.prisma.equipment.findUnique({
            where: { id: equipId },
          });
          throw new ConflictException(
            `L'équipement ${equip?.name} est déjà réservé.`,
          );
        }
      }
    }

    // 3. Create Reservation
    return this.prisma.reservation.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        user: { connect: { id: userId } },
        room: roomId ? { connect: { id: roomId } } : undefined,
        equipments: equipmentIds
          ? { connect: equipmentIds.map((id) => ({ id })) }
          : undefined,
        history: {
          create: {
            action: 'CREATED',
            performedBy: 'System',
            details: 'Réservation initialisée',
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string, performedBy: string) {
    return this.prisma.reservation.update({
      where: { id },
      data: {
        status,
        history: {
          create: {
            action: status,
            performedBy,
            details: `Statut mis à jour vers ${status}`,
          },
        },
      },
    });
  }

  async getReports() {
    // Basic stats for reporting
    const totalReservations = await this.prisma.reservation.count();
    const approvedReservations = await this.prisma.reservation.count({
      where: { status: 'APPROVED' },
    });
    const mostReservedRooms = await this.prisma.room.findMany({
      include: { _count: { select: { reservations: true } } },
      orderBy: { reservations: { _count: 'desc' } },
      take: 5,
    });

    return {
      totalReservations,
      approvedReservations,
      mostReservedRooms,
    };
  }
}
