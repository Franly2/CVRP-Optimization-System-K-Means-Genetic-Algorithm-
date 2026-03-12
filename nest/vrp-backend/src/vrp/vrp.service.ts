/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ClusterRequest } from './dto/cluster.dto';

@Injectable()
export class VrpService {
    constructor(private readonly prisma: PrismaService) {}
    async getOptimizedRoute(lat: number, lng: number) {
        const targets = [
        { id: 'A', latitude: lat + 0.003, longitude: lng + 0.003, title: 'Paket A' },
        { id: 'B', latitude: lat - 0.004, longitude: lng + 0.002, title: 'Paket B' }
        ];

        const coordinates = `${lng},${lat};${targets[0].longitude},${targets[0].latitude};${targets[1].longitude},${targets[1].latitude}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        const routeCoords = data.routes[0].geometry.coordinates.map((point: number[]) => ({
        latitude: point[1],
        longitude: point[0],
        }));

        return {
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
        coords: routeCoords,
        targets: targets, // Kirim daftar paket juga buat ditampilin di frontend
        };
    } 

    // Fungsi untuk generate payload testing
  async generateTestPayload() {
    // Ambil 5 kurir pertama
    const drivers = await this.prisma.user.findMany({
      take: 5,
      select: { id: true },
    });

    // Ambil 50 paket pertama yang statusnya PENDING
    const packages = await this.prisma.package.findMany({
      where: { status: 'PENDING' },
      take: 50,
      select: { id: true },
    });

    return {
      driverIds: drivers.map(d => d.id),
      packageIds: packages.map(p => p.id),
      depotLocation: {
        lat: -7.3193, // Koordinat dummy Gudang 
        lng: 112.7386
      }
    };
  }

    private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius Bumi dalam km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Hasil dalam km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

    

    async cluster(payload: ClusterRequest) {
    const { driverIds, packageIds, depotLocation } = payload;
    const MAX_ITERATIONS = 100; // Maksimal putaran K-Means
    const MAX_RADIUS_KM = 100;

    // data hydration
    const drivers = await this.prisma.user.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, fullName: true, maxCapacity: true },
    });

    const packages = await this.prisma.package.findMany({
      where: { id: { in: packageIds }, status: 'PENDING' },
      select: { id: true, lat: true, lng: true, weight: true, volume: true },
    });

    // validasi dasar
    if (drivers.length === 0) {
      throw new BadRequestException('Kurir tidak ditemukan atau belum dipilih.');
    }
    if (packages.length === 0) {
      throw new BadRequestException('Tidak ada paket PENDING yang bisa diproses.');
    }
    
    // Validasi apakah ada paket yang lat/lng-nya kosong (asumsi pengirim input titik lokasi semua)
    const invalidPackages = packages.filter(p => !p.lat || !p.lng);
    if (invalidPackages.length > 0) {
       throw new BadRequestException(`Ada ${invalidPackages.length} paket yang belum punya koordinat GPS.`);
    }

    // jalankan yg namanya clustering
    let k = drivers.length; 

    type PackageData = typeof packages[0];

    interface Centroid {
      driverId: string;
      driverName: string;
      maxCapacity: number;
      lat: number;
      lng: number;
      currentWeight: number;
      assignedPackages: PackageData[];
    }

    // ambil centroid awal
    // ambil posisi 'k' paket secara acak buat jadi titik awal tiap kurir
    const centroids: Centroid[] = [];
    const shuffledPackages = [...packages].sort(() => 0.5 - Math.random());
    for (let i = 0; i < k; i++) {
      centroids.push({
        driverId: drivers[i].id,
        driverName: drivers[i].fullName,
        maxCapacity: drivers[i].maxCapacity,
        lat: shuffledPackages[i]?.lat || depotLocation.lat, 
        lng: shuffledPackages[i]?.lng || depotLocation.lng,
        currentWeight: 0,
        assignedPackages: [], 
      });
    }

    let hasChanged = true;
    let iteration = 0;
    const unassignedPackages = []; // Menampung paket yang tidak muat di motor manapun atau diluar radius maksimal

    // looping kmen
    while (hasChanged && iteration < MAX_ITERATIONS) {
      hasChanged = false;
      iteration++;
      unassignedPackages.length = 0; 

      // ngosongin muatan kurir di setiap awal iterasi buat dihitung ulang
      centroids.forEach(c => {
        c.currentWeight = 0;
        c.assignedPackages = [];
      });

      // itung jarak setiap paket ke tiap centroid, dan assign ke yang terdekat (dengan cek kapasitas)
      for (const pkg of packages) {
        let nearestCentroid = null;
        let minDistance = Infinity;

        for (const centroid of centroids) {
          // CEK KAPASITAS: Apakah motor kurir ini masih muat?
          if (centroid.currentWeight + pkg.weight <= centroid.maxCapacity) {
          // eblom mempertimbangkan volume
          
          const distance = this.calculateHaversineDistance(
            pkg.lat as number, 
            pkg.lng as number, 
            centroid.lat, 
            centroid.lng
            );
            // cek radius sama jarak terdekta, apa ini yang paling dekat?
            if (distance < minDistance && distance <= MAX_RADIUS_KM) {
              minDistance = distance;
              nearestCentroid = centroid;
            }
          }
        }

        // assign paket ke kurir terdekat yang muat
        if (nearestCentroid) {
          nearestCentroid.assignedPackages.push(pkg);
          nearestCentroid.currentWeight += pkg.weight;
        } else {
          unassignedPackages.push(pkg);
        }
      }

      // itung ulang posisi centroid dari rata-rata koordinat paket yang sudah diassign
      for (const centroid of centroids) {
        if (centroid.assignedPackages.length > 0) {
          const sumLat = centroid.assignedPackages.reduce((sum, p) => sum + (p.lat as number), 0);
          const sumLng = centroid.assignedPackages.reduce((sum, p) => sum + (p.lng as number), 0);
          
          const newLat = sumLat / centroid.assignedPackages.length;
          const newLng = sumLng / centroid.assignedPackages.length;

          // Jika Centroid bergeser, maka K-Means harus looping lagi
          // Toleransi pergeseran 0.0001 derajat (sekitar 11 meter)
          if (Math.abs(centroid.lat - newLat) > 0.0001 || Math.abs(centroid.lng - newLng) > 0.0001) {
            hasChanged = true;
          }

          centroid.lat = newLat;
          centroid.lng = newLng;
        }
      }
    }

    return {
      message: 'Clustering K-Means Selesai!',
      totalIterationsRun: iteration,
      depot: depotLocation,
      summary: {
        totalDrivers: k,
        totalPackages: packages.length,
        unassignedPackagesCount: unassignedPackages.length,
      },
      clusters: centroids.map(c => ({
        driverId: c.driverId,
        driverName: c.driverName,
        centerLocation: { lat: c.lat, lng: c.lng },
        totalWeight: c.currentWeight,
        maxCapacity: c.maxCapacity,
        packageCount: c.assignedPackages.length,
        packages: c.assignedPackages,
      })),
      unassigned: unassignedPackages, 
    };
  }
}
