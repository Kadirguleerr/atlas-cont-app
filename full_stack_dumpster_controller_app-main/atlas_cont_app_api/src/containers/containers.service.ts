import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Container, ContainerDocument, ContainerItem } from './schemas/container.schema';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { POSSIBLE_TRASH_ITEMS } from './data/trash-types';

@Injectable()
export class ContainersService {
  constructor(
    @InjectModel(Container.name) private containerModel: Model<ContainerDocument>,
  ) {}

  async findAll(): Promise<Container[]> {
    return this.containerModel.find().exec();
  }

  async findOne(id: number): Promise<Container> {
    const container = await this.containerModel.findOne({ id }).exec();
    if (!container) {
      throw new NotFoundException(`Konteyner #${id} bulunamadı`);
    }
    return container;
  }

  async create(createContainerDto: CreateContainerDto): Promise<Container> {
    const createdContainer = new this.containerModel(createContainerDto);
    return createdContainer.save();
  }

  async update(id: number, updateContainerDto: UpdateContainerDto): Promise<Container> {
    const existingContainer = await this.containerModel
      .findOneAndUpdate({ id }, updateContainerDto, { new: true })
      .exec();
    if (!existingContainer) {
      throw new NotFoundException(`Konteyner #${id} bulunamadı`);
    }
    return existingContainer;
  }

  async remove(id: number): Promise<void> {
    const result = await this.containerModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Konteyner #${id} bulunamadı`);
    }
  }

  async simulateContainer(id: number): Promise<Container> {
    const container = await this.findOne(id);
    
    const items = container.items || [];

    // --- ANALİZ VE HESAPLAMA ADIMI ---
    const totalVolume = items.reduce((sum, item) => sum + item.volume_cm3, 0);
    const totalWeight = items.reduce((sum, item) => sum + item.weight_kg, 0);
    const maxVolume = container.dimensions.max_volume_cm3;
    const maxWeight = container.dimensions.max_weight_kg;

    // Yerleşim/Paketleme Verimliliği Hesaplama (Gerçekçi formül)
    // Nesne sayısı arttıkça boşluk optimizasyonu değişir
    let packingEfficiency = 95; // Varsayılan en verimli hali
    if (items.length > 0) {
      packingEfficiency = Math.max(65, 95 - (items.length * 1.8)); // Nesne arttıkça verimlilik düşer
    }

    // Hacimsel Doluluk Oranı Hesaplama (Paketleme verimsizliği hesaba katılır)
    // Nesnelerin kapladığı hacim, paketleme verimliliğine bölünerek gerçek doluluk alanı bulunur
    let calculatedFillRate = 0;
    if (items.length > 0 && maxVolume > 0) {
      const occupiedVolume = totalVolume / (packingEfficiency / 100);
      calculatedFillRate = Math.min(100, Math.round((occupiedVolume / maxVolume) * 100));
    }

    // Ağırlık sınırı kontrolü
    if (totalWeight >= maxWeight) {
      calculatedFillRate = 100; // Ağırlık limitine ulaşıldıysa doluluk %100 kabul edilir
    }

    // Doluluk oranına göre durum belirle
    let status = 'EMPTY';
    if (calculatedFillRate >= 75) status = 'CRITICAL';
    else if (calculatedFillRate >= 50) status = 'WARNING';
    else if (calculatedFillRate >= 10) status = 'NORMAL';

    // Tahmini dolma süresi tahmini
    let estimatedFullTime = '> 1 gün';
    if (calculatedFillRate >= 95) estimatedFullTime = '0 dk (Dolu)';
    else if (calculatedFillRate >= 90) estimatedFullTime = '15 dk';
    else if (calculatedFillRate >= 80) estimatedFullTime = '30 dk';
    else if (calculatedFillRate >= 70) estimatedFullTime = '1 saat';
    else if (calculatedFillRate >= 50) estimatedFullTime = '4 saat';
    else if (calculatedFillRate >= 25) estimatedFullTime = '12 saat';

    // AI Analiz yapısını güncelle
    const updatedAnalysis = {
      calculated_fill_rate: calculatedFillRate,
      current_weight_kg: parseFloat(totalWeight.toFixed(2)),
      status: status,
      estimated_full_time: estimatedFullTime,
      packing_efficiency: Math.round(packingEfficiency),
      last_ai_scan: 'Şimdi',
    };

    // Veritabanında güncelle
    await this.containerModel.updateOne(
      { id },
      { 
        $set: { 
          ai_analysis: updatedAnalysis 
        } 
      }
    );

    // Güncel veriyi plain nesne olarak döndür (id garantili)
    const plain = (container as ContainerDocument).toObject();
    plain.id = id;
    plain.ai_analysis = updatedAnalysis;
    return plain;
  }

  // -----------------------------------------------------------------------
  // RASTGELE SİMÜLASYON: Eski çöpleri siler, tamamen yeni rastgele çöpler ekler
  // ve ardından fiziksel simülasyonu yeniden çalıştırır.
  // -----------------------------------------------------------------------
  async randomizeContainer(id: number): Promise<Container> {
    const container = await this.findOne(id);
    
    // Konteynerin her simülasyonda farklı doluluklara (boş, orta, oldukça dolu vb.)
    // sahip olması için çöp sayısını daha geniş bir aralıkta (örn: 3 - 15) seçiyoruz.
    const numItems = Math.floor(Math.random() * 13) + 3;
    const newItems: ContainerItem[] = [];
    
    for (let i = 0; i < numItems; i++) {
      const randomTrash = POSSIBLE_TRASH_ITEMS[Math.floor(Math.random() * POSSIBLE_TRASH_ITEMS.length)];
      newItems.push({
        id: `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        name: randomTrash.name,
        category: randomTrash.category,
        width: randomTrash.width,
        height: randomTrash.height,
        depth: randomTrash.depth,
        volume_cm3: randomTrash.volume_cm3,
        weight_kg: randomTrash.weight_kg,
        confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
        detected_at: new Date().toISOString(),
      });
    }

    // Eski çöpleri silip tamamen yeni çöpleri kaydediyoruz
    await this.containerModel.updateOne(
      { id },
      { $set: { items: newItems } }
    );

    // Fiziksel hesaplama ve AI analizini çalıştır
    return this.simulateContainer(id);
  }

  // Tüm konteynerleri rastgele değerlerle güncelle ("Simüle Et" butonu)
  async randomizeAllContainers(): Promise<Container[]> {
    const containers = await this.findAll();
    const updated: Container[] = [];
    for (const container of containers) {
      updated.push(await this.randomizeContainer(container.id));
    }
    return updated;
  }

  // -----------------------------------------------------------------------
  // RASTGELE ÇÖP EKLEME: Konteynerin içerisine fiziki olarak yeni objeler
  // yerleştirir ve doluluğun yeniden hesaplanmasını tetikler.
  // -----------------------------------------------------------------------
  async addRandomTrash(id: number): Promise<Container> {
    const container = await this.findOne(id);
    
    if (container.ai_analysis.calculated_fill_rate >= 100) {
      throw new BadRequestException(`Konteyner tamamen dolu (%100). Daha fazla çöp eklenemez.`);
    }

    // Her tıklamada sadece 1 adet çöp ekleyelim (yavaş yavaş dolması için)
    const numItems = 1;
    const newItems: ContainerItem[] = [];
    
    for (let i = 0; i < numItems; i++) {
      const randomTrash = POSSIBLE_TRASH_ITEMS[Math.floor(Math.random() * POSSIBLE_TRASH_ITEMS.length)];
      newItems.push({
        id: `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        name: randomTrash.name,
        category: randomTrash.category,
        width: randomTrash.width,
        height: randomTrash.height,
        depth: randomTrash.depth,
        volume_cm3: randomTrash.volume_cm3,
        weight_kg: randomTrash.weight_kg,
        confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(2)),
        detected_at: new Date().toISOString(),
      });
    }

    const updatedItems = [...(container.items || []), ...newItems];

    // Yeni çöpleri veritabanına kaydet
    await this.containerModel.updateOne(
      { id },
      { $set: { items: updatedItems } }
    );

    // Çöpler eklendiği için mevcut analiz fonksiyonunu çağırıp
    // ai_analysis sonuçlarını (doluluk, ağırlık vs) gerçeğe uygun şekilde güncelliyoruz.
    return this.simulateContainer(id);
  }

  async addRandomTrashToAll(): Promise<Container[]> {
    const containers = await this.findAll();
    const updated: Container[] = [];
    for (const container of containers) {
      if (container.ai_analysis.calculated_fill_rate < 100) {
        updated.push(await this.addRandomTrash(container.id));
      } else {
        updated.push(container); // Zaten doluysa olduğu gibi bırak
      }
    }
    return updated;
  }
}
