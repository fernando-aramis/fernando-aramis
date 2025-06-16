//         "footer_prefix": "© ", "footer_suffix": " Teste de Tradução. Todos os direitos reservados."
document.addEventListener('DOMContentLoaded', ()=> {
    // --- Cache de Seletores ---
    const transEls = document.querySelectorAll('[data-translate-key]');
    const langToggleBtn = document.getElementById('current-lang-toggle');
    const langOptionsList = document.getElementById('lang-options-list');
    const currentLangText = document.getElementById('current-lang-text');
    const footerYearEl = document.getElementById('current-year');

    // [MELHORIA 1] Cache dos botões de idioma para evitar buscas repetidas no DOM.
    const langOptionButtons = Array.from(langOptionsList?.querySelectorAll('.lang-option') || []);

    // --- Estado e Configurações ---
    const loadedTranslations = {};
    let isToggling = false; // [MELHORIA 5] Flag para controle de debounce.

    const langSuffixMap = {
        'pt-BR': 'portuguese',
        'en': 'english',
        'es': 'spanish',
    };
    const defaultDisplayMap = {
        'pt-BR': 'Português',
        'en': 'English',
        'es': 'Español',
    };

    // --- Funções ---

    /**
     * Carrega e armazena em cache o arquivo JSON de um idioma.
     * @param {string} lang - O código do idioma (ex: 'pt-BR').
     * @returns {Promise<object|null>} O objeto de tradução ou null em caso de falha.
     */
    async function loadLanguage(lang) {
        if (loadedTranslations[lang]) {
            return loadedTranslations[lang];
        }
        try {
            const res = await fetch(`./languages/${lang}.json`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const translations = await res.json();
            loadedTranslations[lang] = translations;
            return translations;
        } catch (err) {
            console.error(`Falha ao carregar tradução para "${lang}":`, err);
            // [MELHORIA 3] Retorna null para que a falha possa ser tratada.
            return null;
        }
    }

    /**
     * Aplica as traduções na página com base no idioma selecionado.
     * @param {string} lang - O código do idioma a ser aplicado.
     */
    async function setLanguage(lang) {
        const pack = await loadLanguage(lang);

        // [MELHORIA 3] Trata falhas na carga da tradução.
        if (!pack) {
            alert(`A tradução para "${lang}" não está disponível no momento.`);
            return; // Interrompe a execução para não deixar a página em branco.
        }

        // Aplica tradução em cada elemento.
        transEls.forEach(el => {
            const key = el.dataset.translateKey;
            el.textContent = pack[key] ?? `[${key}]`; // Usa o valor ou um fallback visível.
        });

        // Atualiza o texto do botão de idioma.
        if (currentLangText) {
            const suffix = langSuffixMap[lang] ?? lang.toLowerCase().split('-')[0];
            const displayKey = `lang_display_${suffix}`;
            currentLangText.textContent = pack[displayKey] ?? defaultDisplayMap[lang] ?? lang;
        }

        // Atualiza o atributo lang da página e armazena a preferência.
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLanguage', lang);

        // [MELHORIA 1] Usa a lista de botões já cacheada.
        langOptionButtons.forEach(btn => {
            btn.classList.toggle('active-lang-option', btn.dataset.lang === lang);
        });
    }

    /**
     * [MELHORIA 6] Centraliza a lógica para fechar o dropdown.
     */
    function closeDropdown() {
        if (langToggleBtn?.getAttribute('aria-expanded') === 'true') {
            langToggleBtn.setAttribute('aria-expanded', 'false');
            langOptionsList.hidden = true;
        }
    }

    /**
     * Lógica de inicialização do script.
     */
    async function initialize() {
        // Insere o ano atual no rodapé.
        if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

        // --- Event Listeners ---

        // [MELHORIA 5] Lógica de abrir/fechar dropdown com debounce simples (cooldown).
        langToggleBtn?.addEventListener('click', e => {
            if (isToggling) return;
            isToggling = true;

            e.stopPropagation();
            const isExpanded = langToggleBtn.getAttribute('aria-expanded') === 'true';
            langToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
            langOptionsList.hidden = isExpanded;

            setTimeout(() => { isToggling = false; }, 250); // Cooldown para evitar cliques rápidos.
        });

        // [MELHORIA 6] Event delegation para as opções de idioma.
        langOptionsList?.addEventListener('click', async e => {
            // [MELHORIA 4] Alvo agora é o botão para melhor acessibilidade.
            const btn = e.target.closest('button.lang-option');
            if (!btn) return;

            e.stopPropagation();
            const selectedLang = btn.dataset.lang;
            await setLanguage(selectedLang);

            closeDropdown();
            langToggleBtn.focus();
        });

        // Fecha o dropdown ao clicar fora dele.
        document.addEventListener('click', closeDropdown);

        // [MELHORIA 2] Fecha o dropdown com a tecla "Escape" para acessibilidade.
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeDropdown();
                langToggleBtn.focus(); // Devolve o foco ao botão principal.
            }
        });

        // --- Idioma Inicial ---
        const preferredLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language;
        let initialLang = 'pt-BR'; // Idioma padrão

        if (preferredLang) {
            initialLang = preferredLang;
        } else if (browserLang.startsWith('es')) {
            initialLang = 'es';
        } else if (browserLang.startsWith('en')) {
            initialLang = 'en';
        }

        await setLanguage(initialLang);
    }

    initialize();
});