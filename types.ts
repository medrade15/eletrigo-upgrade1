export enum ElectricianStatus {
  Pending = 'Aguardando Aprovação',
  Approved = 'Aprovado',
  Suspended = 'Suspenso',
}

export enum ServiceStatus {
  Requested = 'Solicitado',
  Accepted = 'Aceito',
  InProgress = 'Em Atendimento',
  Completed = 'Concluído',
  Cancelled = 'Cancelado',
}

export interface ChatMessage {
  sender: 'client' | 'electrician';
  message: string;
  timestamp: string;
}

export interface Electrician {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  profilePictureUrl: string;
  documentUrl: string;
  experience: string;
  status: ElectricianStatus;
  rating: number;
  joinDate: string;
}

export interface Product {
  id: string;
  name:string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
}

export interface Service {
  id: string;
  clientName: string;
  electricianId: string;
  electricianName: string;
  serviceType: 'Emergencial' | 'Agendado';
  address: string;
  status: ServiceStatus;
  date: string;
  value: number;
  eta?: number; // Estimated Time of Arrival in minutes
  cep?: string;
  referencePoint?: string;
  location?: { lat: number; lon: number };
  chat?: ChatMessage[];
  clientRating?: number;
  electricianRating?: number;
  serviceDescription?: string; // What is the service? e.g., "Troca de Tomada"
  serviceNotes?: string; // Additional details from client
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
}