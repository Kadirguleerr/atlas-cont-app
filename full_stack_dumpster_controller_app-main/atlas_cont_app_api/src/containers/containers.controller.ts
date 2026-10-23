import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';

@Controller('api/containers')
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Post()
  create(@Body() createContainerDto: CreateContainerDto) {
    return this.containersService.create(createContainerDto);
  }

  @Get()
  findAll() {
    return this.containersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.containersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContainerDto: UpdateContainerDto,
  ) {
    return this.containersService.update(id, updateContainerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.containersService.remove(id);
  }

  @Post('simulate-all')
  simulateAll() {
    return this.containersService.randomizeAllContainers();
  }

  @Post(':id/simulate')
  simulate(@Param('id', ParseIntPipe) id: number) {
    return this.containersService.simulateContainer(id);
  }

  @Post('add-trash-all')
  addTrashAll() {
    return this.containersService.addRandomTrashToAll();
  }

  @Post(':id/add-trash')
  addTrash(@Param('id', ParseIntPipe) id: number) {
    return this.containersService.addRandomTrash(id);
  }
}
