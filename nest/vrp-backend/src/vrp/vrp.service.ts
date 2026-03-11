/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class VrpService {
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
}
