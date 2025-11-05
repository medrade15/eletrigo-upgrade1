import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Client, Service, ServiceStatus, Product, ChatMessage } from '../types';
import { Modal } from './Modal';
import { BoltIcon, ArrowLeftOnRectangleIcon, XCircleIcon, ShoppingBagIcon, WrenchScrewdriverIcon, ChatBubbleLeftEllipsisIcon, MapPinIcon, StarIcon, UserIcon, SpinnerIcon } from './Icons';

// --- Sub-components for ClientDashboard ---

const ChatModal = ({ service, onSendMessage, onClose }: { service: Service, onSendMessage: (message: string) => void, onClose: () => void }) => {
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [service.chat]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Chat com ${service.electricianName}`}>
            <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
                    {service.chat && service.chat.length > 0 ? service.chat.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'client' ? 'bg-eletri-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-eletri-blue-200' : 'text-gray-500'} text-right`}>{msg.timestamp}</p>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-500">Inicie a conversa!</p>}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg flex gap-2">
                    <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                    <button type="submit" className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg">Enviar</button>
                </form>
            </div>
        </Modal>
    );
};

const Rating = ({ currentRating, onRate }: { currentRating: number | undefined, onRate: (rating: number) => void }) => {
    const [hoverRating, setHoverRating] = useState(0);

    if (currentRating) {
        return (
             <div className="flex items-center gap-1">
                <p className="text-xs mr-2 text-gray-600">Sua Avaliação:</p>
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className="w-5 h-5 text-eletri-yellow-500" filled={i < currentRating} />)}
            </div>
        );
    }
    
    return (
         <div>
            <p className="text-xs text-gray-600 mb-1">Avalie o serviço:</p>
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <button
                        key={i}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => onRate(i + 1)}
                    >
                        <StarIcon
                            className={`w-6 h-6 cursor-pointer ${ (hoverRating || 0) > i ? 'text-eletri-yellow-500' : 'text-gray-300'}`}
                            filled={(hoverRating || 0) > i}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

const ServiceTrackingView = ({ service, onCancelService, onSendMessage, getStatusClass }: { service: Service, onCancelService: (id: string) => void, onSendMessage: (serviceId: string, sender: 'client' | 'electrician', message: string) => void, getStatusClass: (status: ServiceStatus) => string }) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentEta, setCurrentEta] = useState(service.eta || 0);

     useEffect(() => {
        if (service.status !== ServiceStatus.Accepted || !service.eta) {
            setProgress(service.status === ServiceStatus.InProgress ? 100 : 0);
            return;
        }

        const initialEtaMinutes = service.eta;
        setCurrentEta(initialEtaMinutes);
        
        const totalDuration = initialEtaMinutes * 60 * 1000;
        const intervalTime = 1000;
        const totalSteps = totalDuration / intervalTime;
        const progressIncrement = 100 / totalSteps;

        const timer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + progressIncrement;
                if (newProgress >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return newProgress;
            });
            setCurrentEta(prev => Math.max(prev - (intervalTime / (60 * 1000)), 0));
        }, intervalTime);

        return () => clearInterval(timer);
    }, [service]);

    const handleConfirmCancel = () => {
        onCancelService(service.id);
        setIsCancelModalOpen(false);
    };

    return (
        <>
            {isChatOpen && <ChatModal service={service} onClose={() => setIsChatOpen(false)} onSendMessage={(msg) => onSendMessage(service.id, 'client', msg)} />}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Acompanhe seu Serviço</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-eletri-blue-900">Eletricista: {service.electricianName}</h3>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {service.address}
                            </div>
                        </div>
                        <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-sm ${getStatusClass(service.status)}`}>{service.status}</span>
                    </div>

                     {service.status === ServiceStatus.Accepted && (
                        <div className="mb-4">
                            <div className="flex justify-between items-end mb-1">
                                <p className="font-bold text-eletri-blue-800">Eletricista a caminho!</p>
                                <p className="text-sm font-medium text-gray-700">Chega em: <strong>{Math.ceil(currentEta)} min</strong></p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-eletri-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s linear' }}></div>
                            </div>
                        </div>
                    )}

                    {service.status === ServiceStatus.InProgress && (
                        <div className="mb-4 text-center p-4 bg-eletri-blue-50 rounded-lg border border-eletri-blue-200">
                            <p className="font-bold text-eletri-blue-800 text-lg">Eletricista no local</p>
                            <p className="text-sm text-gray-700">Seu serviço está em andamento.</p>
                        </div>
                    )}

                    <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center border">
                        <div className="absolute top-1/2 left-4 z-10 text-center">
                            <div className="p-2 bg-eletri-blue-600 rounded-full inline-block"><BoltIcon className="w-6 h-6 text-white"/></div>
                            <p className="text-xs font-bold mt-1">Eletricista</p>
                        </div>
                        <div className="absolute top-1/2 right-4 z-10 text-center">
                             <div className="p-2 bg-green-600 rounded-full inline-block"><UserIcon className="w-6 h-6 text-white"/></div>
                             <p className="text-xs font-bold mt-1">Você</p>
                        </div>
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300"></div>
                        <div className="absolute top-1/2 left-0 h-1 bg-eletri-blue-500" style={{width: `calc(${progress}% + 1rem)`}}></div>
                        <div className="absolute top-1/2 h-8 w-8 -mt-4 -ml-4 bg-white border-4 border-eletri-blue-500 rounded-full z-20" style={{ left: `calc(${progress}% + 1rem)` }}>
                            <BoltIcon className="w-full h-full text-eletri-blue-500 p-1"/>
                        </div>
                    </div>

                </div>
                <div className="mt-6 flex gap-2">
                    {[ServiceStatus.Requested, ServiceStatus.Accepted, ServiceStatus.InProgress].includes(service.status) && (
                         <button onClick={() => setIsChatOpen(true)} className="flex-1 bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-md transition-colors"><ChatBubbleLeftEllipsisIcon className="w-6 h-6"/>Chat</button>
                    )}
                    {[ServiceStatus.Requested, ServiceStatus.Accepted].includes(service.status) && (
                        <button onClick={() => setIsCancelModalOpen(true)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-md transition-colors"><XCircleIcon className="w-6 h-6" />Cancelar</button>
                    )}
                </div>
            </div>
             <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Confirmar Cancelamento">
                <p className="text-lg text-gray-800">Tem certeza que deseja cancelar o serviço com {service.electricianName}?</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsCancelModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Manter Serviço</button>
                    <button onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Sim, Cancelar</button>
                </div>
            </Modal>
        </>
    )
};


const StoreView = ({ products }: { products: Product[] }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nossos Produtos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
                <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-200">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover"/>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-gray-800 truncate">{p.name}</h3>
                        <p className="text-sm text-gray-500">{p.category}</p>
                        <div className="mt-4 flex-grow">
                            <p className="text-xl font-semibold text-eletri-blue-800">R$ {p.price.toFixed(2)}</p>
                        </div>
                        <button className="mt-4 w-full bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white py-2 rounded-md text-sm font-medium transition-colors">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ScheduleServiceModal = ({ client, isOpen, onClose, onRequestService }: { client: Client, isOpen: boolean, onClose: () => void, onRequestService: (service: Omit<Service, 'id' | 'value'>) => void }) => {
    const [serviceDescription, setServiceDescription] = useState('Troca de Tomada');
    const [serviceNotes, setServiceNotes] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleGetLocation = () => {
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
                setLocationStatus('success');
            },
            () => setLocationStatus('error'),
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            alert('Por favor, selecione a data e a hora para o agendamento.');
            return;
        }
        onRequestService({
            clientName: client.name,
            electricianId: '',
            electricianName: 'Aguardando',
            serviceType: 'Agendado',
            address: client.address,
            status: ServiceStatus.Requested,
            date: `${date}T${time}:00`,
            serviceDescription,
            serviceNotes,
            location: location || undefined,
        });
        onClose();
    };

    const serviceTypes = ['Troca de Tomada', 'Instalação de Chuveiro', 'Verificação de Curto-circuito', 'Instalação de Luminária', 'Outro'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Agendar uma Visita Técnica">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Seus Dados</h3>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <p><strong>Nome:</strong> {client.name}</p>
                        <p><strong>Endereço:</strong> {client.address}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Detalhes do Serviço</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qual é o tipo de serviço?</label>
                        <select value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} className="shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400">
                            {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descreva o que você precisa (opcional):</label>
                        <textarea value={serviceNotes} onChange={e => setServiceNotes(e.target.value)} rows={3} placeholder="Ex: A tomada do quarto parou de funcionar." className="shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"></textarea>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Data e Hora</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="shadow-sm border rounded w-full py-2 px-3"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="shadow-sm border rounded w-full py-2 px-3"/>
                        </div>
                    </div>
                </div>
                 <div>
                    <button type="button" onClick={handleGetLocation} disabled={locationStatus === 'loading'} className="w-full text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                        <MapPinIcon className="w-5 h-5"/> Usar Localização Atual (Opcional)
                    </button>
                    {locationStatus === 'loading' && <p className="text-xs text-center text-gray-500 mt-1">Obtendo localização...</p>}
                    {locationStatus === 'success' && <p className="text-xs text-center text-green-600 font-medium mt-1">Localização obtida com sucesso!</p>}
                    {locationStatus === 'error' && <p className="text-xs text-center text-red-600 mt-1">Não foi possível obter a localização. Verifique as permissões.</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="submit" className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg">Confirmar Agendamento</button>
                </div>
            </form>
        </Modal>
    );
};


const ServiceView = ({ client, currentService, serviceHistory, onRequestService, onCancelService, onSendMessage, onRateService, getStatusClass }: { 
    client: Client;
    currentService: Service | undefined;
    serviceHistory: Service[];
    onRequestService: (service: Omit<Service, 'id' | 'value'>) => void;
    onCancelService: (serviceId: string) => void;
    onSendMessage: (serviceId: string, sender: 'client' | 'electrician', message: string) => void;
    onRateService: (serviceId: string, rating: number, ratedBy: 'client' | 'electrician') => void;
    getStatusClass: (status: ServiceStatus) => string;
}) => {
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [cep, setCep] = useState('');
    const [referencePoint, setReferencePoint] = useState('');
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isRequesting, setIsRequesting] = useState(false);

    const handleGetLocation = () => {
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
                setLocationStatus('success');
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationStatus('error');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        setTimeout(() => {
            onRequestService({
                clientName: client.name,
                electricianId: '',
                electricianName: 'Aguardando',
                serviceType: 'Emergencial',
                address: client.address,
                status: ServiceStatus.Requested,
                date: new Date().toISOString(),
                cep,
                referencePoint,
                location: location || undefined,
            });
            setIsRequesting(false);
        }, 1500);
    };
    
    return (
        <>
            <ScheduleServiceModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                client={client}
                onRequestService={onRequestService}
            />
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
                {currentService ? (
                    <ServiceTrackingView service={currentService} onCancelService={onCancelService} onSendMessage={onSendMessage} getStatusClass={getStatusClass} />
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Solicitação de Emergência</h2>
                        <p className="text-gray-600 mb-4">Para problemas urgentes que precisam de atenção imediata.</p>
                        <form onSubmit={handleRequest} className="space-y-4">
                           
                            <div>
                                <label className="font-semibold text-gray-700">Endereço do Atendimento</label>
                                <p className="p-3 bg-gray-100 rounded-lg mt-2 text-gray-800">{client.address}</p>
                            </div>

                             <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-gray-700">Detalhes da Localização (Opcional, ajuda a encontrar mais rápido)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="CEP" className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                                     <input type="text" value={referencePoint} onChange={(e) => setReferencePoint(e.target.value)} placeholder="Ponto de Referência (ex: Prédio azul)" className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700"/>
                                </div>
                                <button type="button" onClick={handleGetLocation} disabled={locationStatus === 'loading'} className="w-full text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                    <MapPinIcon className="w-5 h-5"/> Usar Localização Atual
                                </button>
                                {locationStatus === 'loading' && <p className="text-xs text-center text-gray-500">Obtendo localização...</p>}
                                {locationStatus === 'success' && <p className="text-xs text-center text-green-600 font-medium">Localização obtida com sucesso!</p>}
                                {locationStatus === 'error' && <p className="text-xs text-center text-red-600">Não foi possível obter a localização. Verifique as permissões.</p>}
                            </div>

                            <button type="submit" disabled={isRequesting} className="w-full bg-eletri-yellow-400 hover:bg-eletri-yellow-500 text-eletri-blue-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-lg transition-transform hover:scale-105 disabled:opacity-75 disabled:cursor-wait">
                                {isRequesting ? (
                                    <>
                                        <SpinnerIcon className="w-6 h-6 text-eletri-blue-950" />
                                        Buscando Eletricista...
                                    </>
                                ) : (
                                    'Chamar Eletricista Agora'
                                )}
                            </button>
                             <div className="text-center mt-4">
                                <button type="button" onClick={() => setIsScheduleModalOpen(true)} className="text-eletri-blue-600 hover:underline font-medium">
                                    Prefere agendar uma visita?
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
             <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Serviços</h2>
                <div className="space-y-3">
                    {serviceHistory.length > 0 ? serviceHistory.map(service => (
                        <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-800">Eletricista: {service.electricianName}</p>
                                    <p className="text-sm text-gray-500">{new Date(service.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-0.5 text-xs font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>{service.status}</span>
                                    <p className="font-bold text-gray-800 mt-1">R$ {service.value.toFixed(2)}</p>
                                </div>
                            </div>
                            {service.status === ServiceStatus.Completed && (
                                <div className="mt-3 pt-3 border-t">
                                    <Rating currentRating={service.clientRating} onRate={(rating) => onRateService(service.id, rating, 'client')} />
                                </div>
                            )}
                        </div>
                    )) : <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm text-center">Você ainda não possui serviços no histórico.</p>}
                </div>
            </div>
        </>
    );
};

const ProfileView = ({ client, onUpdateProfile }: { client: Client; onUpdateProfile: (clientId: string, data: Omit<Client, 'id' | 'joinDate'>) => void; }) => {
    const [formData, setFormData] = useState({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            onUpdateProfile(client.id, formData);
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h2>
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required className="shadow-sm border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400" />
                    </div>
                    <div className="pt-4 border-t">
                        <button type="submit" disabled={isSaving} className="w-full bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-md transition-colors disabled:opacity-50">
                             {isSaving ? <SpinnerIcon className="w-6 h-6" /> : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const ClientDashboard = ({ client, onLogout, allServices, products, onRequestService, onCancelService, onSendMessage, onRateService, onUpdateProfile }: { 
    client: Client, 
    onLogout: () => void, 
    allServices: Service[], 
    products: Product[], 
    onRequestService: (service: Omit<Service, 'id' | 'value'>) => void, 
    onCancelService: (serviceId: string) => void, 
    onSendMessage: (serviceId: string, sender: 'client' | 'electrician', message: string) => void, 
    onRateService: (serviceId: string, rating: number, ratedBy: 'client' | 'electrician') => void,
    onUpdateProfile: (clientId: string, data: Omit<Client, 'id' | 'joinDate'>) => void;
}) => {
    
    const [clientView, setClientView] = useState<'service' | 'store' | 'profile'>('service');
    
    const currentService = useMemo(() => allServices.find(s => s.clientName === client.name && [ServiceStatus.Requested, ServiceStatus.Accepted, ServiceStatus.InProgress].includes(s.status)), [allServices, client.name]);
    const serviceHistory = useMemo(() => allServices.filter(s => s.clientName === client.name && [ServiceStatus.Completed, ServiceStatus.Cancelled].includes(s.status)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [allServices, client.name]);

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

    const TabButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${isActive ? 'bg-eletri-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
            {icon}
            {label}
        </button>
    );

    return (
         <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                 <div className="flex items-center">
                    <BoltIcon className="w-8 h-8 text-eletri-yellow-400" />
                    <span className="text-xl font-bold ml-2">Eletri<span className="text-eletri-yellow-400">Go</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700 hidden sm:inline">Olá, {client.name.split(' ')[0]}</span>
                     <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-eletri-blue-700">
                        <ArrowLeftOnRectangleIcon className="w-6 h-6"/>
                        <span className="hidden md:inline">Sair</span>
                    </button>
                </div>
            </header>
            <main className="p-4 md:p-8 max-w-6xl mx-auto">
                 <div className="mb-8">
                    <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                        <TabButton 
                            isActive={clientView === 'service'} 
                            onClick={() => setClientView('service')}
                            icon={<WrenchScrewdriverIcon className="w-5 h-5"/>}
                            label="Serviços"
                        />
                         <TabButton 
                            isActive={clientView === 'store'} 
                            onClick={() => setClientView('store')}
                            icon={<ShoppingBagIcon className="w-5 h-5" />}
                            label="Loja"
                        />
                         <TabButton 
                            isActive={clientView === 'profile'} 
                            onClick={() => setClientView('profile')}
                            icon={<UserIcon className="w-5 h-5" />}
                            label="Meu Perfil"
                        />
                    </div>
                </div>

                {clientView === 'service' ? (
                    <ServiceView 
                        client={client}
                        currentService={currentService}
                        serviceHistory={serviceHistory}
                        onRequestService={onRequestService}
                        onCancelService={onCancelService}
                        onSendMessage={onSendMessage}
                        onRateService={onRateService}
                        getStatusClass={getStatusClass}
                    />
                ) : clientView === 'store' ? (
                    <StoreView products={products} />
                ) : (
                     <ProfileView client={client} onUpdateProfile={onUpdateProfile} />
                )}

            </main>
        </div>
    );
};