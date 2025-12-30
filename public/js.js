function abrirSection() {
    document.getElementById('login').classList.add('is-active');
}

function fecharSection() {
    document.getElementById('login').classList.remove('is-active');
}
document.addEventListener('DOMContentLoaded', () => {
    const botaoL = document.getElementById('botaoL');
    const botaoFechar = document.getElementById('botaoFechar');

    if (botaoL) {
        botaoL.addEventListener('click', abrirSection);
    } else {
        console.log("Erro")
    }

    if (botaoFechar) {
        botaoFechar.addEventListener('click', fecharSection);
    } else {
        console.log("Erro")
    }
})
