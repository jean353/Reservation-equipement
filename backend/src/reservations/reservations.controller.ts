import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// Role and ReservationStatus are now strings in SQLite

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('my')
  findMy(@Request() req: any) {
    return this.reservationsService.findByUserId(req.user.userId);
  }

  @Get('reports')
  getReports() {
    return this.reservationsService.getReports();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() createDto: any) {
    return this.reservationsService.create({
      ...createDto,
      userId: req.user.userId,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update reservation status');
    }
    return this.reservationsService.updateStatus(id, status, req.user.email);
  }
}
