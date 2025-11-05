import { Electrician, Product, Service, ElectricianStatus, ServiceStatus, Client } from './types';

export const MOCK_ELECTRICIANS: Electrician[] = [
  {
    id: 'elec_1',
    name: 'Carlos Silva',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'carlos.silva@email.com',
    address: 'Rua das Flores, 123, São Paulo, SP',
    profilePictureUrl: 'https://picsum.photos/seed/carlos/200',
    documentUrl: 'https://example.com/doc1.pdf',
    experience: '5 anos de experiência em instalações residenciais e comerciais.',
    status: ElectricianStatus.Approved,
    rating: 4.8,
    joinDate: '2023-01-15',
  },
  // Pending and Suspended users removed for a cleaner start.
  // New electricians will be added via registration.
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Disjuntor Monopolar 20A',
    imageUrl: 'https://picsum.photos/seed/disjuntor/400',
    price: 15.90,
    stock: 150,
    category: 'Disjuntores',
  },
  {
    id: 'prod_2',
    name: 'Fio Elétrico Flexível 2.5mm (Rolo 100m)',
    imageUrl: 'https://picsum.photos/seed/fio/400',
    price: 120.50,
    stock: 80,
    category: 'Fios e Cabos',
  },
  {
    id: 'prod_3',
    name: 'Lâmpada LED Bulbo 9W Branca',
    imageUrl: 'https://picsum.photos/seed/lampada/400',
    price: 8.75,
    stock: 300,
    category: 'Iluminação',
  },
  {
    id: 'prod_4',
    name: 'Tomada Dupla 10A Branca',
    imageUrl: 'https://picsum.photos/seed/tomada/400',
    price: 12.00,
    stock: 250,
    category: 'Tomadas e Interruptores',
  },
];

// Services start empty to be populated by client requests.
export const MOCK_SERVICES: Service[] = [];

// Clients start empty to be populated by new registrations.
export const MOCK_CLIENTS: Client[] = [];