document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // Preveniamo il comportamento di default (submit del form)

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.text();
            document.getElementById('registerResult').innerText = result;
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            document.getElementById('registerResult').innerText = 'Errore durante la registrazione';
        }
    });
});
