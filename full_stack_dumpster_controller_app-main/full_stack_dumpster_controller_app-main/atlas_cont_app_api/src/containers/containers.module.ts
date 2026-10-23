import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContainersController } from './containers.controller';
import { ContainersService } from './containers.service';
import { Container, ContainerSchema } from './schemas/container.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Container.name, schema: ContainerSchema }])
  ],
  controllers: [ContainersController],
  providers: [ContainersService]
})
export class ContainersModule {}
