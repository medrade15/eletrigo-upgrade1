import React, { useState, useMemo } from 'react';
import { Electrician, Product, Service, Client, ElectricianStatus, ServiceStatus } from '../types';
import { Modal } from './Modal';
import { UsersIcon, UserGroupIcon, ShoppingBagIcon, WrenchScrewdriverIcon, DashboardIcon, ArrowLeftOnRectangleIcon, BoltIcon, StarIcon, CogIcon } from './Icons';

// Reusable Admin Components
const FormRow: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
    <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
        {children}
    </div>
);


// Admin Page Components
const DashboardPage = ({ electricians, products, services, clients }: { electricians: Electrician[], products: Product[], services: Service[], clients: Client[] }) => {
    const pendingElectricians = electricians.filter(e => e.status === ElectricianStatus.Pending).length;
    const activeServices = services.filter(s => s.status === ServiceStatus.InProgress).length;

    const reports = useMemo(() => {
        const totalEarnings = services.reduce((acc, s) => s.status === ServiceStatus.Completed ? acc + s.value : acc, 0);
        
        const servicesByStatus = services.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {} as Record<ServiceStatus, number>);

        const electricianPerformance = services
            .filter(s => s.status === ServiceStatus.Completed)
            .reduce((acc, s) => {
                if(s.electricianId) {
                    acc[s.electricianName] = (acc[s.electricianName] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>);

        const topElectricians = Object.entries(electricianPerformance)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        return { totalEarnings, servicesByStatus, topElectricians };
    }, [services]);


    const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <div className="bg-eletri-blue-100 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Eletricistas Totais" value={electricians.length} icon={<UsersIcon className="w-8 h-8 text-eletri-blue-700"/>} />
                <StatCard title="Clientes Totais" value={clients.length} icon={<UserGroupIcon className="w-8 h-8 text-eletri-blue-700"/>} />
                <StatCard title="Serviços Ativos" value={activeServices} icon={<WrenchScrewdriverIcon className="w-8 h-8 text-eletri-blue-700"/>} />
                <StatCard title="Aprovações Pendentes" value={pendingElectricians} icon={<UsersIcon className="w-8 h-8 text-eletri-yellow-600"/>} />
            </div>

            <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Relatórios Rápidos</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Total Earnings Report */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h4 className="font-bold text-lg text-gray-700">Ganhos Totais</h4>
                         <p className="text-4xl font-bold text-green-600 mt-2">R$ {reports.totalEarnings.toFixed(2)}</p>
                         <p className="text-sm text-gray-500">de serviços concluídos</p>
                    </div>
                    {/* Services by Status Report */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h4 className="font-bold text-lg text-gray-700 mb-3">Serviços por Status</h4>
                        <div className="space-y-2">
                            {Object.entries(reports.servicesByStatus).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-600">{status}</span>
                                    <span className="font-bold text-eletri-blue-800">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Top Electricians Report */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h4 className="font-bold text-lg text-gray-700 mb-3">Eletricistas mais Ativos</h4>
                        <ul className="space-y-2">
                            {reports.topElectricians.map(([name, count], index) => (
                                <li key={name} className="flex items-center gap-3 text-sm">
                                    <span className={`font-bold ${index === 0 ? 'text-eletri-yellow-600' : 'text-gray-500'}`}>#{index + 1}</span>
                                    <span className="font-medium text-gray-800 flex-1">{name}</span>
                                    <span className="font-bold text-gray-800">{count} serviço(s)</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
};

const ElectriciansPage = ({electricians, setElectricians}: {electricians: Electrician[], setElectricians: React.Dispatch<React.SetStateAction<Electrician[]>>}) => {
    const [selectedElectrician, setSelectedElectrician] = useState<Electrician | null>(null);

    const handleStatusChange = (id: string, status: ElectricianStatus) => {
        setElectricians(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    };
    
    const getStatusClass = (status: ElectricianStatus) => {
        switch (status) {
            case ElectricianStatus.Approved:
                return 'bg-green-100 text-green-800';
            case ElectricianStatus.Pending:
                return 'bg-yellow-100 text-yellow-800';
            case ElectricianStatus.Suspended:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Eletricistas</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contato</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {electricians.map(e => (
                            <tr key={e.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm">
                                    <div className="flex items-center">
                                        <img className="w-10 h-10 rounded-full mr-3" src={e.profilePictureUrl} alt={e.name} />
                                        <div>
                                            <p className="text-gray-900 whitespace-no-wrap font-medium">{e.name}</p>
                                            <div className="flex items-center">
                                                 <StarIcon className="w-4 h-4 text-eletri-yellow-500" filled/>
                                                 <span className="text-xs text-gray-600 ml-1">{e.rating > 0 ? e.rating.toFixed(1) : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{e.email}</p>
                                    <p className="text-gray-600 whitespace-no-wrap">{e.phone}</p>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${getStatusClass(e.status)}`}>
                                        <span aria-hidden className="absolute inset-0 opacity-50 rounded-full"></span>
                                        <span className="relative">{e.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSelectedElectrician(e)} className="text-eletri-blue-600 hover:text-eletri-blue-900">Detalhes</button>
                                        {e.status === ElectricianStatus.Pending && (
                                            <button onClick={() => handleStatusChange(e.id, ElectricianStatus.Approved)} className="text-green-600 hover:text-green-900">Aprovar</button>
                                        )}
                                        {e.status === ElectricianStatus.Approved && (
                                            <button onClick={() => handleStatusChange(e.id, ElectricianStatus.Suspended)} className="text-red-600 hover:text-red-900">Suspender</button>
                                        )}
                                        {e.status === ElectricianStatus.Suspended && (
                                            <button onClick={() => handleStatusChange(e.id, ElectricianStatus.Approved)} className="text-green-600 hover:text-green-900">Reativar</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!selectedElectrician} onClose={() => setSelectedElectrician(null)} title="Detalhes do Eletricista">
                {selectedElectrician && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={selectedElectrician.profilePictureUrl} alt={selectedElectrician.name} className="w-24 h-24 rounded-full object-cover" />
                            <div>
                                <h4 className="text-2xl font-bold">{selectedElectrician.name}</h4>
                                <p className="text-gray-600">{selectedElectrician.email}</p>
                                <p className="text-gray-600">{selectedElectrician.phone}</p>
                                <div className="flex items-center mt-2">
                                     <StarIcon className="w-5 h-5 text-eletri-yellow-500" filled/>
                                     <span className="text-lg font-bold text-gray-700 ml-1">{selectedElectrician.rating > 0 ? selectedElectrician.rating.toFixed(1) : 'Sem avaliações'}</span>
                                </div>
                            </div>
                        </div>
                        <div><strong>CPF:</strong> {selectedElectrician.cpf}</div>
                        <div><strong>Endereço:</strong> {selectedElectrician.address}</div>
                        <div><strong>Experiência:</strong> <p className="text-gray-700 italic mt-1">{selectedElectrician.experience}</p></div>
                         <div>
                            <a href={selectedElectrician.documentUrl} target="_blank" rel="noopener noreferrer" className="text-eletri-blue-600 hover:underline">
                                Ver documento de identidade
                            </a>
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    )
};

const ClientsPage = ({ clients, setClients }: { clients: Client[], setClients: React.Dispatch<React.SetStateAction<Client[]>> }) => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const handleDeleteClient = (clientId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação é irreversível.')) {
            setClients(prev => prev.filter(c => c.id !== clientId));
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Clientes</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contato</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data de Cadastro</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap font-medium">{client.name}</p>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{client.email}</p>
                                    <p className="text-gray-600 whitespace-no-wrap">{client.phone}</p>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-700">{client.joinDate}</td>
                                <td className="px-5 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSelectedClient(client)} className="text-eletri-blue-600 hover:text-eletri-blue-900">Detalhes</button>
                                        <button onClick={() => handleDeleteClient(client.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Detalhes do Cliente">
                {selectedClient && (
                    <div className="space-y-4">
                         <div>
                            <h4 className="text-2xl font-bold">{selectedClient.name}</h4>
                            <p className="text-gray-600">{selectedClient.email}</p>
                            <p className="text-gray-600">{selectedClient.phone}</p>
                        </div>
                        <div><strong>Endereço:</strong> {selectedClient.address}</div>
                        <div><strong>Cliente desde:</strong> {selectedClient.joinDate}</div>
                    </div>
                )}
            </Modal>
        </div>
    );
};


const ProductForm = ({ product, onSave, onCancel }: { product: Partial<Product> | null, onSave: (product: Product) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || '',
        price: product?.price || 0,
        stock: product?.stock || 0,
        imageUrl: product?.imageUrl || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category || formData.price <= 0) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        onSave({
            id: product?.id || `prod_${Date.now()}`,
            ...formData,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow label="Nome do Produto">
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
            </FormRow>
             <FormRow label="Categoria">
                <input required type="text" name="category" value={formData.category} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
            </FormRow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormRow label="Preço (R$)">
                    <input required type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                </FormRow>
                 <FormRow label="Estoque">
                    <input required type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" step="1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                </FormRow>
            </div>
             <FormRow label="URL da Imagem">
                <input required type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
            </FormRow>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Salvar Produto
                </button>
            </div>
        </form>
    );
};


const ProductsPage = ({initialProducts}: {initialProducts: Product[]}) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = (productData: Product) => {
        const isEditing = products.some(p => p.id === productData.id);
        if (isEditing) {
            setProducts(products.map(p => p.id === productData.id ? productData : p));
        } else {
            setProducts([...products, productData]);
        }
        handleCloseModal();
    };

    const handleDeleteProduct = (productId: string) => {
        if (window.confirm('Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
            setProducts(products.filter(p => p.id !== productId));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Produtos da Loja</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                    Adicionar Produto
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(p => (
                    <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover"/>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg text-gray-800 truncate">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.category}</p>
                            <div className="flex justify-between items-center mt-4 flex-grow">
                                <p className="text-xl font-semibold text-eletri-blue-800">R$ {p.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">Estoque: {p.stock}</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => handleOpenEditModal(p)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md text-sm font-medium transition-colors">Editar</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-md text-sm font-medium transition-colors">Excluir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}>
                <ProductForm 
                    product={editingProduct} 
                    onSave={handleSaveProduct}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    )
};

const ServiceDetailsModalContent = ({ service }: { service: Service }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');

    const getStatusClass = (status: ServiceStatus) => {
        switch (status) {
            case ServiceStatus.Completed: return 'bg-green-100 text-green-800';
            case ServiceStatus.InProgress: return 'bg-blue-100 text-blue-800';
            case ServiceStatus.Accepted: return 'bg-indigo-100 text-indigo-800';
            case ServiceStatus.Requested: return 'bg-yellow-100 text-yellow-800';
            case ServiceStatus.Cancelled: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div>
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-eletri-blue-500 text-eletri-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Detalhes
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'chat' ? 'border-eletri-blue-500 text-eletri-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Chat
                    </button>
                </nav>
            </div>
            {activeTab === 'details' && (
                <div className="space-y-4 text-gray-700">
                    <div>
                        <h4 className="font-bold text-lg">Cliente: <span className="font-normal">{service.clientName}</span></h4>
                        <h4 className="font-bold text-lg">Eletricista: <span className="font-normal">{service.electricianName || 'Não atribuído'}</span></h4>
                    </div>
                     <div className="p-3 bg-gray-50 rounded-lg border">
                        <h4 className="font-bold mb-2">Localização</h4>
                        <p><strong>Endereço Principal:</strong> {service.address}</p>
                        {service.cep && <p><strong>CEP:</strong> {service.cep}</p>}
                        {service.referencePoint && <p><strong>Ponto de Referência:</strong> {service.referencePoint}</p>}
                        {service.location && (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${service.location.lat},${service.location.lon}`} target="_blank" rel="noopener noreferrer" className="text-eletri-blue-600 hover:underline font-medium inline-block mt-2">
                                Ver localização GPS no mapa
                            </a>
                        )}
                    </div>
                     {service.serviceDescription && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-bold mb-2 text-blue-800">Detalhes do Serviço Agendado</h4>
                            <p><strong>Tipo de Serviço:</strong> {service.serviceDescription}</p>
                            {service.serviceNotes && <p><strong>Observações do Cliente:</strong> {service.serviceNotes}</p>}
                        </div>
                    )}
                    <div><strong>Status:</strong> <span className={`px-2 py-0.5 font-semibold leading-tight rounded-full text-xs ${getStatusClass(service.status)}`}>{service.status}</span></div>
                    <div><strong>Tipo:</strong> {service.serviceType}</div>
                    <div><strong>Data:</strong> {new Date(service.date).toLocaleString('pt-BR')}</div>
                    {service.eta && <div><strong>Tempo Estimado (ETA):</strong> {service.eta} minutos</div>}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                        <div>
                            <p className="font-bold">Avaliação do Cliente:</p>
                            {service.clientRating ? <div className="flex items-center">{Array.from({ length: 5 }).map((_, i) => (<StarIcon key={i} className="w-5 h-5 text-eletri-yellow-500" filled={i < service.clientRating!} />))}{` (${service.clientRating})`}</div> : <p>N/A</p>}
                        </div>
                        <div>
                            <p className="font-bold">Avaliação do Eletricista:</p>
                             {service.electricianRating ? <div className="flex items-center">{Array.from({ length: 5 }).map((_, i) => (<StarIcon key={i} className="w-5 h-5 text-eletri-yellow-500" filled={i < service.electricianRating!} />))}{` (${service.electricianRating})`}</div> : <p>N/A</p>}
                        </div>
                    </div>
                    <div className="text-xl font-bold pt-2 border-t mt-4">Valor: <span className="text-green-600">R$ {service.value.toFixed(2)}</span></div>
                </div>
            )}
            {activeTab === 'chat' && (
                <div className="space-y-3">
                    {service.chat && service.chat.length > 0 ? (
                        service.chat.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'client' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'client' ? 'bg-gray-200 text-gray-800' : 'bg-eletri-blue-600 text-white'}`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-gray-500' : 'text-eletri-blue-200'}`}>{msg.timestamp}</p>
                                </div>
                            </div>
                        ))
                    ) : <p className="text-gray-500 text-center py-4">Nenhuma mensagem no chat.</p>}
                </div>
            )}
        </div>
    );
};


const ServicesPage = ({services}: {services: Service[]}) => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const getStatusClass = (status: ServiceStatus) => {
        switch (status) {
            case ServiceStatus.Completed: return 'bg-green-100 text-green-800';
            case ServiceStatus.InProgress: return 'bg-blue-100 text-blue-800';
            case ServiceStatus.Accepted: return 'bg-indigo-100 text-indigo-800';
            case ServiceStatus.Requested: return 'bg-yellow-100 text-yellow-800';
            case ServiceStatus.Cancelled: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Monitorar Serviços</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                 <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Serviço ID</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente / Eletricista</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(s => (
                             <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm text-gray-600 font-mono">{s.id.slice(0, 8)}...</td>
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-900 font-medium whitespace-no-wrap">{s.clientName}</p>
                                    <p className="text-gray-600 whitespace-no-wrap">{s.electricianName || 'N/A'}</p>
                                </td>
                                 <td className="px-5 py-4 text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${getStatusClass(s.status)}`}>
                                        <span className="relative">{s.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-700">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-5 py-4 text-sm text-gray-900 font-bold text-right">R$ {s.value.toFixed(2)}</td>
                                <td className="px-5 py-4 text-sm text-center">
                                    <button onClick={() => setSelectedService(s)} className="text-eletri-blue-600 hover:text-eletri-blue-900 font-medium">
                                        Detalhes
                                    </button>
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)} title={`Detalhes do Serviço #${selectedService?.id.slice(0,8)}`}>
                {selectedService && <ServiceDetailsModalContent service={selectedService} />}
            </Modal>
        </div>
    )
};

const SettingsPage = () => {

    const handleEmailChange = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const newEmail = formData.get('newEmail');
        const confirmEmail = formData.get('confirmEmail');
        
        if (newEmail !== confirmEmail) {
            alert('Os e-mails não coincidem.');
            return;
        }

        alert(`E-mail de administrador alterado para: ${newEmail}`);
        (e.target as HTMLFormElement).reset();
    };
    
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        // Simple validation for simulation
        if (currentPassword !== 'password') {
             alert('Senha atual incorreta.');
             return;
        }

        if (newPassword !== confirmPassword) {
            alert('As novas senhas não coincidem.');
            return;
        }

        if (!newPassword || newPassword.toString().length < 6) {
            alert('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        alert('Senha alterada com sucesso!');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Configurações da Conta</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Change Email Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Alterar E-mail de Login</h3>
                    <form onSubmit={handleEmailChange} className="space-y-4">
                        <FormRow label="Novo E-mail">
                            <input
                                name="newEmail"
                                type="email"
                                required
                                placeholder="novo.admin@eletrigo.com"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                            />
                        </FormRow>
                        <FormRow label="Confirmar Novo E-mail">
                            <input
                                name="confirmEmail"
                                type="email"
                                required
                                placeholder="Confirme o novo e-mail"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                            />
                        </FormRow>
                        <div>
                            <button
                                type="submit"
                                className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Salvar E-mail
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Change Password Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Alterar Senha</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <FormRow label="Senha Atual">
                            <input
                                name="currentPassword"
                                type="password"
                                required
                                placeholder="************"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                            />
                        </FormRow>
                        <FormRow label="Nova Senha">
                            <input
                                name="newPassword"
                                type="password"
                                required
                                placeholder="************"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                            />
                        </FormRow>
                        <FormRow label="Confirmar Nova Senha">
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="************"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                            />
                        </FormRow>
                        <div>
                             <button
                                type="submit"
                                className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Salvar Senha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// Main Admin Dashboard Layout
type Page = 'dashboard' | 'electricians' | 'products' | 'services' | 'clients' | 'settings';

export const AdminDashboard = ({ 
    onLogout, 
    electricians, setElectricians, 
    products, 
    services, 
    clients, setClients 
}: {
    onLogout: () => void;
    electricians: Electrician[];
    setElectricians: React.Dispatch<React.SetStateAction<Electrician[]>>;
    products: Product[];
    services: Service[];
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}) => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const pendingElectriciansCount = useMemo(() => electricians.filter(e => e.status === ElectricianStatus.Pending).length, [electricians]);
    const requestedServicesCount = useMemo(() => services.filter(s => s.status === ServiceStatus.Requested).length, [services]);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage electricians={electricians} products={products} services={services} clients={clients} />;
            case 'electricians':
                return <ElectriciansPage electricians={electricians} setElectricians={setElectricians} />;
            case 'clients':
                return <ClientsPage clients={clients} setClients={setClients} />;
            case 'products':
                return <ProductsPage initialProducts={products} />;
            case 'services':
                return <ServicesPage services={services} />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <DashboardPage electricians={electricians} products={products} services={services} clients={clients} />;
        }
    };
    
    const NavItem = ({ icon, label, pageName, notificationCount }: { icon: React.ReactNode, label: string, pageName: Page, notificationCount?: number }) => (
        <li>
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentPage(pageName); }}
                className={`flex items-center justify-between p-3 rounded-lg text-lg transition-colors ${currentPage === pageName ? 'bg-eletri-yellow-400 text-eletri-blue-950 font-bold' : 'text-eletri-blue-100 hover:bg-eletri-blue-800'}`}
            >
                <div className="flex items-center">
                    {icon}
                    <span className="ml-3">{label}</span>
                </div>
                 {notificationCount && notificationCount > 0 && (
                    <span className="bg-eletri-yellow-500 text-eletri-blue-950 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {notificationCount}
                    </span>
                )}
            </a>
        </li>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-eletri-blue-900 text-white flex flex-col p-4 fixed h-full">
                <div className="flex items-center mb-8 px-2">
                    <BoltIcon className="w-10 h-10 text-eletri-yellow-400" />
                    <span className="text-2xl font-bold ml-2">Eletri<span className="text-eletri-yellow-400">Go</span></span>
                </div>
                <nav className="flex-1">
                    <ul className="space-y-2">
                        <NavItem icon={<DashboardIcon className="w-6 h-6"/>} label="Dashboard" pageName="dashboard" />
                        <NavItem icon={<UsersIcon className="w-6 h-6"/>} label="Eletricistas" pageName="electricians" notificationCount={pendingElectriciansCount} />
                        <NavItem icon={<UserGroupIcon className="w-6 h-6"/>} label="Clientes" pageName="clients" />
                        <NavItem icon={<ShoppingBagIcon className="w-6 h-6"/>} label="Produtos" pageName="products" />
                        <NavItem icon={<WrenchScrewdriverIcon className="w-6 h-6"/>} label="Serviços" pageName="services" notificationCount={requestedServicesCount} />
                    </ul>
                </nav>
                <div className="mt-auto">
                     <ul className="space-y-2">
                        <NavItem icon={<CogIcon className="w-6 h-6"/>} label="Configurações" pageName="settings" />
                        <li>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onLogout(); }}
                                className={`flex items-center p-3 rounded-lg text-lg text-eletri-blue-100 hover:bg-eletri-blue-800 transition-colors`}
                            >
                                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                <span className="ml-3">Sair</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}