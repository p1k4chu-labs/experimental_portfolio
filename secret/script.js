const modal = document.getElementById('modal');
const content = document.getElementById('content');
const passwordInput = document.getElementById('password');

const hashedPassword = 'e4ad93ca07acb8d908a3aa41e920ea4f4ef4f26e7f86cf8291c5db289780a5ae'; // "iloveyou"

async function checkPassword() {
    const password = passwordInput.value;
    const enteredPasswordHash = await sha256(password);

    if (enteredPasswordHash === hashedPassword) {
        modal.style.display = 'none';
        content.classList.remove('hidden');
    } else {
        alert('Incorrect password!');
    }
}

const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

passwordInput.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        checkPassword();
    }
});