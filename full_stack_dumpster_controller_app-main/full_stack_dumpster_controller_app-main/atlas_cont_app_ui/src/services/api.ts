import axios from 'axios';
import type { Container } from '../types/container';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchContainersFromApi = async (): Promise<Container[]> => {
  const response = await api.get('/containers');
  return response.data;
};

export const simulateContainerApi = async (id: number): Promise<Container> => {
  const response = await api.post(`/containers/${id}/simulate`);
  return response.data;
};

export const simulateAllContainersApi = async (): Promise<Container[]> => {
  const response = await api.post('/containers/simulate-all');
  return response.data;
};

export const addRandomTrashApi = async (id: number): Promise<Container> => {
  const response = await api.post(`/containers/${id}/add-trash`);
  return response.data;
};

export const addRandomTrashToAllApi = async (): Promise<Container[]> => {
  const response = await api.post('/containers/add-trash-all');
  return response.data;
};

export const createContainerApi = async (containerData: Partial<Container>): Promise<Container> => {
  const response = await api.post('/containers', containerData);
  return response.data;
};

export const deleteContainerApi = async (id: number): Promise<void> => {
  await api.delete(`/containers/${id}`);
};
