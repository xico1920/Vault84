export function createStartScreen(manager) {
  return {
    async render(username) {
      manager.root.innerHTML = `
        <div class="piece output" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4rem;padding:2.5rem;">
          <img
            src="assets/img/vault84.png"
            alt="Vault 84"
            style="display:block!important;width:auto!important;max-width:280px!important;max-height:35vh!important;object-fit:contain;"
          >
          <a id="start_game" href="#" style="font-size:1.5rem;letter-spacing:5px;border-bottom:1px solid #14fdce;padding-bottom:2px;">[ START ]</a>
          <p style="color:#3d9970;font-size:0.82rem;letter-spacing:2px;">© 1977 VOLTECH SYSTEMS</p>
        </div>
      `;
      document.getElementById("start_game").addEventListener("click", (e) => {
        e.preventDefault();
        manager.navigateTo("boot", username);
      });
    },
  };
}
