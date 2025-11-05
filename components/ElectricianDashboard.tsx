import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Electrician, Service, ServiceStatus, ElectricianStatus, ChatMessage } from '../types';
import { Modal } from './Modal';
import { BoltIcon, ClockIcon, ArrowLeftOnRectangleIcon, ArrowRightIcon, MapPinIcon, ChatBubbleLeftEllipsisIcon, StarIcon, SpinnerIcon } from './Icons';

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
        <Modal isOpen={true} onClose={onClose} title={`Chat com ${service.clientName}`}>
            <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
                    {service.chat && service.chat.length > 0 ? service.chat.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'electrician' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'electrician' ? 'bg-eletri-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.sender === 'electrician' ? 'text-eletri-blue-200' : 'text-gray-500'} text-right`}>{msg.timestamp}</p>
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
                {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className="w-5 h-5 text-eletri-yellow-500" filled={i < currentRating} />)}
                 <span className="text-sm font-bold ml-1">({currentRating})</span>
            </div>
        );
    }
    
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <button
                    key={i}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onRate(i + 1)}
                >
                    <StarIcon
                        className={`w-5 h-5 cursor-pointer ${ (hoverRating || 0) > i ? 'text-eletri-yellow-500' : 'text-gray-300'}`}
                        filled={(hoverRating || 0) > i}
                    />
                </button>
            ))}
        </div>
    );
};

export const ElectricianDashboard = ({ electrician, onLogout, allServices, onUpdateService, onAcceptService, onSendMessage, onRateService }: { electrician: Electrician, onLogout: () => void, allServices: Service[], onUpdateService: (id: string, status: ServiceStatus) => void, onAcceptService: (serviceId: string, electricianId: string, electricianName: string, eta: number) => void, onSendMessage: (serviceId: string, sender: 'client' | 'electrician', message: string) => void, onRateService: (serviceId: string, rating: number, ratedBy: 'client' | 'electrician') => void }) => {

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [loadingServiceId, setLoadingServiceId] = useState<string | null>(null);
    const currentService = useMemo(() => allServices.find(s => s.electricianId === electrician.id && [ServiceStatus.Accepted, ServiceStatus.InProgress].includes(s.status)), [allServices, electrician.id]);
    const serviceHistory = useMemo(() => allServices.filter(s => s.electricianId === electrician.id && [ServiceStatus.Completed, ServiceStatus.Cancelled].includes(s.status)), [allServices, electrician.id]);
    const availableServices = useMemo(() => allServices.filter(s => s.status === ServiceStatus.Requested), [allServices]);

    const handleAcceptClick = (service: Service) => {
        const etaInput = prompt("Digite o tempo estimado de chegada em minutos:");
        if (etaInput) {
            const eta = parseInt(etaInput, 10);
            if (!isNaN(eta) && eta > 0) {
                setLoadingServiceId(service.id);
                setTimeout(() => {
                    onAcceptService(service.id, electrician.id, electrician.name, eta);
                    setLoadingServiceId(null);
                }, 1000);
            } else {
                alert("Por favor, insira um número válido de minutos.");
            }
        }
    };

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
    
    if (electrician.status === ElectricianStatus.Pending || electrician.status === ElectricianStatus.Suspended) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 text-center">
                 <div className="bg-white p-10 rounded-lg shadow-lg max-w-lg">
                    {electrician.status === ElectricianStatus.Pending ? (
                        <>
                            <ClockIcon className="w-20 h-20 text-eletri-yellow-500 mx-auto" />
                            <h2 className="text-3xl font-bold text-gray-800 mt-6">Cadastro em Análise</h2>
                            <p className="text-gray-600 mt-4">
                                Seu perfil está sendo analisado por nossa equipe. Você será notificado por e-mail assim que seu cadastro for aprovado e você puder começar a aceitar serviços.
                            </p>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-red-500 mx-auto">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                            </svg>
                            <h2 className="text-3xl font-bold text-gray-800 mt-6">Conta Suspensa</h2>
                            <p className="text-gray-600 mt-4">
                                Sua conta foi suspensa. Por favor, entre em contato com o suporte para mais informações.
                            </p>
                        </>
                    )}
                    <button onClick={onLogout} className="mt-8 bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-6 rounded-lg">
                        Sair
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
             {isChatOpen && currentService && <ChatModal service={currentService} onClose={() => setIsChatOpen(false)} onSendMessage={(msg) => onSendMessage(currentService.id, 'electrician', msg)} />}
            <header className="bg-white shadow-md p-4 flex justify-between items-center">
                 <div className="flex items-center">
                    <BoltIcon className="w-8 h-8 text-eletri-yellow-400" />
                    <span className="text-xl font-bold ml-2">Eletri<span className="text-eletri-yellow-400">Go</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="font-medium text-gray-700">Olá, {electrician.name.split(' ')[0]}</span>
                        <div className="flex items-center justify-end">
                            <StarIcon className="w-4 h-4 text-eletri-yellow-500" filled/>
                            <span className="text-xs text-gray-600 ml-1 font-bold">{electrician.rating > 0 ? electrician.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                    </div>
                     <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-eletri-blue-700">
                        <ArrowLeftOnRectangleIcon className="w-6 h-6"/>
                        <span className="hidden md:inline">Sair</span>
                    </button>
                </div>
            </header>
            <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Current Service or Available Services */}
                <div className="lg:col-span-2 space-y-8">
                     {currentService ? (
                         <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Serviço Atual</h2>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-eletri-blue-800">{currentService.clientName}</h3>
                                        <p className="text-gray-600">{currentService.address}</p>
                                        {currentService.eta && <p className="text-sm text-gray-600 mt-1">ETA: <strong>{currentService.eta} minutos</strong></p>}
                                    </div>
                                    <span className={`px-3 py-1 font-semibold leading-tight rounded-full text-sm ${getStatusClass(currentService.status)}`}>
                                        {currentService.status}
                                    </span>
                                </div>
                                
                                <div className="mt-4 border rounded-lg h-64 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                                     <MapPinIcon className="w-8 h-8 text-red-500 z-10" />
                                     <p className="z-10 font-bold text-gray-600">Simulação de Mapa</p>
                                     <div className="absolute top-0 left-0 w-full h-full bg-repeat bg-center opacity-30" style={{backgroundImage: `url('https://www.openstreetmap.org/export/embed.html?bbox=-46.633,-23.55,-46.632,-23.549&layer=mapnik')`}}/>
                                </div>

                                <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-700">
                                    {currentService.cep && <p><strong>CEP:</strong> {currentService.cep}</p>}
                                    {currentService.referencePoint && <p><strong>Ponto de Referência:</strong> {currentService.referencePoint}</p>}
                                    {currentService.location && (
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${currentService.location.lat},${currentService.location.lon}`} target="_blank" rel="noopener noreferrer" className="font-bold text-eletri-blue-600 hover:underline">Ver no Mapa</a>
                                    )}
                                </div>
                                <div className="mt-6 border-t pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <p className="text-lg font-bold">Valor: <span className="text-green-600">R$ {currentService.value.toFixed(2)}</span></p>
                                    <div className="flex gap-2">
                                         <button onClick={() => setIsChatOpen(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><ChatBubbleLeftEllipsisIcon className="w-5 h-5"/> Chat</button>
                                         {currentService.status === ServiceStatus.Accepted && (
                                            <button onClick={() => onUpdateService(currentService.id, ServiceStatus.InProgress)} className="bg-eletri-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cheguei ao Local</button>
                                         )}
                                          {currentService.status === ServiceStatus.InProgress && (
                                            <button onClick={() => onUpdateService(currentService.id, ServiceStatus.Completed)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Concluir Serviço</button>
                                         )}
                                    </div>
                                </div>
                            </div>
                         </div>
                     ) : (
                         <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Novos Chamados</h2>
                             <div className="space-y-4">
                                {availableServices.length > 0 ? availableServices.map(service => (
                                    <div key={service.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <p className="font-bold text-gray-800">{service.clientName}</p>
                                            <p className="text-sm text-gray-600">{service.address}</p>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {service.cep && <span>CEP: {service.cep} | </span>}
                                                {service.referencePoint && <span>Ref: {service.referencePoint}</span>}
                                            </div>
                                             {service.location && (
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${service.location.lat},${service.location.lon}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-eletri-blue-600 hover:underline">Ver no Mapa</a>
                                            )}
                                        </div>
                                         <div className="flex items-center gap-4">
                                            <p className="text-lg font-bold text-green-600">R$ {service.value.toFixed(2)}</p>
                                            <button onClick={() => handleAcceptClick(service)} disabled={!!loadingServiceId} className="bg-eletri-yellow-400 hover:bg-eletri-yellow-500 text-eletri-blue-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 w-32 disabled:opacity-50 disabled:cursor-wait">
                                                {loadingServiceId === service.id ? (
                                                    <SpinnerIcon className="w-5 h-5 text-eletri-blue-950"/>
                                                ) : (
                                                    <>Aceitar <ArrowRightIcon /></>
                                                )}
                                            </button>
                                         </div>
                                    </div>
                                )) : <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">Nenhum novo chamado no momento.</p>}
                             </div>
                         </div>
                     )}
                </div>

                {/* Service History */}
                 <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Serviços</h2>
                     <div className="bg-white p-4 rounded-lg shadow-md max-h-[60vh] overflow-y-auto">
                        {serviceHistory.length > 0 ? serviceHistory.map(service => (
                            <div key={service.id} className="border-b last:border-b-0 py-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-800">{service.clientName}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">{service.date}</p>
                                            <span className={`px-2 py-0.5 text-xs font-semibold leading-tight rounded-full ${getStatusClass(service.status)}`}>{service.status}</span>
                                        </div>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 ml-2">R$ {service.value.toFixed(2)}</p>
                                </div>
                                {service.status === ServiceStatus.Completed && (
                                    <div className="mt-2 pt-2 border-t">
                                         <p className="text-xs text-gray-600 mb-1">Avalie o cliente:</p>
                                         <Rating currentRating={service.electricianRating} onRate={(rating) => onRateService(service.id, rating, 'electrician')} />
                                    </div>
                                )}
                            </div>
                        )) : <p className="text-gray-500 text-sm">Nenhum serviço no histórico.</p>}
                     </div>
                 </div>
            </main>
        </div>
    );
};