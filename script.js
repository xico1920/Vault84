document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const startBtn = document.getElementById('startGameBtn');
    const popup = document.getElementById('popup');
    const confirmBtn = document.getElementById('confirmBtn');
    const playerNameInput = document.getElementById('playerName');
    const playerAgeInput = document.getElementById('playerAge');

    // Mostrar popup ao clicar no botão Start
    startBtn.addEventListener('click', function(e) {
        e.preventDefault();
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Impede scroll quando popup está aberto
    });

    // Fechar popup ao clicar fora da área de conteúdo
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    // Tecla ESC fecha o popup
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.style.display === 'flex') {
            closePopup();
        }
    });

    // Validação e confirmação
    confirmBtn.addEventListener('click', function() {
        const nome = playerNameInput.value.trim();
        const idade = playerAgeInput.value.trim();

        if (!nome) {
            alert('Please enter your name!');
            playerNameInput.focus();
            return;
        }

        if (!idade || isNaN(idade) || parseInt(idade) < 1) {
            alert('Please enter a valid age (must be a number greater than 0)!');
            playerAgeInput.focus();
            return;
        }

        // Salvar dados
        localStorage.setItem('playerName', nome);
        localStorage.setItem('playerAge', idade);

        // Redirecionar (substitua pela sua página real)
        window.location.href = 'PlayerPage.html';
    });

    // Função para fechar popup
    function closePopup() {
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Debug: Verifica se elementos existem
    console.log('Elementos carregados:', {
        startBtn,
        popup,
        confirmBtn,
        playerNameInput,
        playerAgeInput
    });
});