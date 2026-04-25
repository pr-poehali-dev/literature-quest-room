import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const TOTAL_SECONDS = 45 * 60;

const QUEST_IMAGE = "https://cdn.poehali.dev/projects/d0debabf-112b-44f4-9176-35d794596c73/files/0e28544e-70e0-4993-986b-efe238509405.jpg";

const TASKS = [
  { id: 1, emoji: "🐺", title: "Три поросёнка", desc: "Найди в комнате 3 предмета из разных материалов: соломинку (или нитку), деревяшку и что-нибудь твёрдое. Это домики поросят!", done: false },
  { id: 2, emoji: "👠", title: "Золушка", desc: "Найди два одинаковых предмета — как пару хрустальных туфелек. Они спрятаны в разных углах комнаты!", done: false },
  { id: 3, emoji: "🍎", title: "Белоснежка", desc: "Гном Ворчун спрятал записку под чем-то красным. Найди красный предмет и прочитай послание!", done: false },
  { id: 4, emoji: "🐸", title: "Царевна-лягушка", desc: "Иван-царевич пустил стрелу! Найди предмет стрелообразной формы и принеси его на «болото» — к зелёному коврику (или стулу).", done: false },
  { id: 5, emoji: "🌹", title: "Аленький цветочек", desc: "Заколдованный зверь оставил послание! Найди самый красивый предмет в комнате, загадай желание вслух — и квест завершён!", done: false },
];

const HINTS = [
  { id: 1, emoji: "🐷", title: "Подсказка к заданию 1", text: "Соломинка — это может быть любая длинная тонкая вещь: карандаш, трубочка, нитка. Деревяшка — карандаш или линейка. Твёрдое — монетка или камушек!", color: "from-yellow-400 to-orange-400" },
  { id: 2, emoji: "👒", title: "Подсказка к заданию 2", text: "Ищи пару одинаковых вещей: два карандаша одного цвета, две одинаковые игрушки или два носка. Один спрятан у окна, второй — у двери!", color: "from-purple-400 to-pink-400" },
  { id: 3, emoji: "🍎", title: "Подсказка к заданию 3", text: "Красный предмет — это может быть книга, игрушка, подушка или кружка. Записка лежит именно ПОД ним, не рядом!", color: "from-green-400 to-cyan-400" },
  { id: 4, emoji: "🏹", title: "Подсказка к заданию 4", text: "Стрелу напоминают: ручка, линейка, карандаш — всё длинное и прямое. Неси его к чему-нибудь зелёному в комнате!", color: "from-blue-400 to-indigo-400" },
  { id: 5, emoji: "🌸", title: "Подсказка к заданию 5", text: "Самый красивый предмет — тот, который нравится тебе больше всего. Не бойся выбирать! Любой твой выбор правильный 🌟", color: "from-pink-400 to-rose-400" },
];

const ROOMS = [
  { id: 1, emoji: "🏰", name: "Тронный зал", desc: "Главная комната. Здесь начинается ваше приключение!", color: "bg-purple-100 border-purple-400", active: true },
  { id: 2, emoji: "🌿", name: "Магический сад", desc: "Таинственный сад с говорящими цветами. Заперт до 3-го задания.", color: "bg-green-100 border-green-400", active: false },
  { id: 3, emoji: "🔮", name: "Башня волшебника", desc: "Логово мудрого волшебника. Открывается после победы!", color: "bg-blue-100 border-blue-400", active: false },
];

type Tab = "instruction" | "room" | "tasks" | "hints";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("instruction");
  const [tasks, setTasks] = useState(TASKS);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  const completedCount = tasks.filter((t) => t.done).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const timerUrgent = timeLeft <= 5 * 60 && timeLeft > 0;
  const timerDone = timeLeft === 0;

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const revealHint = (id: number) => {
    setRevealedHints((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const tabs: { id: Tab; label: string; emoji: string; color: string }[] = [
    { id: "instruction", label: "Инструкция", emoji: "📖", color: "bg-purple-500" },
    { id: "room", label: "Комната", emoji: "🏰", color: "bg-blue-500" },
    { id: "tasks", label: "Задания", emoji: "✅", color: "bg-green-500" },
    { id: "hints", label: "Подсказки", emoji: "💡", color: "bg-yellow-500" },
  ];

  return (
    <div className="min-h-screen font-nunito relative overflow-x-hidden">
      {/* Background decorations */}
      <div className="stars-bg" aria-hidden="true">
        {["⭐", "🌟", "✨", "💫", "🌈", "🎈", "🎀", "🎊"].map((s, i) => (
          <span
            key={i}
            className="star absolute text-2xl select-none opacity-30"
            style={{
              left: `${10 + i * 11}%`,
              top: `${5 + (i % 4) * 22}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + i * 0.3}s`,
              fontSize: `${16 + (i % 3) * 8}px`,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border-2 border-purple-300 rounded-full px-4 py-1.5 mb-3 shadow-sm">
            <span className="text-lg">🎮</span>
            <span className="text-sm font-bold text-purple-700 tracking-wide uppercase">Детский квест</span>
          </div>
          <h1 className="font-rubik font-black text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 leading-tight mb-2">
            Тайна Волшебного Замка
          </h1>
          <p className="text-purple-700/70 font-semibold text-base">
            Стань героем и разгадай все загадки! 🦸
          </p>
        </header>

        {/* Timer */}
        <div className={`rounded-3xl p-4 mb-5 border-2 shadow-lg animate-fade-in flex items-center gap-4 ${
          timerDone ? "bg-red-100 border-red-400" : timerUrgent ? "bg-red-50 border-red-300" : "bg-white/80 backdrop-blur-sm border-purple-200"
        }`} style={{ animationDelay: "0.05s" }}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
            timerDone ? "bg-red-400" : timerUrgent ? "bg-orange-400 animate-wiggle" : "bg-gradient-to-br from-purple-500 to-pink-500"
          }`}>
            {timerDone ? "⏰" : "⏱️"}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-0.5">Осталось времени</p>
            <p className={`font-rubik font-black text-4xl leading-none ${
              timerDone ? "text-red-500" : timerUrgent ? "text-orange-500" : "text-purple-700"
            }`}>
              {timerDone ? "Время вышло!" : `${minutes}:${seconds}`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setTimerRunning((v) => !v)}
              disabled={timerDone}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold transition-all ${
                timerDone ? "bg-gray-300 cursor-not-allowed" : timerRunning ? "bg-orange-400 hover:bg-orange-500" : "bg-green-400 hover:bg-green-500"
              }`}
            >
              <Icon name={timerRunning ? "Pause" : "Play"} size={18} />
            </button>
            <button
              onClick={() => { setTimeLeft(TOTAL_SECONDS); setTimerRunning(false); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 bg-purple-100 hover:bg-purple-200 transition-all"
            >
              <Icon name="RotateCcw" size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 mb-5 border-2 border-purple-200 shadow-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-purple-700 text-sm flex items-center gap-1.5">
              <span>🏆</span> Прогресс квеста
            </span>
            <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {progress}%
            </span>
          </div>
          <div className="h-5 bg-purple-100 rounded-full overflow-hidden border-2 border-purple-200 relative">
            <div
              className="progress-bar-fill h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 relative"
              style={{ width: `${progress}%` }}
            >
              {progress > 5 && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-80 animate-pulse" />
              )}
            </div>
          </div>
          <div className="flex justify-between mt-1.5">
            {tasks.map((t, i) => (
              <div
                key={t.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                  t.done
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white scale-110 shadow-md"
                    : "bg-purple-100 text-purple-300 border-2 border-purple-200"
                }`}
              >
                {t.done ? "✓" : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Nav tabs */}
        <div className="grid grid-cols-4 gap-2 mb-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab flex flex-col items-center gap-1 py-3 px-2 rounded-2xl font-bold text-xs border-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.color} text-white border-transparent shadow-lg scale-105`
                  : "bg-white/80 text-purple-700 border-purple-200 hover:border-purple-400"
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="leading-tight text-center">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content panels */}
        <div className="animate-fade-in" key={activeTab}>
          {/* INSTRUCTION */}
          {activeTab === "instruction" && (
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden border-4 border-purple-300 shadow-xl">
                <img src={QUEST_IMAGE} alt="Квест комната" className="w-full h-52 object-cover" />
              </div>
              <div className="bg-white/90 rounded-3xl p-5 border-2 border-purple-200 shadow-lg">
                <h2 className="font-rubik font-black text-2xl text-purple-700 mb-3 flex items-center gap-2">
                  <span>📖</span> Как играть?
                </h2>
                <div className="space-y-3">
                  {[
                    { n: "1", emoji: "🗺️", text: "Изучи комнату — осмотрись вокруг и запомни, где что лежит." },
                    { n: "2", emoji: "📋", text: "Выполняй задания по порядку. Отмечай каждое галочкой." },
                    { n: "3", emoji: "💡", text: "Застрял? Загляни в подсказки — они помогут двигаться дальше." },
                    { n: "4", emoji: "🏆", text: "Выполни все 5 заданий и получи главный приз!" },
                  ].map((step) => (
                    <div key={step.n} className="flex items-start gap-3 p-3 bg-purple-50 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                        {step.n}
                      </div>
                      <p className="text-purple-800 font-semibold text-sm leading-snug pt-1">
                        <span className="mr-1">{step.emoji}</span> {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-4 border-2 border-yellow-500 shadow-lg text-center">
                <p className="font-rubik font-black text-white text-lg">⏱️ Время квеста: 45 минут</p>
                <p className="text-yellow-100 font-semibold text-sm mt-1">Удачи, искатель приключений!</p>
              </div>
            </div>
          )}

          {/* ROOM */}
          {activeTab === "room" && (
            <div className="space-y-3">
              <h2 className="font-rubik font-black text-2xl text-purple-700 flex items-center gap-2">
                <span>🏰</span> Локации квеста
              </h2>
              {ROOMS.map((room) => (
                <div
                  key={room.id}
                  className={`quest-card rounded-3xl p-4 border-2 ${room.color} shadow-lg ${!room.active ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                      {room.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-rubik font-black text-lg text-gray-800">{room.name}</h3>
                        {room.active ? (
                          <span className="bg-green-400 text-white text-xs font-bold px-2 py-0.5 rounded-full pulse-ring">
                            Активна
                          </span>
                        ) : (
                          <span className="bg-gray-300 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Icon name="Lock" size={10} /> Закрыта
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm font-semibold leading-snug">{room.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-4 border-2 border-blue-300 shadow-lg">
                <h3 className="font-rubik font-bold text-blue-700 text-base mb-2">🗺️ Карта замка</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["🌿", "🏰", "🔮"].map((e, i) => (
                    <div key={i} className={`h-16 rounded-2xl flex items-center justify-center text-3xl border-2 ${i === 1 ? "border-purple-400 bg-purple-100" : "border-gray-200 bg-white/60"}`}>
                      {e}
                    </div>
                  ))}
                </div>
                <p className="text-blue-600 text-xs font-semibold mt-2 text-center">Тронный зал — в центре карты</p>
              </div>
            </div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-3">
              <h2 className="font-rubik font-black text-2xl text-purple-700 flex items-center gap-2">
                <span>✅</span> Задания
                <span className="ml-auto text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {completedCount}/{tasks.length} выполнено
                </span>
              </h2>
              {tasks.map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`quest-card w-full text-left rounded-3xl p-4 border-2 shadow-lg transition-all duration-300 ${
                    task.done
                      ? "bg-green-50 border-green-400"
                      : "bg-white/90 border-purple-200 hover:border-purple-400"
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
                      task.done
                        ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-md"
                        : "bg-purple-100"
                    }`}>
                      {task.done ? "✅" : task.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-rubik font-black text-base mb-0.5 ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm font-semibold leading-snug ${task.done ? "text-gray-400" : "text-gray-600"}`}>
                        {task.desc}
                      </p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      task.done
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-purple-300 bg-white"
                    }`}>
                      {task.done && <Icon name="Check" size={14} />}
                    </div>
                  </div>
                </button>
              ))}
              {completedCount === tasks.length && (
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-6 text-center shadow-xl border-2 border-yellow-500 animate-bounce-in">
                  <div className="text-5xl mb-2 animate-float">🏆</div>
                  <h3 className="font-rubik font-black text-white text-2xl mb-1">Квест пройден!</h3>
                  <p className="text-yellow-100 font-semibold">Ты настоящий герой! Иди за призом! 🎉</p>
                </div>
              )}
            </div>
          )}

          {/* HINTS */}
          {activeTab === "hints" && (
            <div className="space-y-3">
              <h2 className="font-rubik font-black text-2xl text-purple-700 flex items-center gap-2">
                <span>💡</span> Подсказки
              </h2>
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-3 text-sm font-semibold text-orange-700">
                ⚠️ Нажми на подсказку только если совсем застрял. Попробуй сам сначала!
              </div>
              {HINTS.map((hint) => {
                const isRevealed = revealedHints.includes(hint.id);
                return (
                  <div key={hint.id} className="hint-card">
                    {!isRevealed ? (
                      <button
                        onClick={() => revealHint(hint.id)}
                        className="w-full rounded-3xl p-4 border-2 border-dashed border-yellow-400 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 shadow-md group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-yellow-400/30 flex items-center justify-center text-2xl">
                            🔒
                          </div>
                          <div className="text-left">
                            <h3 className="font-rubik font-black text-gray-700 text-base">{hint.title}</h3>
                            <p className="text-gray-500 font-semibold text-sm">Нажми, чтобы открыть подсказку</p>
                          </div>
                          <div className="ml-auto">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 group-hover:bg-yellow-500 flex items-center justify-center text-white transition-colors">
                              <Icon name="Eye" size={16} />
                            </div>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className={`rounded-3xl p-4 border-2 border-yellow-400 bg-gradient-to-br ${hint.color} shadow-lg animate-bounce-in`}>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center text-2xl flex-shrink-0">
                            {hint.emoji}
                          </div>
                          <div>
                            <h3 className="font-rubik font-black text-white text-base mb-1">{hint.title}</h3>
                            <p className="text-white/90 font-semibold text-sm leading-snug">{hint.text}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t-2 border-purple-200 px-4 py-2 shadow-2xl">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-2xl font-bold text-xs transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.color} text-white shadow-md`
                  : "text-purple-500 hover:text-purple-700"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="leading-none">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;