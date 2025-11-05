import React, { useState, useCallback } from 'react';
import { Electrician, Product, Service, ElectricianStatus, ServiceStatus, Client, ChatMessage } from './types';
import { MOCK_ELECTRICIANS, MOCK_PRODUCTS, MOCK_SERVICES, MOCK_CLIENTS } from './constants';
import { BoltIcon, UserIcon, UsersIcon, BriefcaseIcon, ArrowLeftIcon } from './components/Icons';
import { AdminDashboard } from './components/AdminDashboard';
import { ElectricianDashboard } from './components/ElectricianDashboard';
import { ClientDashboard } from './components/ClientDashboard';

type UserRole = 'admin' | 'electrician' | 'client';
type View = 'portal' | 'admin_login' | 'electrician_portal' | 'client_portal' | 'admin_dashboard' | 'electrician_dashboard' | 'client_dashboard';


// --- Page Components ---
const PortalPage = ({ onSelectRole }: { onSelectRole: (role: UserRole) => void }) => {
    const RoleCard = ({ role, title, icon }: { role: UserRole, title: string, icon: React.ReactNode }) => (
        <button
            onClick={() => onSelectRole(role)}
            className="bg-white p-8 rounded-lg shadow-2xl w-full text-center transition-transform hover:scale-105 hover:shadow-eletri-yellow-400/50"
        >
            <div className="bg-eletri-blue-100 p-4 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-6">Sou {title}</h2>
        </button>
    );

    return (
        <div className="min-h-screen bg-eletri-blue-950 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-12">
                <BoltIcon className="w-20 h-20 text-eletri-yellow-400 mx-auto" />
                <h1 className="text-5xl font-bold text-white mt-4">Eletri<span className="text-eletri-yellow-400">Go</span></h1>
                <p className="text-eletri-blue-200 mt-2 text-lg">Conectando eletricistas e clientes.</p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                <RoleCard role="client" title="Cliente" icon={<UserIcon className="w-16 h-16 text-eletri-blue-700" />} />
                <RoleCard role="electrician" title="Eletricista" icon={<BriefcaseIcon className="w-16 h-16 text-eletri-blue-700" />} />
                <RoleCard role="admin" title="Administrador" icon={<UsersIcon className="w-16 h-16 text-eletri-blue-700" />} />
            </div>
        </div>
    );
};

const AdminLoginPage = ({ onLogin, onBack }: { onLogin: () => void; onBack: () => void; }) => {
    const handleAdminLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (email === 'admin@eletrigo.com' && password === 'password') {
            onLogin();
        } else {
            alert('Credenciais de administrador inválidas.');
        }
    };

    return (
        <div className="min-h-screen bg-eletri-blue-950 flex flex-col justify-center items-center p-4 relative">
             <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-eletri-blue-200 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Voltar ao Início</span>
            </button>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <BoltIcon className="w-16 h-16 text-eletri-yellow-400 mx-auto" />
                    <h1 className="text-4xl font-bold text-white mt-4">Eletri<span className="text-eletri-yellow-400">Go</span></h1>
                    <p className="text-eletri-blue-200 mt-2">Painel Administrativo</p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login do Administrador</h2>
                    <form onSubmit={handleAdminLoginSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Seu e-mail"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Senha
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-eletri-yellow-400"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Sua senha"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                className="bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-300 flex items-center justify-center gap-2"
                                type="submit"
                            >
                                <BoltIcon className="w-5 h-5"/>
                                Entrar
                            </button>
                        </div>
                    </form>
                     <p className="text-xs text-gray-500 mt-6 text-center border-t pt-4">
                        Para fins de demonstração:<br/>
                        <strong>Email:</strong> admin@eletrigo.com<br/>
                        <strong>Senha:</strong> password
                    </p>
                </div>
            </div>
        </div>
    );
};

const ElectricianPortal = ({ onLogin, onRegister, electricians, onBack }: { onLogin: (e: Electrician) => void; onRegister: (e: Electrician) => void; electricians: Electrician[]; onBack: () => void; }) => {
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        
        const user = electricians.find(el => el.email === email);
        if (user) {
            onLogin(user);
        } else {
            alert("E-mail não cadastrado. Por favor, verifique o e-mail ou realize o cadastro.");
        }
    };
    
    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newElectrician: Electrician = {
            id: `elec_${Date.now()}`,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            cpf: formData.get('cpf') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            experience: formData.get('experience') as string,
            profilePictureUrl: `https://picsum.photos/seed/${Date.now()}/200`,
            documentUrl: 'https://example.com/doc.pdf',
            status: ElectricianStatus.Pending,
            rating: 0,
            joinDate: new Date().toISOString().split('T')[0],
        };
        onRegister(newElectrician);
        alert('Cadastro realizado com sucesso! Aguarde a aprovação do administrador para fazer login.');
        setIsRegistering(false);
    };

    return (
        <div className="min-h-screen bg-eletri-blue-950 flex flex-col justify-center items-center p-4 relative">
             <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-eletri-blue-200 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Voltar ao Início</span>
            </button>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <BriefcaseIcon className="w-16 h-16 text-eletri-yellow-400 mx-auto" />
                    <h1 className="text-4xl font-bold text-white mt-4">Portal do Eletricista</h1>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isRegistering ? 'Cadastro' : 'Login'}</h2>
                    {isRegistering ? (
                        <form onSubmit={handleRegister} className="space-y-3">
                            {/* Registration Form Fields */}
                            <input name="name" required placeholder="Nome Completo" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="cpf" required placeholder="CPF" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="phone" required placeholder="Telefone" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="email" type="email" required placeholder="Email" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="password" type="password" required placeholder="Senha" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="address" required placeholder="Endereço" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <textarea name="experience" required placeholder="Descrição da experiência e área de atuação" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <button type="submit" className="w-full bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Login Form Fields */}
                            <input name="email" type="email" required placeholder="Email" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="password" type="password" required placeholder="Senha" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <button type="submit" className="w-full bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg">Entrar</button>
                        </form>
                    )}
                    <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-sm text-eletri-blue-600 hover:underline mt-4">
                        {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClientPortal = ({ onLogin, onRegister, clients, onBack }: { onLogin: (c: Client) => void; onRegister: (c: Client) => void; clients: Client[]; onBack: () => void; }) => {
    const [isRegistering, setIsRegistering] = useState(false);

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        const user = clients.find(c => c.email === email);
        if (user) {
            onLogin(user);
        } else {
            alert("E-mail não cadastrado. Por favor, verifique o e-mail ou realize o cadastro.");
        }
    };
    
    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newClient: Client = {
            id: `client_${Date.now()}`,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            joinDate: new Date().toISOString().split('T')[0],
        };
        onRegister(newClient);
    };

    return (
        <div className="min-h-screen bg-eletri-blue-950 flex flex-col justify-center items-center p-4 relative">
            <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-eletri-blue-200 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Voltar ao Início</span>
            </button>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <UserIcon className="w-16 h-16 text-eletri-yellow-400 mx-auto" />
                    <h1 className="text-4xl font-bold text-white mt-4">Portal do Cliente</h1>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isRegistering ? 'Cadastro' : 'Login'}</h2>
                    {isRegistering ? (
                        <form onSubmit={handleRegister} className="space-y-3">
                            <input name="name" required placeholder="Nome Completo" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="email" type="email" required placeholder="Email" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="phone" required placeholder="Telefone" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="address" required placeholder="Endereço" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="password" type="password" required placeholder="Senha" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <button type="submit" className="w-full bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input name="email" type="email" required placeholder="Email" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <input name="password" type="password" required placeholder="Senha" className="shadow appearance-none border rounded w-full py-2 px-3" />
                            <button type="submit" className="w-full bg-eletri-blue-700 hover:bg-eletri-blue-800 text-white font-bold py-2 px-4 rounded-lg">Entrar</button>
                        </form>
                    )}
                    <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-sm text-eletri-blue-600 hover:underline mt-4">
                        {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Logic ---
const App: React.FC = () => {
    const [view, setView] = useState<View>('portal');
    const [currentElectrician, setCurrentElectrician] = useState<Electrician | null>(null);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);

    const [electricians, setElectricians] = useState<Electrician[]>(MOCK_ELECTRICIANS);
    const [products] = useState<Product[]>(MOCK_PRODUCTS);
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);

    const [notifications, setNotifications] = useState<{id: number, message: string}[]>([]);

    const addNotification = useCallback((message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev.filter(n => n.id !== id), { id, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const handleSelectRole = useCallback((role: UserRole) => {
        if (role === 'admin') setView('admin_login');
        if (role === 'electrician') setView('electrician_portal');
        if (role === 'client') setView('client_portal');
    }, []);

    const handleAdminLogin = useCallback(() => {
        setView('admin_dashboard');
    }, []);
    
    const handleElectricianLogin = useCallback((electrician: Electrician) => {
        const upToDateElectrician = electricians.find(e => e.id === electrician.id) || electrician;
        setCurrentElectrician(upToDateElectrician);
        setView('electrician_dashboard');
    }, [electricians]);

    const handleElectricianRegister = useCallback((newElectrician: Electrician) => {
        setElectricians(prev => [...prev, newElectrician]);
        // Do not log in automatically, wait for admin approval
    }, []);
    
    const handleClientLogin = useCallback((client: Client) => {
        setCurrentClient(client);
        setView('client_dashboard');
    }, []);

    const handleClientRegister = useCallback((newClient: Client) => {
        setClients(prev => [...prev, newClient]);
        setCurrentClient(newClient);
        setView('client_dashboard');
    }, []);

    const handleLogout = useCallback(() => {
        setCurrentElectrician(null);
        setCurrentClient(null);
        setView('portal');
    }, []);

    const handleGoToPortal = useCallback(() => {
        setView('portal');
    }, []);

    const handleUpdateService = useCallback((id: string, status: ServiceStatus) => {
        setServices(prev => {
            const newServices = prev.map(s => s.id === id ? { ...s, status } : s);
            const updatedService = newServices.find(s => s.id === id);
    
            if (updatedService) {
                if (status === ServiceStatus.InProgress) {
                    addNotification(`O eletricista chegou ao local e iniciou o atendimento.`);
                } else if (status === ServiceStatus.Completed) {
                    addNotification(`Serviço com ${updatedService.electricianName} concluído. Por favor, avalie o serviço.`);
                }
            }
            return newServices;
        });
    }, [addNotification]);

    const handleAcceptService = useCallback((serviceId: string, electricianId: string, electricianName: string, eta: number) => {
        setServices(prev => prev.map(s => s.id === serviceId ? {
            ...s, 
            status: ServiceStatus.Accepted,
            electricianId,
            electricianName,
            eta,
        } : s))
        addNotification(`Seu serviço foi aceito! ${electricianName} está a caminho.`);
    }, [addNotification]);
    
    const handleRequestService = useCallback((serviceData: Omit<Service, 'id' | 'value'>) => {
        const newService: Service = {
            ...serviceData,
            id: `serv_${Date.now()}`,
            // Simulate a price based on type
            value: serviceData.serviceType === 'Emergencial' ? Math.floor(Math.random() * 100) + 150 : Math.floor(Math.random() * 150) + 200,
        };
        setServices(prev => [newService, ...prev]);
        
        if (serviceData.serviceType === 'Emergencial') {
             addNotification('Sua solicitação foi enviada aos eletricistas próximos!');
        } else {
            addNotification('Seu agendamento foi solicitado com sucesso!');
        }
    }, [addNotification]);

    const handleCancelService = useCallback((serviceId: string) => {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: ServiceStatus.Cancelled } : s));
    }, []);

    const handleSendMessage = useCallback((serviceId: string, sender: 'client' | 'electrician', message: string) => {
        setServices(prev => prev.map(s => {
            if (s.id === serviceId) {
                const newMessage: ChatMessage = {
                    sender,
                    message,
                    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                };
                const chat = s.chat ? [...s.chat, newMessage] : [newMessage];
                
                if (sender === 'client') {
                    const client = clients.find(c => c.name === s.clientName);
                    addNotification(`Nova mensagem de ${client?.name.split(' ')[0] || 'Cliente'}`);
                } else {
                     addNotification(`Nova mensagem de ${s.electricianName}`);
                }
                
                return { ...s, chat };
            }
            return s;
        }));
    }, [addNotification, clients]);

    const handleRateService = useCallback((serviceId: string, rating: number, ratedBy: 'client' | 'electrician') => {
        let ratedService: Service | undefined;
        const newServices = services.map(s => {
            if (s.id === serviceId) {
                ratedService = { ...s };
                if (ratedBy === 'client') {
                    ratedService.clientRating = rating;
                } else {
                    ratedService.electricianRating = rating;
                }
                return ratedService;
            }
            return s;
        });
        setServices(newServices);
    
        if (ratedBy === 'client' && ratedService) {
            const electricianId = ratedService.electricianId;
            const electricianServices = newServices.filter(
                s => s.electricianId === electricianId && s.status === ServiceStatus.Completed && s.clientRating
            );
            
            const totalRating = electricianServices.reduce((acc, s) => acc + (s.clientRating || 0), 0);
            const newAverage = totalRating / electricianServices.length;

            setElectricians(prev => prev.map(e => e.id === electricianId ? { ...e, rating: parseFloat(newAverage.toFixed(1)) } : e));
        }

        addNotification('Obrigado pela sua avaliação!');
    }, [addNotification, services]);

    const handleUpdateClientProfile = useCallback((clientId: string, profileData: Omit<Client, 'id' | 'joinDate'>) => {
        let updatedClient: Client | null = null;
        const newClients = clients.map(c => {
            if (c.id === clientId) {
                updatedClient = { ...c, ...profileData };
                return updatedClient;
            }
            return c;
        });
        setClients(newClients);
        
        if (updatedClient) {
            setCurrentClient(updatedClient);
        }
        addNotification('Seu perfil foi atualizado com sucesso!');
    }, [addNotification, clients]);

    const renderCurrentView = () => {
        switch (view) {
            case 'portal':
                return <PortalPage onSelectRole={handleSelectRole} />;
            case 'admin_login':
                return <AdminLoginPage onLogin={handleAdminLogin} onBack={handleGoToPortal} />;
            case 'electrician_portal':
                return <ElectricianPortal onLogin={handleElectricianLogin} onRegister={handleElectricianRegister} electricians={electricians} onBack={handleGoToPortal} />;
            case 'client_portal':
                return <ClientPortal onLogin={handleClientLogin} onRegister={handleClientRegister} clients={clients} onBack={handleGoToPortal} />;
            case 'admin_dashboard':
                return <AdminDashboard onLogout={handleLogout} electricians={electricians} setElectricians={setElectricians} products={products} services={services} clients={clients} setClients={setClients} />;
            case 'electrician_dashboard':
                return currentElectrician ? 
                    <ElectricianDashboard 
                        electrician={currentElectrician} 
                        onLogout={handleLogout} 
                        allServices={services}
                        onUpdateService={handleUpdateService}
                        onAcceptService={handleAcceptService}
                        onSendMessage={handleSendMessage}
                        onRateService={handleRateService}
                    /> : <PortalPage onSelectRole={handleSelectRole} />;
            case 'client_dashboard':
                 return currentClient ? 
                    <ClientDashboard
                        client={currentClient} 
                        onLogout={handleLogout} 
                        allServices={services}
                        products={products}
                        onRequestService={handleRequestService}
                        onCancelService={handleCancelService}
                        onSendMessage={handleSendMessage}
                        onRateService={handleRateService}
                        onUpdateProfile={handleUpdateClientProfile}
                    /> : <PortalPage onSelectRole={handleSelectRole} />;
            default:
                return <PortalPage onSelectRole={handleSelectRole} />;
        }
    }

    return (
        <>
            {renderCurrentView()}
            <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
                {notifications.map(n => (
                    <div key={n.id} className="bg-eletri-blue-900 text-white rounded-lg shadow-2xl p-4 animate-fade-in-right text-center font-medium">
                        {n.message}
                    </div>
                ))}
            </div>
        </>
    );
};

export default App;