document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // Evita il refresh

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Registrazione fallita.');
            }

            const result = await response.json();

            if (result.token) {
                localStorage.setItem('token', result.token);
                document.getElementById('registerResult').innerText = 'Registrazione avvenuta con successo! Token salvato.';
                console.log('Token ricevuto:', result.token);
            } else {
                document.getElementById('registerResult').innerText = 'Registrazione completata ma nessun token ricevuto.';
            }

        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            document.getElementById('registerResult').innerText = 'Errore durante la registrazione.';
        }
    });
});
