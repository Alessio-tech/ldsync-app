import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

// =================================================================================
// CONFIGURAÇÃO REAL DO FIREBASE
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCPutE28D2o4BXbQcbktpcl3ldRVwam1FA",
  authDomain: "ldsync-app.firebaseapp.com",
  projectId: "ldsync-app",
  storageBucket: "ldsync-app.appspot.com",
  messagingSenderId: "353371062237",
  appId: "1:353371062237:web:1c04b7c814591758000034"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =================================================================================
// COMPONENTES DAS TELAS
// =================================================================================

const LoginScreen = ({ handleCreateAccount, handleLogin, error }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginView, setIsLoginView] = useState(true);

    const handleSubmit = () => {
        if (isLoginView) {
            handleLogin({ email, password });
        } else {
            handleCreateAccount({ name, email, password });
        }
    };

    return (
        <div className="flex flex-col h-full text-center p-4">
            <div className="my-auto">
                <h1 className="text-5xl">🚀</h1>
                <h2 className="text-3xl font-extrabold mt-4">{isLoginView ? "Bem-vindo de Volta!" : "Crie sua Conta"}</h2>
                <p className="text-center text-base text-gray-500 mt-2 mb-10">
                    {isLoginView ? "Continue sua jornada de presença." : "Comece sua jornada de presença e realização."}
                </p>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                <div className="space-y-4 text-left">
                    {!isLoginView && (
                        <div>
                            <label className="font-bold text-sm">Seu Nome</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como gostaria de ser chamado?" className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white shadow-sm" />
                        </div>
                    )}
                    <div>
                        <label className="font-bold text-sm">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white shadow-sm" />
                    </div>
                    <div>
                        <label className="font-bold text-sm">Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="************" className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white shadow-sm" />
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                 <div onClick={handleSubmit} className="p-4 bg-blue-600 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                     {isLoginView ? "Entrar" : "Criar Conta"}
                 </div>
                 <p onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-gray-600 cursor-pointer hover:text-blue-600">
                     {isLoginView ? "Não tem conta? Crie uma" : "Já tem conta? Entre"}
                 </p>
            </div>
        </div>
    );
};

const SelectTribeScreen = ({ onSelectTribe, userData }) => {
    const tribes = [
        { name: 'O Perfeccionista', icon: '⚖️' }, { name: 'O Prestativo', icon: '❤️' },
        { name: 'O Realizador', icon: '🏆' }, { name: 'O Individualista', icon: '🎨' },
        { name: 'O Observador', icon: '🧠' }, { name: 'O Questionador', icon: '🛡️' },
        { name: 'O Entusiasta', icon: '🎉' }, { name: 'O Desafiador', icon: '🦁' },
        { name: 'O Pacifista', icon: '🕊️' },
    ];
    const [selected, setSelected] = useState(null);

    return (
        <div className="flex flex-col h-full text-gray-800">
            <h2 className="text-2xl font-extrabold text-center">Escolha sua Tribo, {userData?.name}!</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Com qual arquétipo você mais se identifica hoje?</p>
            <div className="grid grid-cols-3 gap-4 flex-grow">
                {tribes.map(tribe => (
                    <div key={tribe.name} onClick={() => setSelected(tribe)} 
                         className={`border-2 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer shadow-sm transition-all aspect-square ${selected?.name === tribe.name ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-200 shadow-lg' : 'border-gray-200 bg-white hover:shadow-md'}`}>
                        <div className="text-4xl">{tribe.icon}</div>
                        <div className="font-bold text-xs mt-2 text-center">{tribe.name}</div>
                    </div>
                ))}
            </div>
            <div onClick={() => selected && onSelectTribe(selected)} 
                 className={`mt-4 p-4 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg transition-colors ${selected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                Confirmar Tribo
            </div>
        </div>
    );
};

const BussolaScreen = ({ user, onSave, onStartMorningRitual, onStartEveningRitual }) => {
    const bussola = user?.bussola;
    const dailyPriorities = user?.daily?.priorities;
    const dailyReview = user?.daily?.review;

    const [sonho, setSonho] = useState(bussola?.sonho || '');
    const [objetivo, setObjetivo] = useState(bussola?.objetivoTrimestral || '');
    const [highlights, setHighlights] = useState(bussola?.weeklyHighlights || []);
    const [currentHighlight, setCurrentHighlight] = useState('');
    const [isEditing, setIsEditing] = useState(!bussola);

    useEffect(() => {
        if(bussola) {
            setSonho(bussola.sonho || '');
            setObjetivo(bussola.objetivoTrimestral || '');
            setHighlights(bussola.weeklyHighlights || []);
        }
    }, [bussola]);

    const handleAddHighlight = () => {
        if (currentHighlight.trim() !== '') {
            setHighlights([...highlights, currentHighlight.trim()]);
            setCurrentHighlight('');
        }
    };

    const handleSave = () => {
        onSave({ sonho, objetivoTrimestral: objetivo, weeklyHighlights: highlights });
        setIsEditing(false);
    };

    const TimeIndicators = () => {
        const today = new Date();
        const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const dayName = days[today.getDay()];
        const dayOfWeek = today.getDay(); 
        const daysLeft = dayOfWeek === 0 ? 1 : 7 - dayOfWeek;
        const message = daysLeft === 1 ? "Último dia da semana!" : `Faltam ${daysLeft} dias para o fim da semana.`;
        
        return (
            <div className="text-center text-gray-500 text-xs mb-4 -mt-2">
                <p>{dayName} • {message}</p>
            </div>
        );
    };

    const ActionButton = () => {
        if (isEditing) {
            return <button onClick={handleSave} className="w-full p-4 bg-blue-600 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg hover:bg-blue-700">Guardar Bússola</button>;
        }
        if (!dailyPriorities) {
            return <button onClick={onStartMorningRitual} className="w-full p-4 bg-blue-600 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg hover:bg-blue-700">Iniciar Ritual da Manhã</button>;
        }
        if (!dailyReview) {
            return <button onClick={onStartEveningRitual} className="w-full p-4 bg-amber-500 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg hover:bg-amber-600">Iniciar Ritual do Dia</button>;
        }
        return (
            <div className="p-4 border-2 border-dashed border-green-400 rounded-2xl bg-green-50 text-center">
                <h3 className="font-bold text-green-800">Dia Concluído! ✨</h3>
                <p className="text-sm text-green-700 mt-1">Ótimo trabalho. Volte amanhã para um novo ciclo.</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full text-gray-800">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold">Sua Bússola</h2>
                    <p className="text-base text-gray-500">Olá, {user?.name || 'usuário'}!</p>
                </div>
                <div className="text-3xl">{user?.avatar || '👤'}</div>
            </div>
             <TimeIndicators />

            <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm flex-grow">
                {isEditing ? (
                     <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Defina seu Sonho</label>
                            <textarea value={sonho} onChange={(e) => setSonho(e.target.value)} placeholder="Sua grande visão de longo prazo" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" rows="2"></textarea>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-green-500 uppercase tracking-wider">Defina seu Objetivo do Trimestre</label>
                            <textarea value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Sua meta para os próximos 3 meses" className="w-full mt-1 p-2 border border-gray-300 rounded-lg" rows="2"></textarea>
                        </div>
                         <div>
                            <label className="text-sm font-bold text-amber-500 uppercase tracking-wider">Defina os Destaques da Semana</label>
                            <div className="flex items-center mt-1">
                                <input type="text" value={currentHighlight} onChange={(e) => setCurrentHighlight(e.target.value)} placeholder="Adicionar um destaque" className="flex-grow p-2 border border-gray-300 rounded-l-lg" />
                                <button onClick={handleAddHighlight} className="bg-amber-500 text-white p-2 rounded-r-lg font-bold">+</button>
                            </div>
                            <ul className="list-disc list-inside mt-2 pl-2 text-sm text-gray-600">
                                {highlights.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <div>
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Sonho</label>
                            <p className="text-base text-gray-600 mt-1">{bussola?.sonho || 'Não definido'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-green-500 uppercase tracking-wider">Objetivo do Trimestre</label>
                            <p className="text-lg font-bold text-gray-800 mt-1">{bussola?.objetivoTrimestral || 'Não definido'}</p>
                        </div>
                        {dailyPriorities && (
                             <div>
                                <label className="text-sm font-bold text-blue-500 uppercase tracking-wider">Prioridades de Hoje</label>
                                <ul className="text-base text-gray-700 list-none mt-2 space-y-1">
                                    {dailyPriorities.map((item, index) => <li key={index} className="flex items-center"><span className="text-blue-500 mr-2">✓</span>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <ActionButton />
            </div>
        </div>
    );
};

const RitualMorningScreen = ({ onComplete }) => {
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    const [p3, setP3] = useState('');
    const canComplete = p1.trim() && p2.trim() && p3.trim();

    return (
        <div className="flex flex-col h-full text-gray-800">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold">Ritual da Manhã</h2>
                <p className="text-base text-gray-500 mt-1">Defina o foco do seu dia para garantir um progresso real.</p>
            </div>
            <div className="space-y-4 flex-grow">
                 <div>
                    <label className="font-bold text-sm">Prioridade 1</label>
                    <input type="text" value={p1} onChange={e => setP1(e.target.value)} placeholder="A tarefa mais importante de hoje é..." className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white shadow-sm" />
                </div>
                <div>
                    <label className="font-bold text-sm">Prioridade 2</label>
                    <input type="text" value={p2} onChange={e => setP2(e.target.value)} placeholder="A segunda tarefa mais importante é..." className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white shadow-sm" />
                </div>
                <div>
                    <label className="font-bold text-sm">Prioridade 3</label>
                    <input type="text" value={p3} onChange={e => setP3(e.target.value)} placeholder="A terceira tarefa mais importante é..." className="mt-1 p-3 border border-gray-300 rounded-lg w-full bg-white shadow-sm" />
                </div>
            </div>
            <button onClick={() => canComplete && onComplete([p1, p2, p3])} 
                    className={`mt-4 p-4 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg transition-colors ${canComplete ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                Concluir Ritual
            </button>
        </div>
    );
};

const RitualEveningScreen = ({ priorities, onComplete }) => {
    const [reviews, setReviews] = useState(() => priorities.map(p => ({ text: p, status: 'pendente', emotion: null })));
    const emotions = ['😊', '🤔', '💪', '😟'];

    const setStatus = (index, status) => {
        const newReviews = [...reviews];
        newReviews[index].status = status;
        setReviews(newReviews);
    };

    const setEmotion = (index, emotion) => {
        const newReviews = [...reviews];
        newReviews[index].emotion = emotion;
        setReviews(newReviews);
    };

    return (
         <div className="flex flex-col h-full text-gray-800">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold">Ritual do Dia</h2>
                <p className="text-base text-gray-500 mt-1">Reflita sobre as suas prioridades de hoje.</p>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {reviews.map((review, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="font-bold text-gray-700">{review.text}</p>
                        <div className="flex justify-around mt-2">
                            <button onClick={() => setStatus(index, 'concluida')} className={`py-1 px-3 text-sm rounded-full ${review.status === 'concluida' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Concluída</button>
                            <button onClick={() => setStatus(index, 'adiada')} className={`py-1 px-3 text-sm rounded-full ${review.status === 'adiada' ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}>Adiar</button>
                        </div>
                        <div className="flex justify-around mt-3 text-2xl">
                            {emotions.map(emoji => (
                                <button key={emoji} onClick={() => setEmotion(index, emoji)} className={`p-1 rounded-full transition-transform duration-150 ${review.emotion === emoji ? 'bg-blue-200 scale-125' : ''}`}>{emoji}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => onComplete(reviews)} 
                    className={`mt-4 p-4 text-white text-center font-bold rounded-xl cursor-pointer shadow-lg transition-colors bg-blue-600 hover:bg-blue-700`}>
                Finalizar o Dia
            </button>
        </div>
    );
};

const AcaoScreen = ({ currentUser, leagueData }) => {
    const rankedList = [...leagueData].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div className="flex flex-col h-full text-gray-800">
             <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold">Liga Semanal</h2>
                <p className="text-base text-gray-500">Veja o progresso da comunidade.</p>
            </div>
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {rankedList.map((player, index) => (
                    <div key={player.uid || index} className={`flex items-center p-3 rounded-xl border transition-all ${player.uid === currentUser.uid ? 'border-2 border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-200' : 'border-gray-200 bg-white shadow-sm'}`}>
                        <span className={`font-bold text-lg w-8 ${player.uid === currentUser.uid ? 'text-blue-800' : 'text-gray-400'}`}>{index + 1}</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${player.uid === currentUser.uid ? 'bg-blue-200' : 'bg-gray-200'}`}>{player.avatar}</div>
                        <span className={`ml-3 font-bold flex-grow ${player.uid === currentUser.uid ? 'text-blue-800' : ''}`}>{player.uid === currentUser.uid ? "Você" : player.name}</span>
                        <span className={`font-bold ${player.uid === currentUser.uid ? 'text-blue-800' : 'text-gray-700'}`}>{player.score || 0} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PerfilScreen = ({ user }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(currentTime);
    const formattedTime = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'medium' }).format(currentTime);

    return (
        <div className="flex flex-col h-full text-gray-800">
            <div className="text-center mb-6">
                <div className="relative w-28 h-28 mx-auto">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center text-6xl mx-auto mb-2 shadow-md">{user?.avatar}</div>
                </div>
                <h2 className="text-3xl font-extrabold mt-3">{user?.name}</h2>
                <p className="text-base text-gray-500">{user?.tribe}</p>
                 <div className="mt-4 p-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    <p className="font-semibold">{formattedDate}</p>
                    <p className="font-mono text-lg">{formattedTime}</p>
                 </div>
                 <p className="text-xs text-gray-400 mt-2">Versão: 1.18</p>
            </div>
            <div className="mb-6">
                <h3 className="font-bold mb-3 text-center text-base text-gray-500 uppercase tracking-wider">Suas Horas de Voo</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <p className="font-extrabold text-2xl text-amber-500 flex items-center justify-center">🚀 {user?.horasVoo?.presenca || 0}</p>
                        <p className="text-xs font-semibold">Presença</p>
                    </div>
                     <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm opacity-50">
                        <p className="font-extrabold text-2xl text-green-500 flex items-center justify-center">🌱 {user?.horasVoo?.projeto || 0}</p>
                        <p className="text-xs font-semibold">Projeto</p>
                    </div>
                     <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm opacity-50">
                        <p className="font-extrabold text-2xl text-blue-500 flex items-center justify-center">🤝 {user?.horasVoo?.colaboracao || 0}</p>
                        <p className="text-xs font-semibold">Colaboração</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlaceholderScreen = ({ title, icon, message }) => (
    <div className="flex flex-col h-full text-center items-center justify-center text-gray-800">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-3xl font-extrabold">{title}</h2>
        <p className="text-base text-gray-500 mt-2">{message}</p>
    </div>
);

const NavBar = ({ activeScreen, setScreen, onLogout }) => {
    const navItems = [
        { id: 'bussola', label: 'Bússola', icon: '🧭' },
        { id: 'acao', label: 'Ação', icon: '⚡️' },
        { id: 'comunidade', label: 'Comunidade', icon: '💬' },
        { id: 'perfil', label: 'Perfil', icon: '👤' },
    ];
    return (
        <div className="grid grid-cols-5 text-center text-gray-500 border-t-2 border-gray-200 bg-white/80 backdrop-blur-sm -mx-4 -mb-4 px-4 pt-3 pb-2">
            {navItems.map(item => (
                <button key={item.id} onClick={() => setScreen(item.id)} 
                        className={`transition-colors ${activeScreen === item.id ? 'text-blue-600 font-bold' : 'hover:text-blue-500'}`}>
                    <div className="text-3xl">{item.icon}</div>
                    <div className="text-xs font-semibold">{item.label}</div>
                </button>
            ))}
            <button onClick={onLogout} className="transition-colors text-gray-500 hover:text-red-500">
                <div className="text-3xl">🚪</div>
                <div className="text-xs font-semibold">Sair</div>
            </button>
        </div>
    );
};

export default function App() {
    const [screen, setScreen] = useState('loading'); 
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null); 
    const [userData, setUserData] = useState(null); 
    const [leagueData, setLeagueData] = useState([]);
    
    const isUserLoggedIn = currentUser != null;
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (currentUser && currentUser.uid === user.uid) return;
                setCurrentUser(user);
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    let dbData = { ...userDocSnap.data(), uid: user.uid };
                    const today = new Date().toDateString();
                    const lastRitualTimestamp = dbData.daily?.morningRitualCompletedAt;
                    if (lastRitualTimestamp) {
                        const lastRitualDate = lastRitualTimestamp.toDate().toDateString();
                         if(lastRitualDate !== today) {
                            dbData.daily = {}; 
                        }
                    }
                    setUserData(dbData);

                    if (!dbData.tribe) {
                        setScreen('selectTribe');
                    } else {
                        setScreen('bussola');
                    }
                } else {
                    setScreen('selectTribe');
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
                setScreen('login');
            }
        });
        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        const fetchLeagueData = async () => {
            if (screen === 'acao' && isUserLoggedIn) {
                const usersCol = collection(db, 'users');
                const userSnapshot = await getDocs(usersCol);
                const usersList = userSnapshot.docs.map(doc => ({...doc.data(), uid: doc.id}));
                setLeagueData(usersList);
            }
        };
        
        if(screen === 'bussola') {
            const today = new Date().toDateString();
            const lastRitualDate = userData?.daily?.morningRitualCompletedAt?.toDate().toDateString();
             if(lastRitualDate !== today && userData?.daily) {
                setUserData(prev => ({...prev, daily: {}}));
            }
        }

        fetchLeagueData();
    }, [screen, isUserLoggedIn, userData]);


    const getFriendlyErrorMessage = (code) => {
        switch (code) {
            case 'auth/email-already-in-use': return 'Este email já está a ser utilizado.';
            case 'auth/invalid-email': return 'O formato do email é inválido.';
            case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': return 'Email ou senha incorretos.';
            default: return 'Ocorreu um erro. Por favor, tente novamente.';
        }
    };

    const handleCreateAccount = async (formData) => {
        if (!formData.name || !formData.email || !formData.password) {
            setError("Por favor, preencha todos os campos.");
            return;
        }
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            const initialUserData = {
                name: formData.name,
                email: formData.email,
                score: 0,
                horasVoo: { presenca: 0, projeto: 0, colaboracao: 0 },
                createdAt: new Date(),
            };
            await setDoc(doc(db, "users", user.uid), initialUserData);
            setUserData({...initialUserData, uid: user.uid});
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        }
    };
    
    const handleLogin = async (formData) => {
        if (!formData.email || !formData.password) {
            setError("Por favor, preencha o email e a senha.");
            return;
        }
        setError('');
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    const handleSelectTribe = async (tribe) => {
        if (!currentUser) return;
        const updatedTribeData = { tribe: tribe.name, avatar: tribe.icon };
        try {
            await updateDoc(doc(db, "users", currentUser.uid), updatedTribeData);
            setUserData(prev => ({...prev, ...updatedTribeData}));
            setScreen('bussola');
        } catch (err) {
             setError("Não foi possível guardar a sua tribo.");
        }
    };

    const handleSaveBussola = async (data) => {
        if (!currentUser) return;
        try {
             await updateDoc(doc(db, "users", currentUser.uid), { bussola: data });
            setUserData(prev => ({...prev, bussola: data}));
        } catch(err){
            setError("Não foi possível guardar a sua bússola.");
        }
    };

    const handleStartMorningRitual = () => setScreen('ritualMorning');
    const handleStartEveningRitual = () => setScreen('ritualEvening');
    
    const handleCompleteMorningRitual = async (priorities) => {
        let points = 10;
        if (userData.bussola?.weeklyHighlights?.length > 0) {
            points += 5; 
        }
        const newScore = (userData.score || 0) + points;
        const newHorasVoo = (userData.horasVoo?.presenca || 0) + points;
        
        try {
            if (currentUser) {
                const dailyUpdate = {
                    priorities: priorities,
                    morningRitualCompletedAt: new Date()
                };
                await updateDoc(doc(db, "users", currentUser.uid), {
                    score: newScore,
                    "horasVoo.presenca": newHorasVoo,
                    daily: dailyUpdate
                });
                setUserData(prev => ({ ...prev, score: newScore, horasVoo: {...prev.horasVoo, presenca: newHorasVoo}, daily: dailyUpdate }));
            }
            setScreen('bussola');
        } catch(err) {
            setError("Não foi possível guardar o seu ritual.")
        }
    };

    const handleCompleteEveningRitual = async (review) => {
        let points = 5;
        const newScore = (userData.score || 0) + points;
        const newHorasVoo = (userData.horasVoo?.presenca || 0) + points;
        
        try {
             if (currentUser) {
                const dailyUpdate = {
                    ...userData.daily,
                    review: review,
                    eveningRitualCompletedAt: new Date()
                };
                await updateDoc(doc(db, "users", currentUser.uid), {
                    score: newScore,
                    "horasVoo.presenca": newHorasVoo,
                    daily: dailyUpdate
                });
                setUserData(prev => ({ ...prev, score: newScore, horasVoo: {...prev.horasVoo, presenca: newHorasVoo}, daily: dailyUpdate }));
             }
            setScreen('bussola');
        } catch(err) {
            setError("Não foi possível guardar a sua reflexão.")
        }
    };
    
    const renderContent = () => {
        if (screen === 'loading' || !userData && isUserLoggedIn) {
            return <div className="flex items-center justify-center h-full text-blue-600 text-lg font-semibold">Carregando LDSync...</div>
        }
        
        if (!isUserLoggedIn) {
             return <LoginScreen {...{ handleCreateAccount, handleLogin, error }} />;
        }
        
        if (screen === 'selectTribe') {
            return <SelectTribeScreen onSelectTribe={handleSelectTribe} userData={userData} />;
        }
        
        switch (screen) {
            case 'bussola':
                return <BussolaScreen {...{ user: userData, onSave: handleSaveBussola, onStartMorningRitual, onStartEveningRitual }} />;
            case 'ritualMorning':
                return <RitualMorningScreen onComplete={handleCompleteMorningRitual} />;
            case 'ritualEvening':
                return <RitualEveningScreen priorities={userData?.daily?.priorities || []} onComplete={handleCompleteEveningRitual} />;
            case 'acao':
                return <AcaoScreen currentUser={userData} leagueData={leagueData} />;
            case 'comunidade':
                return <PlaceholderScreen title="Comunidade" icon="💬" message="Aqui ficará o feed da comunidade." />;
            case 'perfil':
                return <PerfilScreen user={userData} />;
            default:
                 return <BussolaScreen {...{ user: userData, onSave: handleSaveBussola, onStartMorningRitual, onStartEveningRitual }} />;
        }
    };

    return (
        <div className="font-sans antialiased text-gray-800" style={{fontFamily: "'Nunito', sans-serif"}}>
            <div className="max-w-md mx-auto">
                <div className="border-8 border-gray-800 rounded-[40px] shadow-2xl bg-gray-50 w-full h-[750px] overflow-hidden flex flex-col">
                    <div className="bg-gray-800 w-32 h-5 mx-auto rounded-b-xl mt-1"></div>
                    <div className="flex-grow p-4 overflow-y-auto">
                        {renderContent()}
                    </div>
                    {isUserLoggedIn && screen !== 'selectTribe' && <NavBar activeScreen={screen} setScreen={setScreen} onLogout={handleLogout} />}
                </div>
            </div>
        </div>
    );
}
