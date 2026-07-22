/**
 * O BATISMO PORTUGUÊS - E é assim a Vida
 * Frontend Application Script (Vanilla JS + Polling 5s + Multi-idioma PT/EN + Tarefas Dependentes + Tradução Gemini)
 */

const TRANSLATIONS = {
  pt: {
    subtitle: '"E é assim a Vida"',
    liveStatus: 'Tempo Real Ativo (5s)',
    visitorMode: 'Modo Visitante (Apenas Leitura)',
    loginBtn: 'Entrar',
    logoutBtn: 'Sair',
    loggedInAs: 'Ligado como',
    filterAll: 'Todas as Tarefas',
    filterPending: 'Pendentes',
    filterCompleted: 'Concluídas',
    newTaskBtn: 'Nova Tarefa',
    manageUsersBtn: 'Gerir Utilizadores',
    searchPlaceholder: 'Pesquisar tarefas...',
    loadingTasks: 'A carregar as tarefas do Batismo...',
    noTasksTitle: 'Nenhuma tarefa encontrada',
    noTasksSubtitle: 'Altere o filtro ou crie uma nova tarefa para o Batismo.',
    stampCompleted: '✔ Concluída',
    stampPendingText: '⏳ Pendente',
    stampLockedText: '🔒 Bloqueada',
    completeAndAttach: 'Concluir & Anexar',
    addProof: 'Adicionar Comprovativo',
    awaitingProof: 'Aguardando comprovativo',
    missionAccomplished: 'Missão cumprida!',
    mustCompleteFirst: '🔒 Bloqueada — Conclua primeiro: "{parent}" para desbloquear.',
    attachedProofs: 'Comprovativos Anexados',
    maximize: 'Maximizar',
    viewImage: 'Ver Imagem',
    loginModalTitle: 'Entrar no Batismo',
    loginModalSubtitle: 'Indique o seu nome de utilizador e palavra-passe',
    usernameLabel: 'Nome de Utilizador',
    passwordLabel: 'Palavra-passe',
    usernamePlaceholder: 'ex: thomaz ou admin',
    submitLogin: 'Entrar na Conta',
    newTaskModalTitle: 'Nova Tarefa do Batismo',
    editTaskModalTitle: 'Editar Tarefa',
    taskTitleLabel: 'Título da Tarefa *',
    taskTitlePlaceholder: 'ex: Comprar o Bacalhau para o Jantar',
    taskDescLabel: 'Descrição',
    taskDescPlaceholder: 'Detalhes e instruções para cumprir a missão...',
    taskParentLabel: 'Tarefa Pai (Para Desbloquear)',
    noParentOpt: '-- Nenhuma (Livre / Desbloqueada) --',
    cancelBtn: 'Cancelar',
    saveTaskBtn: 'Guardar Tarefa',
    manageUsersModalTitle: 'Gerir Utilizadores',
    createNewAccount: 'Criar Nova Conta',
    namePlaceholder: 'Nome',
    passwordPlaceholder: 'Palavra-passe',
    userRole: 'Utilizador',
    adminRole: 'Administrador',
    createUserBtn: 'Criar Utilizador',
    registeredUsers: 'Utilizadores Registados',
    uploadModalTitle: 'Enviar Comprovativo',
    uploadModalSubtitle: 'Anexe uma foto ou vídeo para comprovar a conclusão da tarefa',
    clickFileSelect: 'Clique para selecionar foto ou vídeo',
    fileHint: 'Suporta JPG, PNG, WEBP, MP4, MOV (Máx. 50MB)',
    uploading: 'A carregar para o armazenamento...',
    submitUpload: 'Enviar & Concluir',
    footerSubtitle: '"E é assim a Vida" • Celebração Tradicional',
    welcomeToast: 'Bem-vindo, {name}! 🍺',
    logoutToast: 'Sessão terminada.',
    taskCreatedToast: 'Nova tarefa criada com sucesso! 📜',
    taskUpdatedToast: 'Tarefa atualizada!',
    taskDeletedToast: 'Tarefa eliminada com sucesso.',
    proofUploadedToast: 'Comprovativo carregado e tarefa marcada como Concluída! 🍺',
    userCreatedToast: 'Utilizador {name} criado!'
  },
  en: {
    subtitle: '"And so is Life"',
    liveStatus: 'Live Updates (5s)',
    visitorMode: 'Visitor Mode (Read-Only)',
    loginBtn: 'Log In',
    logoutBtn: 'Log Out',
    loggedInAs: 'Logged in as',
    filterAll: 'All Tasks',
    filterPending: 'Pending',
    filterCompleted: 'Completed',
    newTaskBtn: 'New Task',
    manageUsersBtn: 'Manage Users',
    searchPlaceholder: 'Search tasks...',
    loadingTasks: 'Loading Baptism tasks...',
    noTasksTitle: 'No tasks found',
    noTasksSubtitle: 'Change filter or create a new task for the Baptism.',
    stampCompleted: '✔ Completed',
    stampPendingText: '⏳ Pending',
    stampLockedText: '🔒 Locked',
    completeAndAttach: 'Complete & Attach',
    addProof: 'Add Proof',
    awaitingProof: 'Awaiting proof',
    missionAccomplished: 'Mission accomplished!',
    mustCompleteFirst: '🔒 Locked — Complete first: "{parent}" to unlock.',
    attachedProofs: 'Attached Proofs',
    maximize: 'Maximize',
    viewImage: 'View Image',
    loginModalTitle: 'Log in to Baptism',
    loginModalSubtitle: 'Enter your username and password',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    usernamePlaceholder: 'e.g. thomaz or admin',
    submitLogin: 'Log In',
    newTaskModalTitle: 'New Baptism Task',
    editTaskModalTitle: 'Edit Task',
    taskTitleLabel: 'Task Title *',
    taskTitlePlaceholder: 'e.g. Buy Codfish for Dinner',
    taskDescLabel: 'Description',
    taskDescPlaceholder: 'Details and instructions to fulfill the mission...',
    taskParentLabel: 'Parent Task (To Unlock)',
    noParentOpt: '-- None (Free / Unlocked) --',
    cancelBtn: 'Cancel',
    saveTaskBtn: 'Save Task',
    manageUsersModalTitle: 'Manage Users',
    createNewAccount: 'Create New Account',
    namePlaceholder: 'Name',
    passwordPlaceholder: 'Password',
    userRole: 'User',
    adminRole: 'Administrator',
    createUserBtn: 'Create User',
    registeredUsers: 'Registered Users',
    uploadModalTitle: 'Upload Proof',
    uploadModalSubtitle: 'Attach a photo or video to prove task completion',
    clickFileSelect: 'Click to select photo or video',
    fileHint: 'Supports JPG, PNG, WEBP, MP4, MOV (Max 50MB)',
    uploading: 'Uploading to storage...',
    submitUpload: 'Upload & Complete',
    footerSubtitle: '"And so is Life" • Traditional Celebration',
    welcomeToast: 'Welcome, {name}! 🍺',
    logoutToast: 'Logged out.',
    taskCreatedToast: 'New task successfully created! 📜',
    taskUpdatedToast: 'Task updated!',
    taskDeletedToast: 'Task deleted successfully.',
    proofUploadedToast: 'Proof uploaded and task marked as Completed! 🍺',
    userCreatedToast: 'User {name} created!'
  }
};

class BatismoApp {
  constructor() {
    this.token = localStorage.getItem('batismo_token') || null;
    this.user = JSON.parse(localStorage.getItem('batismo_user') || 'null');
    this.lang = localStorage.getItem('batismo_lang') || 'pt';
    this.tasks = [];
    this.users = [];
    this.currentFilter = 'all';
    this.pollingTimer = null;
    this.selectedFile = null;

    this.init();
  }

  async init() {
    this.updateStaticTranslations();
    this.renderAuthContainer();
    await this.fetchTasks();
    this.startPolling();
    
    if (this.user && this.user.papel === 'admin') {
      this.fetchUsers();
    }
  }

  // ==========================================
  // MULTI-IDIOMA (PT-PT / EN)
  // ==========================================

  setLanguage(lang) {
    if (lang !== 'pt' && lang !== 'en') return;
    this.lang = lang;
    localStorage.setItem('batismo_lang', lang);

    const btnPt = document.getElementById('langPtBtn');
    const btnEn = document.getElementById('langEnBtn');
    
    if (lang === 'pt') {
      btnPt.className = 'px-2.5 py-1 rounded-md text-xs font-bold transition-all bg-vintage-navy text-white';
      btnEn.className = 'px-2.5 py-1 rounded-md text-xs font-bold transition-all text-vintage-navy hover:bg-vintage-bgDark';
    } else {
      btnEn.className = 'px-2.5 py-1 rounded-md text-xs font-bold transition-all bg-vintage-navy text-white';
      btnPt.className = 'px-2.5 py-1 rounded-md text-xs font-bold transition-all text-vintage-navy hover:bg-vintage-bgDark';
    }

    this.updateStaticTranslations();
    this.renderAuthContainer();
    this.renderTasks();
  }

  t(key, replacements = {}) {
    let text = (TRANSLATIONS[this.lang] && TRANSLATIONS[this.lang][key]) || TRANSLATIONS['pt'][key] || key;
    Object.keys(replacements).forEach(k => {
      text = text.replace(`{${k}}`, replacements[k]);
    });
    return text;
  }

  updateStaticTranslations() {
    const setTxt = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.innerText = this.t(key);
    };

    const setPlaceholder = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.placeholder = this.t(key);
    };

    setTxt('txtSubtitle', 'subtitle');
    setTxt('txtLiveStatus', 'liveStatus');
    setTxt('lblFilterAll', 'filterAll');
    setTxt('lblFilterPending', 'filterPending');
    setTxt('lblFilterCompleted', 'filterCompleted');
    setTxt('lblNewTask', 'newTaskBtn');
    setTxt('lblManageUsers', 'manageUsersBtn');
    setPlaceholder('searchInput', 'searchPlaceholder');
    setTxt('txtLoading', 'loadingTasks');
    setTxt('txtFooterSubtitle', 'footerSubtitle');

    setTxt('lblLoginModalTitle', 'loginModalTitle');
    setTxt('lblLoginModalSubtitle', 'loginModalSubtitle');
    setTxt('lblUsername', 'usernameLabel');
    setTxt('lblPassword', 'passwordLabel');
    setPlaceholder('loginNome', 'usernamePlaceholder');
    setTxt('btnSubmitLogin', 'submitLogin');

    setTxt('taskModalTitle', 'newTaskModalTitle');
    setTxt('lblTaskTitle', 'taskTitleLabel');
    setPlaceholder('taskTitulo', 'taskTitlePlaceholder');
    setTxt('lblTaskDesc', 'taskDescLabel');
    setPlaceholder('taskDescricao', 'taskDescPlaceholder');
    setTxt('lblTaskParent', 'taskParentLabel');
    setTxt('optNoParent', 'noParentOpt');
    setTxt('btnCancelTask', 'cancelBtn');
    setTxt('btnSaveTask', 'saveTaskBtn');

    setTxt('lblManageUsersModalTitle', 'manageUsersModalTitle');
    setTxt('lblCreateNewAccount', 'createNewAccount');
    setPlaceholder('newUserName', 'namePlaceholder');
    setPlaceholder('newUserPass', 'passwordPlaceholder');
    setTxt('optRoleUser', 'userRole');
    setTxt('optRoleAdmin', 'adminRole');
    setTxt('btnCreateUser', 'createUserBtn');
    setTxt('lblRegisteredUsers', 'registeredUsers');

    setTxt('lblUploadModalTitle', 'uploadModalTitle');
    setTxt('lblUploadModalSubtitle', 'uploadModalSubtitle');
    setTxt('lblClickFileSelect', 'clickFileSelect');
    setTxt('lblFileHint', 'fileHint');
    setTxt('lblUploading', 'uploading');
    setTxt('btnCancelUpload', 'cancelBtn');
    setTxt('btnSubmitUpload', 'submitUpload');
  }

  // ==========================================
  // AUTENTICAÇÃO & SESSÃO
  // ==========================================

  renderAuthContainer() {
    const container = document.getElementById('authContainer');
    const adminButtons = document.getElementById('adminActionButtons');

    if (this.user && this.token) {
      const isAdmin = this.user.papel === 'admin';

      container.innerHTML = `
        <div class="flex items-center gap-3 bg-vintage-bg border border-vintage-gold/50 px-3.5 py-1.5 rounded-xl shadow-sm">
          <div class="flex flex-col text-right">
            <span class="text-xs text-vintage-navy/60 uppercase font-bold">${this.t('loggedInAs')}</span>
            <span class="font-bold text-vintage-red text-sm flex items-center gap-1 justify-end">
              ${this.escapeHtml(this.user.nome)}
              ${isAdmin ? '<span class="bg-vintage-red text-white text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded shadow">ADMIN</span>' : '<span class="bg-vintage-navy text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">USER</span>'}
            </span>
          </div>
          <button onclick="app.logout()" class="px-3 py-1.5 bg-vintage-red/10 hover:bg-vintage-red hover:text-white text-vintage-red border border-vintage-red/30 rounded-lg text-xs font-bold transition-all">
            🚪 ${this.t('logoutBtn')}
          </button>
        </div>
      `;

      if (isAdmin) {
        adminButtons.classList.remove('hidden');
      } else {
        adminButtons.classList.add('hidden');
      }
    } else {
      container.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xs text-vintage-navy/70 hidden sm:inline italic">${this.t('visitorMode')}</span>
          <button onclick="app.openModal('loginModal')" class="px-4 py-2 bg-vintage-red hover:bg-vintage-redDark text-white font-bold rounded-lg text-sm shadow transition-all border border-vintage-gold/40 flex items-center gap-1">
            <span>🔑</span> ${this.t('loginBtn')}
          </button>
        </div>
      `;
      adminButtons.classList.add('hidden');
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const nome = document.getElementById('loginNome').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorDiv.innerText = data.erro || 'Falha no login.';
        errorDiv.classList.remove('hidden');
        return;
      }

      this.token = data.token;
      this.user = data.utilizador;
      localStorage.setItem('batismo_token', data.token);
      localStorage.setItem('batismo_user', JSON.stringify(data.utilizador));

      this.closeModal('loginModal');
      document.getElementById('loginForm').reset();
      this.renderAuthContainer();

      if (this.user.papel === 'admin') {
        await this.fetchUsers();
      }

      await this.fetchTasks();
      this.showToast(this.t('welcomeToast', { name: this.user.nome }), 'success');
    } catch (err) {
      console.error(err);
      errorDiv.innerText = 'Erro de ligação ao servidor.';
      errorDiv.classList.remove('hidden');
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('batismo_token');
    localStorage.removeItem('batismo_user');
    this.renderAuthContainer();
    this.renderTasks();
    this.showToast(this.t('logoutToast'), 'info');
  }

  // ==========================================
  // CARREGAMENTO DE DADOS & POLLING 5S
  // ==========================================

  startPolling() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(() => {
      this.fetchTasks(true);
    }, 5000);
  }

  async fetchTasks(isBackground = false) {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) return;
      const data = await res.json();
      
      this.tasks = data;
      this.updateCounts();
      this.renderTasks();
    } catch (err) {
      if (!isBackground) console.error('Erro ao carregar tarefas:', err);
    }
  }

  async fetchUsers() {
    if (!this.token) return;
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        this.users = await res.json();
        this.renderUsersList();
      }
    } catch (err) {
      console.error('Erro ao carregar utilizadores:', err);
    }
  }

  // ==========================================
  // RENDERIZAÇÃO DE TAREFAS
  // ==========================================

  updateCounts() {
    const total = this.tasks.length;
    const pending = this.tasks.filter(t => t.estado === 'pendente').length;
    const completed = this.tasks.filter(t => t.estado === 'concluida').length;

    document.getElementById('countAll').innerText = total;
    document.getElementById('countPending').innerText = pending;
    document.getElementById('countCompleted').innerText = completed;
  }

  setFilter(filter) {
    this.currentFilter = filter;

    const btnAll = document.getElementById('btnFilterAll');
    const btnPending = document.getElementById('btnFilterPending');
    const btnCompleted = document.getElementById('btnFilterCompleted');

    [btnAll, btnPending, btnCompleted].forEach(b => {
      b.className = "px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-vintage-bg hover:bg-vintage-bgDark text-vintage-navy border border-vintage-navy/20";
    });

    if (filter === 'all') {
      btnAll.className = "px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-vintage-navy text-white shadow-sm hover:bg-vintage-navyDark";
    } else if (filter === 'pendente') {
      btnPending.className = "px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-vintage-red text-white shadow-sm hover:bg-vintage-redDark";
    } else if (filter === 'concluida') {
      btnCompleted.className = "px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-vintage-green text-white shadow-sm hover:bg-emerald-800";
    }

    this.renderTasks();
  }

  renderTasks() {
    const container = document.getElementById('tasksContainer');
    const searchQuery = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const isEn = this.lang === 'en';

    let filtered = this.tasks;

    if (this.currentFilter === 'pendente') {
      filtered = filtered.filter(t => t.estado === 'pendente');
    } else if (this.currentFilter === 'concluida') {
      filtered = filtered.filter(t => t.estado === 'concluida');
    }

    if (searchQuery) {
      filtered = filtered.filter(t => {
        const titlePt = t.titulo || '';
        const titleEn = t.titulo_en || '';
        const descPt = t.descricao || '';
        const descEn = t.descricao_en || '';
        return titlePt.toLowerCase().includes(searchQuery) ||
               titleEn.toLowerCase().includes(searchQuery) ||
               descPt.toLowerCase().includes(searchQuery) ||
               descEn.toLowerCase().includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-vintage-paper rounded-2xl border-2 border-dashed border-vintage-gold/40">
          <span class="text-4xl block mb-2">📜</span>
          <p class="font-title text-xl text-vintage-navy font-bold">${this.t('noTasksTitle')}</p>
          <p class="text-sm text-vintage-navy/60 mt-1">${this.t('noTasksSubtitle')}</p>
        </div>
      `;
      return;
    }

    const isAdmin = this.user && this.user.papel === 'admin';

    container.innerHTML = filtered.map(t => {
      const isConcluida = t.estado === 'concluida';
      const isBloqueada = t.tarefa_pai_id && t.tarefa_pai_estado !== 'concluida';
      const canUpload = !!this.user && !isBloqueada;

      const displayTitulo = isEn ? (t.titulo_en || t.titulo) : t.titulo;
      const displayDescricao = isEn ? (t.descricao_en || t.descricao) : t.descricao;
      const parentTitulo = isEn ? (t.tarefa_pai_titulo_en || t.tarefa_pai_titulo) : t.tarefa_pai_titulo;

      return `
        <div class="bg-vintage-paper rounded-2xl p-6 border-2 ${isConcluida ? 'border-vintage-green/30' : isBloqueada ? 'border-amber-600/40 bg-amber-50/20' : 'border-vintage-gold/40'} shadow-vintage flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-xl">
          
          <!-- Carimbo de Estado Vintage -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex-1">
              <h3 class="font-title font-bold text-xl text-vintage-navy leading-snug">
                ${this.escapeHtml(displayTitulo)}
              </h3>
            </div>

            <!-- Carimbo -->
            <div class="shrink-0 px-3 py-1 text-xs rounded-md ${
              isConcluida 
                ? 'badge-stamp-concluida' 
                : isBloqueada 
                ? 'border-2 border-dashed border-amber-700 text-amber-800 bg-amber-100/70 font-extrabold uppercase tracking-wider -rotate-2' 
                : 'badge-stamp-pendente'
            }">
              ${isConcluida ? this.t('stampCompleted') : isBloqueada ? this.t('stampLockedText') : this.t('stampPendingText')}
            </div>
          </div>

          <!-- Conteúdo: Se Bloqueada vs Desbloqueada -->
          ${isBloqueada ? `
            <div class="my-4 bg-amber-100/80 border-2 border-amber-300 p-4 rounded-xl text-amber-900 text-sm font-semibold flex items-center gap-3">
              <span class="text-2xl">🔒</span>
              <p class="leading-relaxed">
                ${this.t('mustCompleteFirst', { parent: this.escapeHtml(parentTitulo || 'Parent Task') })}
              </p>
            </div>
          ` : `
            <!-- Descrição -->
            ${displayDescricao ? `<p class="text-sm text-vintage-navy/80 mb-4 bg-vintage-bg/50 p-3 rounded-lg border border-vintage-gold/20 leading-relaxed">${this.escapeHtml(displayDescricao)}</p>` : '<div class="mb-4"></div>'}

            <!-- Galeria de Anexos -->
            ${t.anexos && t.anexos.length > 0 ? `
              <div class="mb-4 border-t border-vintage-navy/10 pt-3">
                <span class="block text-xs font-bold text-vintage-navy/60 uppercase tracking-wider mb-2">${this.t('attachedProofs')} (${t.anexos.length}):</span>
                <div class="grid grid-cols-2 gap-2">
                  ${t.anexos.map(anexo => {
                    if (anexo.tipo_ficheiro === 'video') {
                      return `
                        <div class="relative rounded-xl overflow-hidden border-2 border-vintage-navy/30 bg-black aspect-video group">
                          <video src="${anexo.url_ficheiro}" controls class="w-full h-full object-cover"></video>
                          <button onclick="app.openLightbox('${anexo.url_ficheiro}', 'video')" class="absolute top-1 right-1 bg-vintage-navy/80 hover:bg-vintage-navy text-white text-xs px-2 py-0.5 rounded shadow">
                            🔍 ${this.t('maximize')}
                          </button>
                        </div>
                      `;
                    } else {
                      return `
                        <div class="relative rounded-xl overflow-hidden border-2 border-vintage-gold/50 bg-vintage-bg aspect-video group cursor-pointer" onclick="app.openLightbox('${anexo.url_ficheiro}', 'imagem')">
                          <img src="${anexo.url_ficheiro}" alt="Comprovativo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                          <div class="absolute inset-0 bg-vintage-navy/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span class="bg-vintage-paper text-vintage-navy text-xs font-bold px-2 py-1 rounded shadow">${this.t('viewImage')}</span>
                          </div>
                        </div>
                      `;
                    }
                  }).join('')}
                </div>
              </div>
            ` : ''}
          `}

          <!-- Botões de Ação -->
          <div class="border-t border-vintage-navy/10 pt-4 mt-auto flex items-center justify-between gap-2">
            
            ${canUpload ? `
              <button onclick="app.openUploadModal(${t.id})" class="px-3.5 py-1.5 bg-vintage-red hover:bg-vintage-redDark text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1">
                <span>📸</span> ${isConcluida ? this.t('addProof') : this.t('completeAndAttach')}
              </button>
            ` : `
              <span class="text-xs text-vintage-navy/50 italic">
                ${isConcluida ? this.t('missionAccomplished') : isBloqueada ? '🔒 ' + this.t('stampLockedText') : this.t('awaitingProof')}
              </span>
            `}

            ${isAdmin ? `
              <div class="flex items-center gap-1">
                <button onclick="app.openEditTaskModal(${t.id})" title="Editar Tarefa" class="p-1.5 bg-vintage-bg hover:bg-vintage-bgDark text-vintage-navy rounded-lg border border-vintage-navy/20 text-xs">
                  ✏️
                </button>
                <button onclick="app.deleteTask(${t.id})" title="Eliminar Tarefa" class="p-1.5 bg-red-100 hover:bg-red-200 text-vintage-red rounded-lg border border-red-300 text-xs">
                  🗑️
                </button>
              </div>
            ` : ''}

          </div>

        </div>
      `;
    }).join('');
  }

  // ==========================================
  // MODAIS & OPERAÇÕES DE TAREFA (ADMIN)
  // ==========================================

  populateParentTaskSelect(currentTaskId = null) {
    const select = document.getElementById('taskTarefaPai');
    if (!select) return;

    const isEn = this.lang === 'en';
    const options = [
      `<option value="" id="optNoParent">${this.t('noParentOpt')}</option>`
    ];

    this.tasks.forEach(t => {
      if (currentTaskId && t.id === parseInt(currentTaskId, 10)) return;
      const parentTitle = isEn ? (t.titulo_en || t.titulo) : t.titulo;
      options.push(`<option value="${t.id}">${this.escapeHtml(parentTitle)} (${t.estado === 'concluida' ? '✔' : '⏳'})</option>`);
    });

    select.innerHTML = options.join('');
  }

  openNewTaskModal() {
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    this.populateParentTaskSelect(null);
    document.getElementById('taskModalTitle').innerText = this.t('newTaskModalTitle');
    this.openModal('taskModal');
  }

  openEditTaskModal(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitulo').value = task.titulo;
    document.getElementById('taskDescricao').value = task.descricao || '';
    
    this.populateParentTaskSelect(task.id);
    document.getElementById('taskTarefaPai').value = task.tarefa_pai_id || '';

    document.getElementById('taskModalTitle').innerText = this.t('editTaskModalTitle');
    this.openModal('taskModal');
  }

  async handleSaveTask(event) {
    event.preventDefault();
    const id = document.getElementById('taskId').value;
    const titulo = document.getElementById('taskTitulo').value.trim();
    const descricao = document.getElementById('taskDescricao').value.trim();
    const tarefa_pai_id = document.getElementById('taskTarefaPai').value || null;

    const url = id ? `/api/tasks/${id}` : '/api/tasks';
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ titulo, descricao, tarefa_pai_id })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.erro || 'Erro ao guardar tarefa.');
        return;
      }

      this.closeModal('taskModal');
      await this.fetchTasks();
      this.showToast(id ? this.t('taskUpdatedToast') : this.t('taskCreatedToast'), 'success');
    } catch (err) {
      console.error(err);
      alert('Erro de ligação ao servidor.');
    }
  }

  async deleteTask(id) {
    if (!confirm('Tem a certeza que deseja eliminar esta tarefa?')) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (res.ok) {
        await this.fetchTasks();
        this.showToast(this.t('taskDeletedToast'), 'info');
      } else {
        const data = await res.json();
        alert(data.erro || 'Erro ao eliminar tarefa.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de ligação.');
    }
  }

  // ==========================================
  // GERIR UTILIZADORES (ADMIN)
  // ==========================================

  openManageUsersModal() {
    this.fetchUsers();
    this.openModal('usersModal');
  }

  renderUsersList() {
    const list = document.getElementById('usersList');
    if (this.users.length === 0) {
      list.innerHTML = '<p class="text-xs text-vintage-navy/50 italic">Sem utilizadores registados.</p>';
      return;
    }

    list.innerHTML = this.users.map(u => `
      <div class="flex items-center justify-between p-2.5 bg-vintage-bg rounded-lg border border-vintage-navy/10">
        <span class="font-bold text-sm text-vintage-navy">${this.escapeHtml(u.nome)}</span>
        <span class="text-xs px-2 py-0.5 rounded font-extrabold uppercase ${u.papel === 'admin' ? 'bg-vintage-red text-white' : 'bg-vintage-navy text-white'}">
          ${u.papel}
        </span>
      </div>
    `).join('');
  }

  async handleCreateUser(event) {
    event.preventDefault();
    const nome = document.getElementById('newUserName').value.trim();
    const password = document.getElementById('newUserPass').value;
    const papel = document.getElementById('newUserRole').value;
    const errorDiv = document.getElementById('createUserError');

    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ nome, password, papel })
      });

      const data = await res.json();

      if (!res.ok) {
        errorDiv.innerText = data.erro || 'Erro ao criar utilizador.';
        errorDiv.classList.remove('hidden');
        return;
      }

      document.getElementById('createUserForm').reset();
      await this.fetchUsers();
      this.showToast(this.t('userCreatedToast', { name: nome }), 'success');
    } catch (err) {
      console.error(err);
      errorDiv.innerText = 'Erro de ligação.';
      errorDiv.classList.remove('hidden');
    }
  }

  // ==========================================
  // UPLOAD DE COMPROVATIVO
  // ==========================================

  openUploadModal(taskId) {
    document.getElementById('uploadTaskId').value = taskId;
    document.getElementById('proofFileInput').value = '';
    document.getElementById('uploadFilePreview').innerHTML = `
      <span class="text-3xl block mb-2">📁</span>
      <p class="text-sm font-bold text-vintage-navy">${this.t('clickFileSelect')}</p>
      <p class="text-xs text-vintage-navy/50 mt-1">${this.t('fileHint')}</p>
    `;
    this.selectedFile = null;
    this.openModal('uploadModal');
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const isVideo = file.type.startsWith('video/');

    document.getElementById('uploadFilePreview').innerHTML = `
      <span class="text-3xl block mb-2">${isVideo ? '📹' : '🖼️'}</span>
      <p class="text-sm font-bold text-vintage-red">${this.escapeHtml(file.name)}</p>
      <p class="text-xs text-vintage-navy/60 mt-1">${(file.size / (1024 * 1024)).toFixed(2)} MB &bull; ${isVideo ? 'Vídeo' : 'Imagem'}</p>
    `;
  }

  async handleUploadProof(event) {
    event.preventDefault();
    const taskId = document.getElementById('uploadTaskId').value;
    const fileInput = document.getElementById('proofFileInput');

    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Selecione um ficheiro antes de submeter.');
      return;
    }

    const progressDiv = document.getElementById('uploadProgress');
    const submitBtn = document.getElementById('btnSubmitUpload');

    progressDiv.classList.remove('hidden');
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('ficheiro', fileInput.files[0]);

    try {
      const res = await fetch(`/api/tasks/${taskId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || 'Erro ao carregar ficheiro.');
        return;
      }

      this.closeModal('uploadModal');
      await this.fetchTasks();
      this.showToast(this.t('proofUploadedToast'), 'success');
    } catch (err) {
      console.error(err);
      alert('Erro de ligação ao servidor.');
    } finally {
      progressDiv.classList.add('hidden');
      submitBtn.disabled = false;
    }
  }

  // ==========================================
  // LIGHTBOX & UTILITÁRIOS
  // ==========================================

  openLightbox(url, tipo) {
    const container = document.getElementById('mediaLightboxContent');
    if (tipo === 'video') {
      container.innerHTML = `
        <video src="${url}" controls autoplay class="max-w-full max-h-[75vh] rounded-lg shadow-2xl"></video>
      `;
    } else {
      container.innerHTML = `
        <img src="${url}" alt="Comprovativo Ampliado" class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl">
      `;
    }
    this.openModal('mediaLightboxModal');
  }

  openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all duration-300 border-2 border-vintage-gold text-white ${type === 'success' ? 'bg-vintage-red' : 'bg-vintage-navy'}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new BatismoApp();
});
