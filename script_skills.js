document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS INICIAIS ---
    const skillsData = [
        { name: "HTML5", category: "frontend", size: "medium" },
        { name: ".NET Core", category: "backend", size: "large", prominent: true },
        { name: "MongoDB", category: "database", size: "medium" },
        { name: "AWS SQS", category: "cloud", size: "medium" },
        { name: "Git", category: "devops", size: "medium" },
        { name: "CSS3", category: "frontend", size: "large", prominent: true },
        { name: "Python", category: "backend", size: "small" },
        { name: "Redis", category: "database", size: "small" },
        { name: "Azure DevOps", category: "devops", size: "large" },
        { name: "MySQL", category: "database", size: "small" },
        { name: "Java", category: "backend", size: "medium" },
        { name: "Docker", category: "devops", size: "medium" },
        { name: "JavaScript", category: "frontend", size: "large", prominent: true },
        { name: ".NET Framework", category: "backend", size: "medium" },
        { name: "SQL Server", category: "database", size: "medium" },
        { name: "Google Cloud", category: "cloud", size: "small" },
        { name: "CI/CD", category: "devops", size: "medium" },
        { name: "XUnit", category: "backend", size: "medium" },
        { name: "TypeScript", category: "frontend", size: "large", prominent: true },
        { name: "React", category: "frontend", size: "medium" },
        { name: "Azure", category: "cloud", size: "small" },
        { name: "Clean Architecture", category: "backend", size: "small" },
        { name: "REST API", category: "backend", size: "medium" },
        { name: "Angular 17+", category: "frontend", size: "medium" },
    ];

    const categories = [
        { id: "all", name: "Todas", color: "#F0A500" },
        { id: "frontend", name: "Frontend", color: "#F0A500" },
        { id: "backend", name: "Backend", color: "#F0A500" },
        { id: "database", name: "Database", color: "#F0A500" },
        { id: "cloud", name: "Cloud", color: "#F0A500" },
        { id: "devops", name: "DevOps", color: "#F0A500" }
    ];

    // --- OTIMIZAÇÃO: Cache de seletores e valores ---
    const skillsCloudContainer = document.querySelector('.skills-cloud-container');
    const skillsLegendContainer = document.querySelector('.skills-legend');
    const secondaryTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();

    // Cria um mapa para lookup O(1) das categorias, muito mais rápido que find()
    const categoryMap = categories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
    }, {});


    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderSkills() {
        // OTIMIZAÇÃO: Batch DOM updates com DocumentFragment
        const fragment = document.createDocumentFragment();

        // OTIMIZAÇÃO: Desconstrução e defaults em parâmetros
        skillsData.forEach(({ name, category, size = 'medium', prominent = false }) => {
            const skillElement = document.createElement('span');
            skillElement.classList.add('skill-item', `size-${size}`);
            // OTIMIZAÇÃO: Uso de classList.toggle com Boolean
            skillElement.classList.toggle('prominent', prominent);
            skillElement.textContent = name;
            skillElement.dataset.category = category;
            fragment.appendChild(skillElement);
        });

        skillsCloudContainer.appendChild(fragment);
    }

    function renderLegend() {
        const legendList = document.createElement('ul');
        const fragment = document.createDocumentFragment();

        categories.forEach(({ id, name, color }) => {
            const listItem = document.createElement('li');
            listItem.textContent = name;
            listItem.dataset.filter = id;
            listItem.style.setProperty('--category-color', color);

            if (id === 'all') {
                listItem.classList.add('active');
                listItem.style.color = color;
            }

            fragment.appendChild(listItem);
        });

        legendList.appendChild(fragment);
        skillsLegendContainer.appendChild(legendList);
        return legendList;
    }


    // --- LÓGICA PRINCIPAL E EVENTOS ---

    renderSkills();
    const legendList = renderLegend();

    // Cache dos itens após a renderização
    const allSkillItems = document.querySelectorAll('.skill-item');
    const allLegendItems = legendList.querySelectorAll('li');

    // OTIMIZAÇÃO: Event delegation para a legenda
    legendList.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('li');
        if (!clickedItem) return; // Sai se o clique não foi em um <li>

        const selectedCategory = clickedItem.dataset.filter;

        // Atualizar legenda
        allLegendItems.forEach(item => {
            const isClicked = item === clickedItem;
            item.classList.toggle('active', isClicked);
            // OTIMIZAÇÃO: Evitar chamadas caras dentro de loops (usa valor do cache)
            item.style.color = isClicked ? categoryMap[item.dataset.filter].color : secondaryTextColor;
        });

        // Filtrar skills
        allSkillItems.forEach(skillItem => {
            const skillCategory = skillItem.dataset.category;
            const shouldBeDimmed = selectedCategory !== 'all' && skillCategory !== selectedCategory;
            skillItem.classList.toggle('dimmed', shouldBeDimmed);
        });
    });
});